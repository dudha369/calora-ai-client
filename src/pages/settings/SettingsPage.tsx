import { useNavigate } from 'react-router-dom';
import { useBackButton } from '../../hooks/useBackButton.ts';

export const SettingsPage = () => {
  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), true);

  return (
    <>
      Settings
    </>
  );
};
