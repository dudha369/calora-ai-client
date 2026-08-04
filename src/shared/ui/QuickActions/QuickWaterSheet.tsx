import { useMutation, useQueryClient } from '@tanstack/react-query';
import { water } from '@/shared/api/water';
import { toApiDate } from '@/shared/lib/date';
import { CustomAddModal } from '@/features/water/components/CustomAdd/CustomAddModal';

interface QuickWaterSheetProps {
  onClose: () => void;
}

export const QuickWaterSheet = ({ onClose }: QuickWaterSheetProps) => {
  const queryClient = useQueryClient();
  const todayStr = toApiDate(new Date());

  const { mutate: addWater } = useMutation({
    mutationFn: (ml: number) =>
      water.add({ log_date: todayStr, amount_ml: ml }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water', todayStr] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'daily', todayStr] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
      onClose();
    },
  });

  return <CustomAddModal onClose={onClose} onConfirm={(ml) => addWater(ml)} />;
};
