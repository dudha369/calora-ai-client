import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import {
  admin,
  type AdminUser,
  type AdminUserList,
  type AdminUserDetail,
} from '../../api/admin';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Loader2,
  Flame,
} from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'onboarded', label: 'Onboarded' },
  { id: 'stuck', label: 'Stuck' },
  { id: 'active_today', label: 'Active' },
];

interface UsersTabProps {
  selectedUserId: number | null;
  onSelectUser: (id: number | null) => void;
}

export const UsersTab = ({ selectedUserId, onSelectUser }: UsersTabProps) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<AdminUserList>({
    queryKey: ['admin', 'users', search, filter, page],
    queryFn: async () => (await admin.getUsers({ search, filter, page })).data,
    staleTime: 15_000,
  });

  if (selectedUserId) {
    return (
      <UserDetailView
        userId={selectedUserId}
        onBack={() => {
          onSelectUser(null);
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <Search size={16} style={{ color: theme.hint_color }} />
        <input
          type="text"
          placeholder="Search by name, username, or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: theme.text_color }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setPage(1);
            }}
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              backgroundColor:
                filter === f.id ? theme.button_color : theme.section_bg_color,
              color:
                filter === f.id ? theme.button_text_color : theme.hint_color,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2
            className="animate-spin"
            size={24}
            style={{ color: theme.hint_color }}
          />
        </div>
      ) : (
        <div
          className="flex flex-col divide-y rounded-2xl"
          style={{
            backgroundColor: theme.section_bg_color,
            borderColor: theme.section_separator_color,
          }}
        >
          {data?.users.map((u) => (
            <UserRow
              key={u.telegram_id}
              user={u}
              onClick={() => onSelectUser(u.telegram_id)}
            />
          ))}
          {data?.users.length === 0 && (
            <p
              className="py-6 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              No users found
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg p-1.5 transition-opacity disabled:opacity-30"
            style={{ color: theme.text_color }}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm" style={{ color: theme.hint_color }}>
            {page} / {data.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(data.pages, page + 1))}
            disabled={page >= data.pages}
            className="rounded-lg p-1.5 transition-opacity disabled:opacity-30"
            style={{ color: theme.text_color }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── User row ────────────────────────────────────────────────────────

function UserRow({ user, onClick }: { user: AdminUser; onClick: () => void }) {
  const theme = useTheme();
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 text-left transition-opacity active:opacity-70"
      style={{ borderColor: theme.section_separator_color }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={{
          backgroundColor: `${theme.button_color}20`,
          color: theme.button_color,
        }}
      >
        {user.full_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className="truncate text-sm font-semibold"
            style={{ color: theme.text_color }}
          >
            {user.full_name}
          </span>
          {user.in_whitelist && (
            <Shield size={12} className="shrink-0 text-green-500" />
          )}
        </div>
        <span className="text-xs" style={{ color: theme.hint_color }}>
          {user.username ? `@${user.username}` : `ID: ${user.telegram_id}`}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {user.onboarded ? (
          <CheckCircle2 size={14} className="text-green-500" />
        ) : (
          <Clock size={14} style={{ color: theme.hint_color }} />
        )}
        {user.current_streak > 0 && (
          <div className="flex items-center gap-0.5">
            <Flame size={11} className="text-orange-400" />
            <span className="text-xs" style={{ color: theme.hint_color }}>
              {user.current_streak}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

// ── User detail ─────────────────────────────────────────────────────

function UserDetailView({
  userId,
  onBack,
}: {
  userId: number;
  onBack: () => void;
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AdminUserDetail>({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => (await admin.getUserDetail(userId)).data,
  });

  const resetMut = useMutation({
    mutationFn: () => admin.resetUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => admin.deleteUser(userId),
    onSuccess: () => onBack(),
  });

  const whitelistAdd = useMutation({
    mutationFn: () => admin.addToWhitelist(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
    },
  });

  const whitelistRemove = useMutation({
    mutationFn: () => admin.removeFromWhitelist(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
    },
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-center py-10">
          <Loader2
            className="animate-spin"
            size={24}
            style={{ color: theme.hint_color }}
          />
        </div>
      </div>
    );
  }

  const u = data.user;
  const p = data.profile;
  const g = data.goal;

  return (
    <div className="flex flex-col gap-3">
      {/* User header */}
      <div
        className="flex flex-col items-center gap-2 rounded-2xl py-4"
        style={{ backgroundColor: theme.section_bg_color }}
      >
        <div
          className="flex size-16 items-center justify-center rounded-full text-2xl font-bold"
          style={{
            backgroundColor: `${theme.button_color}20`,
            color: theme.button_color,
          }}
        >
          {u.full_name.charAt(0).toUpperCase()}
        </div>
        <span className="text-lg font-bold" style={{ color: theme.text_color }}>
          {u.full_name}
        </span>
        <span className="text-xs" style={{ color: theme.hint_color }}>
          {u.username ? `@${u.username} · ` : ''}ID: {u.telegram_id}
        </span>
        <div className="flex gap-4 pt-1">
          <MiniStat label="Streak" value={u.current_streak} />
          <MiniStat label="Max" value={u.max_streak} />
          <MiniStat label="Quests" value={u.quests_completed} />
        </div>
      </div>

      {/* Profile */}
      {p && (
        <DetailSection title="Profile">
          <KV label="Gender" value={String(p.gender)} />
          <KV label="Birthday" value={String(p.birth_date)} />
          <KV label="Height" value={`${p.height_cm} cm`} />
          <KV label="Weight" value={`${p.weight_kg} kg`} />
          <KV label="Goal" value={String(p.goal_type)} />
          <KV label="Activity" value={String(p.activity_level)} />
          {p.target_weight_kg && (
            <KV label="Target" value={`${p.target_weight_kg} kg`} />
          )}
        </DetailSection>
      )}

      {/* Goals */}
      {g && (
        <DetailSection title="Daily Goals">
          <KV label="Calories" value={`${g.calories} kcal`} />
          <KV label="Protein" value={`${g.protein_g}g`} />
          <KV label="Fat" value={`${g.fat_g}g`} />
          <KV label="Carbs" value={`${g.carbs_g}g`} />
          <KV label="Water" value={`${g.water_ml} ml`} />
        </DetailSection>
      )}

      {/* Food logs */}
      {data.food_logs.length > 0 && (
        <DetailSection title={`Food Logs (${data.food_logs.length})`}>
          {data.food_logs.map((fl) => (
            <div
              key={fl.id}
              className="flex flex-col gap-0.5 border-b py-2 last:border-0"
              style={{ borderColor: theme.section_separator_color }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: theme.hint_color }}>
                  {fl.log_date}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: theme.text_color }}
                >
                  {fl.total_calories} kcal
                </span>
              </div>
              {fl.items.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs"
                  style={{ color: theme.subtitle_text_color }}
                >
                  • {item.food_name} ({item.portion_g}g, {item.calories} kcal)
                </span>
              ))}
            </div>
          ))}
        </DetailSection>
      )}

      {/* Quests */}
      {data.quests.length > 0 && (
        <DetailSection title="Quests">
          {data.quests.map((q, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <span>{q.icon}</span>
              <span
                className="flex-1 text-sm"
                style={{ color: theme.text_color }}
              >
                {q.title}
              </span>
              <span
                className="rounded-lg px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor:
                    q.status === 'done'
                      ? '#10b98120'
                      : q.status === 'failed'
                        ? '#ef444420'
                        : '#f59e0b20',
                  color:
                    q.status === 'done'
                      ? '#10b981'
                      : q.status === 'failed'
                        ? '#ef4444'
                        : '#f59e0b',
                }}
              >
                {q.current_value}/{q.target_value}
              </span>
            </div>
          ))}
        </DetailSection>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() =>
            u.in_whitelist ? whitelistRemove.mutate() : whitelistAdd.mutate()
          }
          disabled={whitelistAdd.isPending || whitelistRemove.isPending}
          className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
          style={{
            backgroundColor: theme.section_bg_color,
            color: u.in_whitelist ? '#f59e0b' : '#10b981',
          }}
        >
          {u.in_whitelist ? (
            <>
              <ShieldOff size={16} /> Remove from Whitelist
            </>
          ) : (
            <>
              <Shield size={16} /> Add to Whitelist
            </>
          )}
        </button>

        <button
          onClick={() => resetMut.mutate()}
          disabled={resetMut.isPending}
          className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
          style={{
            backgroundColor: theme.section_bg_color,
            color: '#f59e0b',
          }}
        >
          <RotateCcw size={16} />
          {resetMut.isPending ? 'Resetting...' : 'Reset to Onboarding'}
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-opacity active:opacity-70"
            style={{
              backgroundColor: `${theme.destructive_text_color}15`,
              color: theme.destructive_text_color,
            }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold"
              style={{
                backgroundColor: theme.section_bg_color,
                color: theme.text_color,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMut.mutate()}
              disabled={deleteMut.isPending}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: theme.destructive_text_color }}
            >
              {deleteMut.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function MiniStat({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold" style={{ color: theme.text_color }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: theme.hint_color }}>
        {label}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl p-3"
      style={{ backgroundColor: theme.section_bg_color }}
    >
      <span
        className="pb-1 text-xs font-semibold tracking-wider uppercase"
        style={{ color: theme.hint_color }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm" style={{ color: theme.hint_color }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: theme.text_color }}>
        {value}
      </span>
    </div>
  );
}
