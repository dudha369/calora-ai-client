import type { WaterLog } from '@/shared/types/api/water';

interface WaterLogModalProps {
  log: WaterLog;
  isDeleting: boolean;
  onDelete: (logId: number) => void;
}

export const WaterLogModal = ({
  log,
  isDeleting,
  onDelete,
}: WaterLogModalProps) => {
  console.log(log, isDeleting, onDelete);

  return <></>;
};
