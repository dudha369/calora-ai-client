import { useNavigate } from 'react-router-dom';
import { useBackButton } from '@/shared/hooks/useBackButton.ts';

export const BodyPage = () => {
  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), true);

  return (
    <>
      BodyPage
    </>
  );
}
