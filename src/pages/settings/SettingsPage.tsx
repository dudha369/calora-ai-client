import { useNavigate } from 'react-router-dom';
import { useBackButton } from '../../hooks/useBackButton.ts';
import { SectionItem } from '../../components/Section/SectionItem.tsx';
import { Trash2 } from 'lucide-react';
import { Section } from '../../components/Section/Section.tsx';
import { useState } from 'react';
import { users } from '../../api/users.ts';
import { ModalWindow } from '../../components/ModalWindow';
import { useTheme } from '../../context/ThemeContext.ts';
import { useQueryClient } from '@tanstack/react-query';

export const SettingsPage = () => {
  const theme = useTheme();

  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), true);

  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await users.deleteAccount();
      queryClient.clear();
      navigate('/', { replace: true });
    } catch {
      setIsDeleting(false);
      alert(
        'Не удалось удалить аккаунт. Проверь соединение и попробуй ещё раз.',
      );
    }
  };

  return (
    <>
      <Section>
        <SectionItem
          icon={<Trash2 size={18} />}
          label="Удалить аккаунт"
          color={theme.destructive_text_color}
          onClick={() => setConfirmOpen(true)}
        />
      </Section>

      {confirmOpen && (
        <ModalWindow
          title="Удалить аккаунт?"
          onClose={() => !isDeleting && setConfirmOpen(false)}
          actionLabel="Подтвердить"
          iconCustomEmojiId="5258130763148172425"
          onAction={handleDeleteAccount}
          isProcessing={isDeleting}
        >
          <p className="text-center" style={{ color: theme.text_color }}>
            Это действие необратимо. Будут удалены профиль, история питания,
            фото, квесты и все остальные данные. Чтобы продолжить пользоваться
            приложением, нужно будет пройти регистрацию заново.
          </p>
        </ModalWindow>
      )}
    </>
  );
};
