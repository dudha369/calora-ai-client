import { useState, useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { Droplets, Plus, Minus, Trash2 } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { water } from '../api/water';
import { profile } from '../api/profile';
import { toApiDate } from '../utils/date';
import type { WaterByDateResponse } from '../interfaces/api/water';
import type { Profile } from '../interfaces/Profile';
import type { ProfileIn } from '../interfaces/api/profile';

// ─── Constants ───────────────────────────────────────────────────────────────

const WATER_BLUE = '#4FC3F7';

/** Быстрые кнопки — чистая вода, 1 тап */
const QUICK_AMOUNTS = [
  { ml: 150, icon: '🥃', label: 'Стакан' },
  { ml: 250, icon: '☕', label: 'Чашка' },
  { ml: 500, icon: '🍶', label: 'Бутылка' },
];

/**
 * Пресеты напитков с реальным % воды.
 * Coca-Cola — 89%, кофе — 98%, и т.д.
 * Юзер выбирает объём напитка → приложение считает сколько из этого воды.
 */
const DRINK_PRESETS = [
  { emoji: '☕', label: 'Кофе', pct: 98, defaultMl: 200 },
  { emoji: '🍵', label: 'Чай', pct: 99, defaultMl: 250 },
  { emoji: '🥛', label: 'Молоко', pct: 87, defaultMl: 250 },
  { emoji: '🧃', label: 'Сок', pct: 88, defaultMl: 200 },
  { emoji: '🥤', label: 'Газировка', pct: 89, defaultMl: 330 },
  { emoji: '🍲', label: 'Суп', pct: 92, defaultMl: 300 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Profile → ProfileIn для PUT /api/profile (нужны все обязательные поля) */
function profileToInput(p: Profile): ProfileIn {
  return {
    gender: p.gender,
    age: p.age,
    height_cm: p.height_cm,
    weight_kg: p.weight_kg,
    goal_type: p.goal_type,
    activity_level: p.activity_level,
    target_weight_kg: p.target_weight_kg,
    water_track: p.water_track,
    water_goal_ml: p.water_goal_ml,
    dietary_restrictions: p.dietary_restrictions,
    allergy_note: p.allergy_note,
    medical_conditions: p.medical_conditions,
  };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── WaterRing ───────────────────────────────────────────────────────────────

const WaterRing = ({ current, goal }: { current: number; goal: number }) => {
  const theme = useTheme();

  const R = 80;
  const STROKE = 10;
  const SIZE = (R + STROKE) * 2;
  const C = 2 * Math.PI * R;
  const progress = goal > 0 ? Math.min(current / goal, 1) : 0;
  const offset = C * (1 - progress);
  const remaining = Math.max(goal - current, 0);

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={theme.section_separator_color}
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={WATER_BLUE}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[38px] leading-tight font-bold"
            style={{ color: theme.text_color }}
          >
            {current}
          </span>
          <span className="text-sm" style={{ color: theme.hint_color }}>
            / {goal} мл
          </span>
        </div>
      </div>

      <span
        className="text-sm font-medium"
        style={{ color: remaining > 0 ? theme.subtitle_text_color : '#4ade80' }}
      >
        {remaining > 0 ? `осталось ${remaining} мл` : '🎉 Норма выполнена!'}
      </span>
    </div>
  );
};

// ─── DrinkModal (bottom-sheet) ───────────────────────────────────────────────

const DrinkModal = ({
  drink,
  onClose,
  onConfirm,
}: {
  drink: (typeof DRINK_PRESETS)[number];
  onClose: () => void;
  onConfirm: (waterMl: number) => void;
}) => {
  const theme = useTheme();
  const [volume, setVolume] = useState(drink.defaultMl);

  const waterMl = Math.round((volume * drink.pct) / 100);
  const adjust = (d: number) =>
    setVolume((v) => Math.max(50, Math.min(2000, v + d)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl px-6 pt-5 pb-8 shadow-xl"
        style={{ backgroundColor: theme.bg_color }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="text-3xl">{drink.emoji}</span>
          <div>
            <p
              className="text-lg font-bold"
              style={{ color: theme.text_color }}
            >
              {drink.label}
            </p>
            <p className="text-sm" style={{ color: theme.hint_color }}>
              {drink.pct}% воды
            </p>
          </div>
        </div>

        <p
          className="mb-2 text-sm font-medium"
          style={{ color: theme.subtitle_text_color }}
        >
          Объём напитка
        </p>

        <div className="mb-4 flex items-center justify-center gap-5">
          <button
            onClick={() => adjust(-50)}
            className="flex size-11 items-center justify-center rounded-full active:scale-90"
            style={{
              backgroundColor: theme.section_bg_color,
              transition: 'transform 0.1s',
            }}
          >
            <Minus size={18} style={{ color: theme.text_color }} />
          </button>
          <span
            className="min-w-24 text-center text-2xl font-bold"
            style={{ color: theme.text_color }}
          >
            {volume} мл
          </span>
          <button
            onClick={() => adjust(50)}
            className="flex size-11 items-center justify-center rounded-full active:scale-90"
            style={{
              backgroundColor: theme.section_bg_color,
              transition: 'transform 0.1s',
            }}
          >
            <Plus size={18} style={{ color: theme.text_color }} />
          </button>
        </div>

        <div
          className="mb-5 rounded-2xl px-4 py-3 text-center"
          style={{ backgroundColor: `${WATER_BLUE}15` }}
        >
          <span className="text-lg font-semibold" style={{ color: WATER_BLUE }}>
            💧 = {waterMl} мл воды
          </span>
        </div>

        <button
          onClick={() => onConfirm(waterMl)}
          className="w-full rounded-2xl py-3.5 text-base font-semibold active:scale-[0.98]"
          style={{
            backgroundColor: WATER_BLUE,
            color: '#fff',
            transition: 'transform 0.1s',
          }}
        >
          Добавить
        </button>
      </div>
    </div>
  );
};

// ─── CustomAmountModal ───────────────────────────────────────────────────────

const CustomAmountModal = ({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (ml: number) => void;
}) => {
  const theme = useTheme();
  const [raw, setRaw] = useState('');
  const ml = parseInt(raw) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl px-6 pt-5 pb-8 shadow-xl"
        style={{ backgroundColor: theme.bg_color }}
      >
        <p
          className="mb-4 text-lg font-bold"
          style={{ color: theme.text_color }}
        >
          ✏️ Своё количество
        </p>

        <div className="relative mb-5">
          <input
            type="number"
            inputMode="numeric"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Например, 350"
            autoFocus
            className="w-full rounded-2xl p-4 pr-16 text-lg font-medium outline-none"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.text_color,
              border: `1.5px solid ${theme.section_separator_color}`,
            }}
          />
          <span
            className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium"
            style={{ color: theme.hint_color }}
          >
            мл
          </span>
        </div>

        <button
          onClick={() => ml > 0 && onConfirm(ml)}
          disabled={ml <= 0}
          className="w-full rounded-2xl py-3.5 text-base font-semibold transition-opacity disabled:opacity-40"
          style={{ backgroundColor: WATER_BLUE, color: '#fff' }}
        >
          Добавить{ml > 0 ? ` ${ml} мл` : ''}
        </button>
      </div>
    </div>
  );
};

// ─── WaterEmptyState ─────────────────────────────────────────────────────────

const WaterEmptyState = ({
  goalMl,
  onEnable,
  isEnabling,
}: {
  goalMl: number;
  onEnable: () => void;
  isEnabling: boolean;
}) => {
  const theme = useTheme();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16">
      <div
        className="flex size-20 items-center justify-center rounded-[28px]"
        style={{ backgroundColor: `${WATER_BLUE}15` }}
      >
        <Droplets size={36} style={{ color: WATER_BLUE }} />
      </div>

      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: theme.text_color }}>
          Отслеживание воды отключено
        </p>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: theme.hint_color }}
        >
          Вода ускоряет метаболизм, улучшает кожу{'\n'}и помогает концентрации.
          {'\n'}
          Твоя норма —{' '}
          <strong style={{ color: theme.text_color }}>~{goalMl} мл</strong>/день
        </p>
      </div>

      <button
        onClick={onEnable}
        disabled={isEnabling}
        className="mt-2 rounded-2xl px-10 py-3.5 text-base font-semibold transition-opacity disabled:opacity-50"
        style={{ backgroundColor: WATER_BLUE, color: '#fff' }}
      >
        {isEnabling ? 'Включаю…' : 'Включить'}
      </button>
    </div>
  );
};

// ─── WaterPage ───────────────────────────────────────────────────────────────

export const WaterPage = () => {
  const theme = useTheme();
  const { user_data } = useUser();
  const qc = useQueryClient();

  const userProfile = user_data?.profile;
  const waterTrack = userProfile?.water_track ?? 'none';
  const goalMl = user_data?.goal?.water_ml ?? 2000;

  const today = useMemo(() => toApiDate(new Date()), []);

  // ── Data ──

  const { data } = useQuery<WaterByDateResponse>({
    queryKey: ['water', today],
    queryFn: async () => (await water.getByDate(today)).data,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled: waterTrack !== 'none',
  });

  const totalMl = data?.total_ml ?? 0;
  const logs = data?.logs ?? [];

  // ── Mutations ──

  const { mutate: addWater } = useMutation({
    mutationFn: (ml: number) => water.add({ log_date: today, amount_ml: ml }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['water', today] });
      qc.invalidateQueries({ queryKey: ['stats', 'daily', today] });
    },
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { mutate: deleteLog } = useMutation({
    mutationFn: (id: number) => water.remove(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['water', today] });
      qc.invalidateQueries({ queryKey: ['stats', 'daily', today] });
    },
  });

  // ── Enable water tracking ──

  const [isEnabling, setIsEnabling] = useState(false);
  const enableWater = async () => {
    if (!userProfile) return;
    setIsEnabling(true);
    try {
      await profile.update({
        ...profileToInput(userProfile),
        water_track: 'auto',
      });
      qc.invalidateQueries({ queryKey: ['user'] });
    } finally {
      setIsEnabling(false);
    }
  };

  // ── Modal state ──

  const [drinkModal, setDrinkModal] = useState<
    (typeof DRINK_PRESETS)[number] | null
  >(null);
  const [customOpen, setCustomOpen] = useState(false);

  // ── Empty state ──

  if (waterTrack === 'none') {
    const autoGoal = userProfile
      ? Math.max(Math.round(userProfile.weight_kg * 33), 1500)
      : 2000;
    return (
      <div className="flex h-full flex-col">
        <WaterEmptyState
          goalMl={autoGoal}
          onEnable={enableWater}
          isEnabling={isEnabling}
        />
      </div>
    );
  }

  // ── Full tracker ──

  return (
    <div className="flex flex-col gap-5 px-4 pt-2 pb-4">
      {/* ── Ring ── */}
      <WaterRing current={totalMl} goal={goalMl} />

      {/* ── Quick-add (чистая вода, 1 тап) ── */}
      <section>
        <p
          className="mb-2.5 text-sm font-semibold tracking-wide"
          style={{ color: theme.subtitle_text_color }}
        >
          Добавить воду
        </p>

        <div className="flex gap-2.5">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q.ml}
              onClick={() => addWater(q.ml)}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 active:scale-95"
              style={{
                backgroundColor: theme.section_bg_color,
                transition: 'transform 0.1s',
              }}
            >
              <span className="text-xl">{q.icon}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: theme.text_color }}
              >
                {q.ml} мл
              </span>
              <span className="text-[11px]" style={{ color: theme.hint_color }}>
                {q.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setCustomOpen(true)}
          className="mt-2 w-full py-1.5 text-center text-[13px] font-medium"
          style={{ color: WATER_BLUE }}
        >
          Другое количество
        </button>
      </section>

      {/* ── Напитки (с расчётом % воды) ── */}
      <section>
        <p
          className="mb-2.5 text-sm font-semibold tracking-wide"
          style={{ color: theme.subtitle_text_color }}
        >
          Другие напитки
        </p>

        <div className="grid grid-cols-3 gap-2.5">
          {DRINK_PRESETS.map((d) => (
            <button
              key={d.label}
              onClick={() => setDrinkModal(d)}
              className="flex flex-col items-center gap-1 rounded-2xl py-3 active:scale-95"
              style={{
                backgroundColor: theme.section_bg_color,
                transition: 'transform 0.1s',
              }}
            >
              <span className="text-xl">{d.emoji}</span>
              <span
                className="text-xs font-medium"
                style={{ color: theme.text_color }}
              >
                {d.label}
              </span>
              <span className="text-[10px]" style={{ color: theme.hint_color }}>
                {d.pct}% воды
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Лог за сегодня ── */}
      {logs.length > 0 && (
        <section>
          <p
            className="mb-2.5 text-sm font-semibold tracking-wide"
            style={{ color: theme.subtitle_text_color }}
          >
            Сегодня
          </p>

          <div
            className="flex flex-col divide-y divide-(--tg-section-separator-color) rounded-2xl"
            style={{
              backgroundColor: theme.section_bg_color,
            }}
          >
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  opacity: deletingId === log.id ? 0.35 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div className="flex items-center gap-3">
                  <Droplets size={16} style={{ color: WATER_BLUE }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.text_color }}
                  >
                    {log.amount_ml} мл
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: theme.hint_color }}>
                    {formatTime(log.logged_at)}
                  </span>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="rounded-full p-1.5 active:opacity-50"
                  >
                    <Trash2 size={14} style={{ color: theme.hint_color }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Modals ── */}
      {drinkModal && (
        <DrinkModal
          drink={drinkModal}
          onClose={() => setDrinkModal(null)}
          onConfirm={(ml) => {
            addWater(ml);
            setDrinkModal(null);
          }}
        />
      )}
      {customOpen && (
        <CustomAmountModal
          onClose={() => setCustomOpen(false)}
          onConfirm={(ml) => {
            addWater(ml);
            setCustomOpen(false);
          }}
        />
      )}
    </div>
  );
};
