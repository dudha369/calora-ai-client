import { useQuery } from '@tanstack/react-query';
import { users } from '@/shared/api/users';
import type { StreakInfo } from '@/shared/types/api/streak';
import { StreakPopup } from './StreakPopup';
import { StreakLostModal } from './StreakLostModal';

interface StreakDialogProps {
  currentStreak: number;
  onClose: () => void;
}

export const StreakDialog = ({ currentStreak, onClose }: StreakDialogProps) => {
  const { data, isLoading } = useQuery<StreakInfo>({
    queryKey: ['streak'],
    queryFn: async () => (await users.getStreak()).data,
    staleTime: 10_000,
  });

  const isLost =
    !isLoading &&
    data != null &&
    data.lost_streak_value != null &&
    data.current_streak === 0;

  if (isLost) {
    return <StreakLostModal data={data} onClose={onClose} />;
  }

  return <StreakPopup currentStreak={currentStreak} onClose={onClose} />;
};
