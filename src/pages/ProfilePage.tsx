import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Trash2,
  Shield,
  Target,
  Sprout,
  ChartNoAxesCombinedIcon,
  Trophy,
  Settings,
} from 'lucide-react';
import { initData } from '@tma.js/sdk-react';
import { Section } from '../components/Section';
import { SectionItem } from '../components/SectionItem';
import { ModalWindow } from '../components/ModalWindow';
import { users } from '../api/users';
import { admin } from '../api/admin';

export const ProfilePage = () => {
  const { user_data } = useUser();
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const photo_url = initData.user()?.photo_url;

  // Check if current user is admin
  const { data: adminConfig } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: async () => (await admin.getConfig()).data,
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin = adminConfig?.is_admin ?? false;

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
      <section className="flex flex-col items-center gap-2 pt-6">
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
          className="text-center text-xl font-semibold tracking-wider"
          style={{ color: theme.text_color }}
        >
          {user_data?.user.full_name ?? 'Пользователь'}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        {isAdmin && (
          <Section title="Admin Panel">
            <SectionItem
              icon={<Shield size={18} />}
              label="Admin Panel"
              color={theme.button_color}
              onClick={() => navigate('/admin')}
            />
          </Section>
        )}

        <Section title="Моё тело">
          <SectionItem
            icon={<Target size={18} />}
            label="Тело и цели"
            onClick={() => {}}
          />
          <SectionItem
            icon={<Sprout size={18} />}
            label="Питание и здоровье"
            onClick={() => {}}
          />
        </Section>

        <Section title="Прогресс">
          <SectionItem
            icon={<ChartNoAxesCombinedIcon size={18} />}
            label="Динамика веса"
            onClick={() => {}}
          />
          <SectionItem
            icon={<Trophy size={18} />}
            label="Квесты и достижения"
            onClick={() => {}}
          />
        </Section>

        <Section title="Настройки">
          <SectionItem
            icon={<Settings size={18} />}
            label="Настройки"
            to="settings"
          />
        </Section>

        <Section>
          <SectionItem
            icon={<Trash2 size={18} />}
            label="Удалить аккаунт"
            color={theme.destructive_text_color}
            onClick={() => setConfirmOpen(true)}
          />
        </Section>
      </section>

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
    </div>
  );
};
