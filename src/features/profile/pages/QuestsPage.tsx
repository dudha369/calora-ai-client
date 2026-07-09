import { useNavigate } from 'react-router-dom';
import { useBackButton } from '@/shared/hooks/useBackButton.ts';

export const QuestsPage = () => {
  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), true);

  return (
    <>
      QuestsPage
    </>
  );
};
