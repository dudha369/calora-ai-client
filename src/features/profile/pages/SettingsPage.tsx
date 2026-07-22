import { useNavigate } from 'react-router-dom';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { SectionItem } from '@/shared/ui/Section/SectionItem';
import { SectionItemIcon } from '@/shared/ui/Section/SectionItemIcon';
import {
  type LucideIcon,
  Monitor,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { Section } from '@/shared/ui/Section/Section';
import { useState, useRef, useEffect } from 'react';
import { users } from '@/shared/api/users';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useTheme } from '@/shared/context/ThemeContext';
import { useThemeMode } from '@/shared/context/ThemeContext';
import { useLanguageMode } from '@/shared/context/LanguageContext';
import { listLanguageOptions } from '@/shared/lib/language';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { ThemeMode } from '@/shared/types/Theme';

export const SettingsPage = () => {
  const theme = useTheme();
  const { t } = useTranslation('settings_page');
  const { mode, setMode } = useThemeMode();
  const { language, setLanguage } = useLanguageMode();
  const languageOptions = listLanguageOptions();
  const queryClient = useQueryClient();

  const [accountDeleteConfirmOpen, setAccountDeleteConfirmOpen] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), !accountDeleteConfirmOpen);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langDropdownOpen]);

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

  const themeOptions: { key: ThemeMode; label: string; icon: LucideIcon }[] = [
    { key: 'telegram', label: t('theme_auto'), icon: Monitor },
    { key: 'light', label: t('theme_light'), icon: Sun },
    { key: 'dark', label: t('theme_dark'), icon: Moon },
  ];

  const currentLang = languageOptions.find((o) => o.code === language);

  return (
    <div className="flex flex-col gap-4 px-4">
      <Section title={t('theme')}>
        {themeOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = mode === opt.key;
          return (
            <SectionItem
              key={opt.key}
              icon={
                <SectionItemIcon
                  icon={Icon}
                  backgroundColor={
                    isActive ? theme.button_color : `${theme.hint_color}25`
                  }
                />
              }
              label={opt.label}
              onClick={() => setMode(opt.key)}
              right={
                isActive ? (
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: theme.button_color }}
                  />
                ) : undefined
              }
            />
          );
        })}
      </Section>

      <Section>
        <div ref={dropdownRef} className="relative">
          <SectionItem
            icon={<SectionItemIcon icon={Globe} backgroundColor="#007AFF" />}
            label={t('language')}
            onClick={() => setLangDropdownOpen((prev) => !prev)}
            right={
              <div className="flex items-center gap-1.5">
                <span className="text-sm" style={{ color: theme.hint_color }}>
                  {currentLang?.label ?? language}
                </span>
                <ChevronDown
                  size={16}
                  style={{
                    color: theme.hint_color,
                    transform: langDropdownOpen
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>
            }
          />

          <div
            className="overflow-hidden transition-all duration-200 ease-out"
            style={{
              maxHeight: langDropdownOpen
                ? `${languageOptions.length * 52}px`
                : '0px',
              opacity: langDropdownOpen ? 1 : 0,
            }}
          >
            {languageOptions.map((opt) => {
              const isActive = language === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLanguage(opt.code);
                    setLangDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-3.5 px-4 py-3 transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? `${theme.button_color}12`
                      : 'transparent',
                  }}
                >
                  <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg text-base">
                    {opt.flag}
                  </span>
                  <span
                    className="text-base"
                    style={{
                      color: isActive ? theme.button_color : theme.text_color,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </span>
                  {isActive && (
                    <div
                      className="ml-auto h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: theme.button_color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section>
        <SectionItem
          icon={
            <SectionItemIcon
              icon={Trash2}
              color={theme.destructive_text_color}
            />
          }
          label={t('delete_account')}
          color={theme.destructive_text_color}
          onClick={() => setAccountDeleteConfirmOpen(true)}
        />
      </Section>

      {accountDeleteConfirmOpen && (
        <BottomSheet
          title={t('delete_account_title')}
          onClose={() => !isDeleting && setAccountDeleteConfirmOpen(false)}
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
    </div>
  );
};
