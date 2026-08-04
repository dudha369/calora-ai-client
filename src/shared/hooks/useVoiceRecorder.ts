import { useCallback, useRef, useState } from 'react';
import { blobToWav } from '@/shared/lib/audioToWav';

export type RecorderState = 'idle' | 'recording' | 'processing';

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<'mic_denied' | 'processing_failed' | null>(
    null,
  );
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  // Экспоненциально сглаженное значение — без этого кольцо анимации
  // дёргается на каждый кадр вслед за сырым RMS с микрофона.
  const smoothedVolumeRef = useRef(0);

  const stopVolumeTracking = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    smoothedVolumeRef.current = 0;
    setVolume(0);
  }, []);

  const startVolumeTracking = useCallback((stream: MediaStream) => {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioCtx = new AudioContextCtor();
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    smoothedVolumeRef.current = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      const target = Math.min(1, rms * 4);
      smoothedVolumeRef.current += (target - smoothedVolumeRef.current) * 0.25;
      setVolume(smoothedVolumeRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState('recording');
      startVolumeTracking(stream);
      return true;
    } catch {
      setError('mic_denied');
      return false;
    }
  }, [startVolumeTracking]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      stopVolumeTracking();
      if (!recorder) {
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        setState('processing');
        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          const wavBlob = await blobToWav(blob);
          resolve(wavBlob);
        } catch {
          setError('processing_failed');
          resolve(null);
        } finally {
          setState('idle');
        }
      };

      recorder.stop();
    });
  }, [stopVolumeTracking]);

  const cancel = useCallback(() => {
    stopVolumeTracking();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setState('idle');
  }, [stopVolumeTracking]);

  return { state, error, volume, start, stop, cancel };
}
