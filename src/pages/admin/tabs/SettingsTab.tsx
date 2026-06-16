import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../../context/ThemeContext';
import { admin } from '../../../api/admin';
import { Save, Loader2, Check, X, User as UserIcon } from 'lucide-react';

const FLAG_LABELS: Record<string, { label: string; description: string }> = {
  whitelist_enabled: {
    label: 'Whitelist Mode',
    description: 'Only whitelisted users can access the app',
  },
  maintenance_mode: {
    label: 'Maintenance Mode',
    description: 'Show maintenance screen to all users except admin',
  },
  registration_enabled: {
    label: 'Open Registration',
    description: 'Allow new users to register',
  },
};

const DEFAULT_FLAGS: Record<string, string> = {
  whitelist_enabled: 'false',
  maintenance_mode: 'false',
  registration_enabled: 'true',
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

  // Исходное состояние для сравнения
  const initial = useMemo(() => {
    if (!data?.settings) return DEFAULT_FLAGS;
    return { ...DEFAULT_FLAGS, ...data.settings };
  }, [data]);

  useEffect(() => {
    setLocal(initial);
  }, [initial]);

  // Есть ли изменения?
  const hasChanges = useMemo(() => {
    return Object.keys(initial).some((k) => local[k] !== initial[k]);
  }, [local, initial]);

  const saveMut = useMutation({
    mutationFn: (settings: Record<string, string>) =>
      admin.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] });
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

      {/* Whitelist — enriched cards */}
      <WhitelistSection />

      {/* Save button — only when there are flag changes */}
      {hasChanges && (
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
      )}
    </div>
  );
};

// ── Enriched Whitelist Section ────────────────────────────────────

interface WhitelistUser {
  telegram_id: number;
  full_name: string | null;
  username: string | null;
  in_db: boolean;
}

function WhitelistSection() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'whitelist'],
    queryFn: async () => (await admin.getWhitelist()).data,
  });

  const [newId, setNewId] = useState('');

  const addMut = useMutation({
    mutationFn: (id: number) => admin.addToWhitelist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] });
      setNewId('');
    },
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => admin.removeFromWhitelist(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'whitelist'] }),
  });

  const whitelist: WhitelistUser[] = data?.whitelist ?? [];

  const addId = () => {
    const trimmed = newId.trim();
    if (trimmed && /^\d+$/.test(trimmed)) {
      addMut.mutate(Number(trimmed));
    }
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
        Whitelist
      </span>

      {/* Add new ID */}
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
          disabled={addMut.isPending || !newId.trim()}
          className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{
            backgroundColor: theme.button_color,
            color: theme.button_text_color,
          }}
        >
          {addMut.isPending ? '...' : 'Add'}
        </button>
      </div>

      {/* User cards */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2
            className="animate-spin"
            size={20}
            style={{ color: theme.hint_color }}
          />
        </div>
      ) : whitelist.length > 0 ? (
        <div className="flex flex-col gap-2">
          {whitelist.map((u) => (
            <WhitelistCard
              key={u.telegram_id}
              user={u}
              onRemove={() => removeMut.mutate(u.telegram_id)}
              removing={removeMut.isPending}
            />
          ))}
        </div>
      ) : (
        <span className="text-xs" style={{ color: theme.hint_color }}>
          Whitelist is empty
        </span>
      )}
    </div>
  );
}

// ── Avatar hook — fetches via API with auth headers ─────────────

function useAvatar(telegramId: number) {
  const { data: blobUrl } = useQuery({
    queryKey: ['admin', 'avatar', telegramId],
    queryFn: async () => {
      try {
        const res = await admin.getUserAvatar(telegramId);
        const blob = new Blob([res], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
  return blobUrl ?? null;
}

// ── Color from ID — deterministic avatar bg color ───────────────

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

function colorFromId(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initialsFromName(name: string | null, id: number): string {
  if (!name || name === String(id)) return '#';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

// ── Single whitelist user card ──────────────────────────────────

function WhitelistCard({
  user,
  onRemove,
  removing,
}: {
  user: WhitelistUser;
  onRemove: () => void;
  removing: boolean;
}) {
  const theme = useTheme();
  const avatarUrl = useAvatar(user.telegram_id);
  const bgColor = colorFromId(user.telegram_id);
  const initials = initialsFromName(user.full_name, user.telegram_id);
  const hasName = user.full_name && user.full_name !== String(user.telegram_id);

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{ backgroundColor: `${theme.hint_color}10` }}
    >
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="size-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${bgColor}25` }}
        >
          {initials === '#' ? (
            <UserIcon size={18} style={{ color: bgColor }} />
          ) : (
            <span className="text-sm font-bold" style={{ color: bgColor }}>
              {initials}
            </span>
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate text-sm font-semibold"
          style={{ color: theme.text_color }}
        >
          {hasName ? user.full_name : `User ${user.telegram_id}`}
        </span>
        <span
          className="truncate text-xs"
          style={{ color: theme.hint_color }}
        >
          {user.username
            ? `@${user.username}`
            : `ID: ${user.telegram_id}`}
        </span>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={removing}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg transition-opacity active:opacity-60 disabled:opacity-30"
        style={{ backgroundColor: `${theme.destructive_text_color}15` }}
      >
        <X size={14} style={{ color: theme.destructive_text_color }} />
      </button>
    </div>
  );
}
