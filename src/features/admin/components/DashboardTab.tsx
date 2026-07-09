import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/shared/context/ThemeContext';
import { admin, type AdminDashboard } from '@/shared/api/admin';
import {
  Users,
  UserPlus,
  Camera,
  UtensilsCrossed,
  Activity,
  Target,
  Trophy,
  XCircle,
  Loader2,
} from 'lucide-react';

export const DashboardTab = () => {
  const theme = useTheme();
  const { data, isLoading } = useQuery<AdminDashboard>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => (await admin.getDashboard()).data,
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          className="animate-spin"
          size={32}
          style={{ color: theme.hint_color }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Users size={18} />}
          label="Total Users"
          value={data.total_users}
          color="#6366f1"
        />
        <StatCard
          icon={<UserPlus size={18} />}
          label="New Today"
          value={data.new_today}
          color="#10b981"
        />
        <StatCard
          icon={<Activity size={18} />}
          label="DAU Today"
          value={data.dau}
          color="#f59e0b"
        />
        <StatCard
          icon={<Target size={18} />}
          label="Onboarding %"
          value={`${data.onboarding_rate}%`}
          color="#8b5cf6"
        />
        <StatCard
          icon={<UtensilsCrossed size={18} />}
          label="Food Logs"
          value={data.total_food_logs}
          color="#ef4444"
        />
        <StatCard
          icon={<Camera size={18} />}
          label="Photo Scans"
          value={data.total_photo_scans}
          color="#06b6d4"
        />
      </div>

      {/* Quests pie */}
      <Section title="Quests">
        <div className="flex items-center justify-around py-2">
          <QuestStat
            icon={<Target size={16} />}
            label="Active"
            value={data.quests.active}
            color="#f59e0b"
          />
          <QuestStat
            icon={<Trophy size={16} />}
            label="Done"
            value={data.quests.done}
            color="#10b981"
          />
          <QuestStat
            icon={<XCircle size={16} />}
            label="Failed"
            value={data.quests.failed}
            color="#ef4444"
          />
        </div>
      </Section>

      {/* Signups chart */}
      <Section title="Signups (30 days)">
        <MiniBarChart
          data={data.signups_by_day}
          valueKey="count"
          color="#6366f1"
        />
      </Section>

      {/* DAU trend */}
      <Section title="DAU Trend (7 days)">
        <MiniBarChart data={data.dau_trend} valueKey="dau" color="#10b981" />
      </Section>

      {/* Onboarding funnel */}
      <Section title="Onboarding Funnel">
        <div className="flex flex-col gap-1.5 py-1">
          {data.onboarding_funnel
            .filter((s) => s.count > 0)
            .map((s) => {
              const max = Math.max(
                ...data.onboarding_funnel.map((x) => x.count),
                1,
              );
              const pct = (s.count / max) * 100;
              return (
                <FunnelRow
                  key={s.step}
                  label={`Step ${s.step}`}
                  value={s.count}
                  pct={pct}
                />
              );
            })}
          {data.onboarding_funnel.every((s) => s.count === 0) && (
            <p
              className="py-2 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              No users stuck in onboarding
            </p>
          )}
        </div>
      </Section>

      {/* Extra stats */}
      <Section title="Growth">
        <div
          className="flex flex-col divide-y"
          style={{ borderColor: theme.section_separator_color }}
        >
          <InfoRow label="New this week" value={data.new_week} />
          <InfoRow label="New this month" value={data.new_month} />
          <InfoRow
            label="Completed onboarding"
            value={data.completed_onboarding}
          />
          <InfoRow label="Stuck in onboarding" value={data.stuck_onboarding} />
        </div>
      </Section>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  const theme = useTheme();
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl p-3"
      style={{ backgroundColor: theme.section_bg_color }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span
          className="text-xs font-medium"
          style={{ color: theme.hint_color }}
        >
          {label}
        </span>
      </div>
      <span className="text-2xl font-bold" style={{ color: theme.text_color }}>
        {value}
      </span>
    </div>
  );
}

function QuestStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const theme = useTheme();
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <span className="text-lg font-bold" style={{ color: theme.text_color }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: theme.hint_color }}>
        {label}
      </span>
    </div>
  );
}

function Section({
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
        className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: theme.hint_color }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}

function MiniBarChart({
  data,
  valueKey,
  color,
}: {
  data: Record<string, unknown>[];
  valueKey: string;
  color: string;
}) {
  const theme = useTheme();
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);

  return (
    <div
      className="flex items-end gap-px overflow-hidden pt-2"
      style={{ height: 80 }}
    >
      {values.map((v, i) => {
        const h = Math.max((v / max) * 100, 2);
        return (
          <div
            key={i}
            className="flex flex-1 flex-col items-center justify-end"
            style={{ height: '100%' }}
          >
            <div
              className="w-full rounded-t-sm transition-all duration-300"
              style={{
                height: `${h}%`,
                backgroundColor: v > 0 ? color : `${theme.hint_color}30`,
                minHeight: 2,
              }}
              title={`${(data[i] as Record<string, string>).date}: ${v}`}
            />
          </div>
        );
      })}
    </div>
  );
}

function FunnelRow({
  label,
  value,
  pct,
}: {
  label: string;
  value: number;
  pct: number;
}) {
  const theme = useTheme();
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-14 shrink-0 text-xs"
        style={{ color: theme.hint_color }}
      >
        {label}
      </span>
      <div
        className="h-5 flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: `${theme.hint_color}20` }}
      >
        <div
          className="flex h-full items-center rounded-full px-2"
          style={{
            width: `${Math.max(pct, 8)}%`,
            backgroundColor: '#8b5cf6',
          }}
        >
          <span className="text-xs font-semibold text-white">{value}</span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderColor: theme.section_separator_color }}
    >
      <span className="text-sm" style={{ color: theme.hint_color }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ color: theme.text_color }}
      >
        {value}
      </span>
    </div>
  );
}
