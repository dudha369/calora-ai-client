import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../../context/ThemeContext';
import { admin, type BroadcastItem } from '../../../api/admin';
import {
  Send,
  Eye,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  Users,
} from 'lucide-react';

const SEGMENTS = [
  { id: 'all', label: '🌍 All Users' },
  { id: 'active', label: '🟢 Active (7d)' },
  { id: 'inactive', label: '💤 Inactive' },
  { id: 'new', label: '🆕 New (3d)' },
  { id: 'not_onboarded', label: '⏳ Not Onboarded' },
];

export const BroadcastTab = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [text, setText] = useState('');
  const [segment, setSegment] = useState('all');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [lastResult, setLastResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const { data: historyData } = useQuery({
    queryKey: ['admin', 'broadcasts'],
    queryFn: async () => (await admin.getBroadcasts()).data,
    staleTime: 10_000,
  });

  const sendMut = useMutation({
    mutationFn: (preview: boolean) =>
      admin.sendBroadcast({
        text,
        segment,
        button_text: buttonText || undefined,
        button_url: buttonUrl || undefined,
        preview,
      }),
    onSuccess: (res, preview) => {
      const d = res.data;
      if (d.ok) {
        setLastResult({
          ok: true,
          msg: preview
            ? 'Preview sent to you!'
            : `Sending to ${d.recipients} users...`,
        });
        if (!preview) {
          setText('');
          setButtonText('');
          setButtonUrl('');
        }
      } else {
        setLastResult({ ok: false, msg: 'No recipients found' });
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      setTimeout(() => setLastResult(null), 4000);
    },
    onError: () => {
      setLastResult({ ok: false, msg: 'Failed to send' });
      setTimeout(() => setLastResult(null), 4000);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Message input */}
      <div
        className="flex flex-col gap-2 rounded-2xl p-4"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: theme.hint_color }}
        >
          Message (Markdown)
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your broadcast message..."
          rows={5}
          className="w-full resize-none rounded-xl bg-transparent p-3 text-sm outline-none"
          style={{
            color: theme.text_color,
            backgroundColor: `${theme.hint_color}10`,
          }}
        />
      </div>

      {/* Segment */}
      <div
        className="flex flex-col gap-2 rounded-2xl p-4"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: theme.hint_color }}
        >
          Audience
        </span>
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSegment(s.id)}
              className="rounded-xl px-3 py-2 text-xs font-semibold transition-all"
              style={{
                backgroundColor:
                  segment === s.id
                    ? theme.button_color
                    : `${theme.hint_color}15`,
                color:
                  segment === s.id
                    ? theme.button_text_color
                    : theme.text_color,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional button */}
      <div
        className="flex flex-col gap-2 rounded-2xl p-4"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: theme.hint_color }}
        >
          Inline Button (optional)
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Button text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="flex-1 rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
            style={{
              color: theme.text_color,
              backgroundColor: `${theme.hint_color}10`,
            }}
          />
          <input
            type="text"
            placeholder="URL"
            value={buttonUrl}
            onChange={(e) => setButtonUrl(e.target.value)}
            className="flex-1 rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
            style={{
              color: theme.text_color,
              backgroundColor: `${theme.hint_color}10`,
            }}
          />
        </div>
      </div>

      {/* Result toast */}
      {lastResult && (
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: lastResult.ok ? '#10b98120' : '#ef444420',
            color: lastResult.ok ? '#10b981' : '#ef4444',
          }}
        >
          {lastResult.ok ? <Check size={16} /> : <AlertCircle size={16} />}
          {lastResult.msg}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => sendMut.mutate(true)}
          disabled={!text.trim() || sendMut.isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-40"
          style={{
            backgroundColor: theme.section_bg_color,
            color: theme.text_color,
          }}
        >
          {sendMut.isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Eye size={16} />
          )}
          Preview
        </button>
        <button
          onClick={() => {
            if (confirm('Send broadcast to all selected users?')) {
              sendMut.mutate(false);
            }
          }}
          disabled={!text.trim() || sendMut.isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-40"
          style={{
            backgroundColor: theme.button_color,
            color: theme.button_text_color,
          }}
        >
          {sendMut.isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Send size={16} />
          )}
          Send
        </button>
      </div>

      {/* History */}
      {historyData?.broadcasts && historyData.broadcasts.length > 0 && (
        <div
          className="flex flex-col gap-1 rounded-2xl p-4"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <span
            className="pb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.hint_color }}
          >
            History
          </span>
          {historyData.broadcasts.map((b) => (
            <BroadcastRow key={b.id} broadcast={b} />
          ))}
        </div>
      )}
    </div>
  );
};

function BroadcastRow({ broadcast: b }: { broadcast: BroadcastItem }) {
  const theme = useTheme();
  const date = new Date(b.created_at);
  const dateStr = date.toLocaleDateString('ru', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColor =
    b.status === 'done'
      ? '#10b981'
      : b.status === 'sending'
        ? '#f59e0b'
        : '#6366f1';

  return (
    <div
      className="flex items-start gap-2 border-b py-2.5 last:border-0"
      style={{ borderColor: theme.section_separator_color }}
    >
      <div
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${statusColor}20` }}
      >
        {b.status === 'done' ? (
          <Check size={12} style={{ color: statusColor }} />
        ) : b.status === 'sending' ? (
          <Loader2
            size={12}
            className="animate-spin"
            style={{ color: statusColor }}
          />
        ) : (
          <Clock size={12} style={{ color: statusColor }} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate text-sm"
          style={{ color: theme.text_color }}
        >
          {b.text}
        </span>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: theme.hint_color }}
        >
          <span>{dateStr}</span>
          <span>·</span>
          <Users size={10} />
          <span>
            {b.sent}/{b.total}
          </span>
          {b.failed > 0 && (
            <span style={{ color: '#ef4444' }}>({b.failed} failed)</span>
          )}
        </div>
      </div>
    </div>
  );
}
