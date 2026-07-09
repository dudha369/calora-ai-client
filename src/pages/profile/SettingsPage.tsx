import { useNavigate } from 'react-router-dom';
import { useBackButton } from '../../hooks/useBackButton.ts';
import { SectionItem } from '../../components/Section/SectionItem.tsx';
import { SectionItemIcon } from '../../components/Section/SectionItemIcon.tsx';
import { Trash2, Check } from 'lucide-react';
import { Section } from '../../components/Section/Section.tsx';
import { useState } from 'react';
import { users } from '../../api/users.ts';
import { BottomSheet } from '../../components/BottomSheet';
import { useTheme } from '../../context/ThemeContext.ts';
import { useLanguageMode } from '../../context/LanguageContext.ts';
import { listLanguageOptions } from '../../utils/language.ts';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
  const theme = useTheme();
  const { t } = useTranslation('settings_page');
  const { language, setLanguage } = useLanguageMode();
  const languageOptions = listLanguageOptions();

  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), !confirmOpen);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await users.deleteAccount();
      queryClient.clear();
      navigate('/', { replace: true });
    } catch {
      setIsDeleting(false);
      alert(t('failed_to_delete'));
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <Section title={t('language')}>
        {languageOptions.map((opt) => (
          <SectionItem
            key={opt.code}
            icon={
              <SectionItemIcon color={`${theme.button_color}15`}>
                <span className="text-base leading-none">{opt.flag}</span>
              </SectionItemIcon>
            }
            label={opt.label}
            onClick={() => setLanguage(opt.code)}
            right={
              language === opt.code ? (
                <Check size={18} style={{ color: theme.button_color }} />
              ) : undefined
            }
          />
        ))}
      </Section>

      <Section>
        <SectionItem
          icon={<Trash2 size={18} />}
          label={t('delete_account')}
          color={theme.destructive_text_color}
          onClick={() => setConfirmOpen(true)}
        />
      </Section>

      {confirmOpen && (
        <BottomSheet
          title={t('delete_account_title')}
          onClose={() => !isDeleting && setConfirmOpen(false)}
          actionLabel={t('confirm')}
          iconCustomEmojiId="5258130763148172425"
          onAction={handleDeleteAccount}
          isProcessing={isDeleting}
          secondaryAction={{
            text: t('cancel'),
            iconCustomEmojiId: '5260342697075416641',
            position: 'left',
          }}
        >
          <p className="text-center" style={{ color: theme.text_color }}>
            {t('delete_description')}
          </p>
        </BottomSheet>
      )}
    </section>
  );
};
