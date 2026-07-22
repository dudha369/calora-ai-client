import { useTranslation } from 'react-i18next';
import { GlassWater, Coffee, Milk, Icon } from 'lucide-react';
import { bottlePlastic } from '@lucide/lab';
import { useTheme } from '@/shared/context/ThemeContext';
import { Section } from '@/shared/ui/Section/Section';
import { ProgressBar } from '../components/ProgressBar';
import { QuickAddButton } from '../components/QuickAddButton';
import { CustomAddButton } from '../components/CustomAdd/CustomAddButton';
import { CustomAddModal } from '../components/CustomAdd/CustomAddModal';
import { WaterJug } from '@/features/water/components/WaterJug';
import { useUser } from '@/shared/context/UserContext';
import { useCallback, useMemo, useState } from 'react';
import { toApiDate } from '@/shared/lib/date';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { WaterByDateResponse, WaterLog } from '@/shared/types/api/water';
import { water } from '@/shared/api/water';
import { MARKER_WATER_COLOR } from '@/shared/constants/markers';
import { WaterLogList } from '@/features/water/components/WaterLog/WaterLogList';
import { WaterLogModal } from '@/features/water/components/WaterLog/WaterLogModal';
import { food } from '@/shared/api/food.ts';

export const WaterPage = () => {
  const theme = useTheme();
  const { t } = useTranslation('water_page');
  const { t: tc } = useTranslation('common');
  const { user_data } = useUser();

  const userProfile = user_data?.profile;
  const waterTrack = userProfile?.water_track ?? 'none';
  const goalMl = user_data?.goal?.water_ml ?? 0;
  const today = useMemo(() => toApiDate(new Date()), []);

  const [customAddOpen, setCustomAddOpen] = useState(false);
  const [waterLogModalOpen, setWaterLogModalOpen] = useState(false);
  const [currentWaterLog, setCurrentWaterLog] = useState<
    WaterLog | undefined
  >();
  const [foodLogDeleting, setWaterLogDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { mutate: deleteLog } = useMutation({
    mutationFn: (logId: number) => food.remove(logId),
    onMutate: (logId: number) => {
      setDeletingId(logId);
      setWaterLogDeleting(true);
    },
    onSettled: () => {
      setDeletingId(null);
      setWaterLogDeleting(false);
    },
    onSuccess: () => {
      setWaterLogModalOpen(false);
    },
  });

  const onClick = useCallback((log: WaterLog) => {
    setCurrentWaterLog(log);
    setWaterLogModalOpen(true);
  }, []);

  const { data, isLoading: waterLoading } = useQuery<WaterByDateResponse>({
    queryKey: ['water', today],
    queryFn: async () => (await water.getByDate(today)).data,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled: waterTrack !== 'none',
  });

  const logs = data?.logs ?? [];
  const totalMl = data?.total_ml ?? 0;
  const remainMl = Math.max(goalMl - totalMl, 0);

  const percent = goalMl > 0 ? Math.round((totalMl * 100) / goalMl) : 0;
  const displayPercent = percent > 100 ? 100 : percent;

  return (
    <div className="flex flex-col gap-3 px-4 py-2">
      <Section className="relative overflow-hidden p-4">
        <div className="relative z-10 flex w-[65%] flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span
              className="text-sm font-medium"
              style={{ color: theme.hint_color }}
            >
              {t('today_progress')}
            </span>

            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-bold tracking-tight"
                style={{ color: MARKER_WATER_COLOR }}
              >
                {totalMl}
              </span>
              <span
                className="text-xl font-medium"
                style={{ color: MARKER_WATER_COLOR }}
              >
                {tc('units.ml')}
              </span>
            </div>

            <span
              className="text-sm font-medium"
              style={{ color: theme.text_color }}
            >
              {t('of')} {goalMl} {tc('units.ml')} {t('goal')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar current={totalMl} goal={goalMl} />
            </div>

            <span
              className="text-sm font-medium"
              style={{ color: theme.text_color }}
            >
              {displayPercent}%
            </span>
          </div>

          <span
            className="w-fit rounded-xl px-3 py-2 text-xs font-medium"
            style={{
              backgroundColor: theme.button_color,
              color: theme.button_text_color,
            }}
          >
            {remainMl} {tc('units.ml')} {t('left')}
          </span>
        </div>

        <div className="absolute inset-y-0 right-4 z-0 flex w-[35%] items-center justify-end opacity-90">
          <WaterJug
            valueMl={totalMl}
            goalMl={goalMl}
            waterColor={MARKER_WATER_COLOR}
            className="h-full w-full max-w-28"
          />
        </div>
      </Section>

      <div className="flex flex-col gap-1">
        <span
          className="ml-1 text-base font-semibold"
          style={{ color: theme.subtitle_text_color }}
        >
          {t('quick_add')}
        </span>

        <section className="grid grid-cols-5 gap-2">
          <QuickAddButton icon={GlassWater} volume={250} title={t('glass')} />
          <QuickAddButton icon={Coffee} volume={350} title={t('cup')} />
          <QuickAddButton icon={Milk} volume={500} title={t('bottle')} />
          <QuickAddButton
            icon={(props) => <Icon iconNode={bottlePlastic} {...props} />}
            volume={750}
            title={t('bottle')}
          />

          <CustomAddButton onClick={() => setCustomAddOpen(true)} />
        </section>
      </div>

      <div className="flex flex-col gap-1">
        <span
          className="ml-1 text-base font-semibold tracking-wide"
          style={{ color: theme.subtitle_text_color }}
        >
          {t('today_logs')}
        </span>

        {logs.length > 0 ? (
          <WaterLogList
            logs={logs}
            isLoading={waterLoading}
            deletingId={deletingId}
            onWaterLogCardClick={onClick}
          />
        ) : null}
      </div>

      {customAddOpen && <CustomAddModal />}
      {waterLogModalOpen && currentWaterLog && (
        <WaterLogModal
          log={currentWaterLog}
          isDeleting={foodLogDeleting}
          onDelete={deleteLog}
        />
      )}
    </div>
  );
};
