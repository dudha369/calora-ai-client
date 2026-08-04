/**
 * Конвертирует записанный браузером аудио-blob (webm/opus на Android,
 * mp4/aac на iOS Safari и т.д.) в WAV (PCM) через Web Audio API.
 *
 * Зачем: Gemini официально гарантирует поддержку только WAV/MP3/AIFF/AAC/
 * OGG/FLAC, webm там не упомянут, хотя это дефолт MediaRecorder на Chrome/
 * Android. WAV — единственный формат без вопросов: несжатый PCM,
 * декодируется браузером из ЛЮБОГО кодека, который сам браузер умеет
 * проигрывать (AudioContext.decodeAudioData), так что пересборка в WAV
 * работает одинаково на всех платформах без сторонних библиотек.
 */
export async function blobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioContextCtor();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return encodeWav(audioBuffer);
  } finally {
    await audioCtx.close();
  }
}

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;

  // Интерливим каналы и конвертируем float32 [-1, 1] → int16 PCM
  const interleaved = new Int16Array(numFrames * numChannels);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < numFrames; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      interleaved[i * numChannels + ch] =
        sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
  }

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = interleaved.length * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    view.setInt16(offset, interleaved[i], true);
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
