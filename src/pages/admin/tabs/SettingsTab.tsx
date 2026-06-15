import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../../context/ThemeContext';
import { admin } from '../../../api/admin';
import { Save, Loader2, Check } from 'lucide-react';

const FLAG_LABELS: Record<string, { label: string; description: string }> = {
  whitelist_enabled: {
    label: 'Whitelist Mode',
    description: 'Only whitelisted users can access the app',
  },
  maintenance_mode: {
    label: 'Maintenance Mode',
    description: 'Show maintenance screen to all users except admin',
  },
  registration_open: {
    label: 'Open Registration',
    description: 'Allow new users to register',
  },
};

const DEFAULT_FLAGS: Record<string, string> = {
  whitelist_enabled: 'false',
  maintenance_mode: 'false',
  registration_open: 'true',
};

export const SettingsTab = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await admin.getSettings()).data,
  });

  const [local, setLocal] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setLocal({ ...DEFAULT_FLAGS, ...data.settings });
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (settings: Record<string, string>) =>
      admin.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2
          className="animate-spin"
          size={32}
          style={{ color: theme.hint_color }}
        />
      </div>
    );
  }

  const toggleFlag = (key: string) => {
    const current = local[key] ?? 'false';
    const next = current === 'true' ? 'false' : 'true';
    setLocal((prev) => ({ ...prev, [key]: next }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Feature flags */}
      <div
        className="flex flex-col divide-y rounded-2xl"
        style={{
          backgroundColor: theme.section_bg_color,
          borderColor: theme.section_separator_color,
        }}
      >
        {Object.entries(FLAG_LABELS).map(([key, meta]) => {
          const isOn = local[key] === 'true';
          return (
            <div
              key={key}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderColor: theme.section_separator_color }}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="text-sm font-semibold"
                  style={{ color: theme.text_color }}
                >
                  {meta.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: theme.hint_color }}
                >
                  {meta.description}
                </span>
              </div>
              <button
                onClick={() => toggleFlag(key)}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: isOn ? '#10b981' : `${theme.hint_color}40`,
                }}
              >
                <span
                  className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200"
                  style={{
                    transform: isOn ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Whitelist IDs */}
      <WhitelistEditor
        value={local.whitelist_ids ?? ''}
        onChange={(v) => setLocal((prev) => ({ ...prev, whitelist_ids: v }))}
      />

      {/* Save button */}
      <button
        onClick={() => saveMut.mutate(local)}
        disabled={saveMut.isPending}
        className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
        style={{
          backgroundColor: saved ? '#10b981' : theme.button_color,
          color: theme.button_text_color,
        }}
      >
        {saveMut.isPending ? (
          <Loader2 className="animate-spin" size={16} />
        ) : saved ? (
          <Check size={16} />
        ) : (
          <Save size={16} />
        )}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
};

// ── Whitelist editor ────────────────────────────────────────────────

function WhitelistEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const theme = useTheme();

  const ids = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const [newId, setNewId] = useState('');

  const addId = () => {
    const trimmed = newId.trim();
    if (trimmed && !ids.includes(trimmed)) {
      const updated = [...ids, trimmed].join(',');
      onChange(updated);
    }
    setNewId('');
  };

  const removeId = (id: string) => {
    const updated = ids.filter((x) => x !== id).join(',');
    onChange(updated);
  };

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4"
      style={{ backgroundColor: theme.section_bg_color }}
    >
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: theme.hint_color }}
      >
        Whitelist IDs
      </span>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Telegram ID"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addId()}
          className="flex-1 rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
          style={{
            color: theme.text_color,
            backgroundColor: `${theme.hint_color}15`,
          }}
        />
        <button
          onClick={addId}
          className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold"
          style={{
            backgroundColor: theme.button_color,
            color: theme.button_text_color,
          }}
        >
          Add
        </button>
      </div>

      {ids.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ids.map((id) => (
            <span
              key={id}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${theme.button_color}15`,
                color: theme.text_color,
              }}
            >
              {id}
              <button
                onClick={() => removeId(id)}
                className="text-xs opacity-60 hover:opacity-100"
                style={{ color: theme.destructive_text_color }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {ids.length === 0 && (
        <span className="text-xs" style={{ color: theme.hint_color }}>
          No IDs in whitelist
        </span>
      )}
    </div>
  );
}
