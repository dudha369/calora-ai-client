import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { User, Trash2 } from 'lucide-react';
import { initData } from '@telegram-apps/sdk-react';
import { Section } from '../components/Section';
import { SectionItem } from '../components/SectionItem';
import { ModalWindow } from '../components/ModalWindow';
import { users } from '../api/users';

export const ProfilePage = () => {
  const { user_data } = useUser();
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const photo_url = initData.user()?.photoUrl;

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
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-1 pt-6">
        <div
          className="flex size-24 items-center justify-center rounded-full"
          style={{ backgroundColor: `${theme.button_color}20` }}
        >
          {photo_url ? (
            <img
              src={photo_url}
              className="h-full w-full rounded-full"
              alt="User photo"
            />
          ) : (
            <User size={48} style={{ color: theme.button_color }} />
          )}
        </div>
        <p
          className="text-center text-xl font-semibold"
          style={{ color: theme.text_color }}
        >
          {user_data?.user.full_name ?? 'Пользователь'}
        </p>
      </section>

      <Section>
        <SectionItem />
        <SectionItem />
        <SectionItem />
        <SectionItem />
      </Section>

      <Section>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center justify-between px-4 py-3"
          style={{ color: theme.destructive_text_color }}
        >
          <div className="flex items-center gap-3">
            <Trash2 size={18} />
            <span>Удалить аккаунт</span>
          </div>
        </button>
      </Section>

      {confirmOpen && (
        <ModalWindow
          title="Удалить аккаунт?"
          onClose={() => !isDeleting && setConfirmOpen(false)}
          actionLabel="Удалить навсегда"
          onAction={handleDeleteAccount}
          isProcessing={isDeleting}
        >
          <p
            className="py-2 text-center text-sm"
            style={{ color: theme.subtitle_text_color }}
          >
            Это действие необратимо. Будут удалены профиль, история питания,
            фото, квесты и все остальные данные. Чтобы продолжить пользоваться
            приложением, нужно будет пройти онбординг заново.
          </p>
        </ModalWindow>
      )}
    </div>
  );
};
