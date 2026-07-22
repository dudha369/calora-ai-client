import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { useMainButton } from '@/shared/hooks/useMainButton';
import { useTheme } from '@/shared/context/ThemeContext';
import { useUser } from '@/shared/context/UserContext';
import { profile } from '@/shared/api/profile';
import { profileToInput } from '@/shared/lib/profileToInput';
import { ALLERGEN_KEYS } from '@/features/home/lib/nutrition';
import { asStringDict } from '@/shared/lib/i18nDict';

export const NutritionPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user_data } = useUser();
  const { t } = useTranslation('scanner_page');
  const { t: tp } = useTranslation('profile_page');
  const { t: tc } = useTranslation('common');

  useBackButton(() => navigate('/profile'), true);

  const allergenNames = asStringDict(t('allergens', { returnObjects: true }));

  const savedAllergens = useMemo(
    () => user_data?.profile?.allergens ?? [],
    [user_data?.profile?.allergens],
  );

  const [selected, setSelected] = useState<string[]>(savedAllergens);

  const isDirty =
    selected.length !== savedAllergens.length ||
    selected.some((key) => !savedAllergens.includes(key));

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      if (!user_data?.profile) throw new Error('Profile not loaded');
      return profile.update({
        ...profileToInput(user_data.profile),
        allergens: selected,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  useMainButton({
    text: tc('buttons.save'),
    isEnabled: isDirty && !isPending,
    isVisible: isDirty,
    isLoading: isPending,
    onClick: () => save(),
  });

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>
          {tp('nutrition_page.title')}
        </h1>
        <p
          className="mt-1.5 text-sm leading-relaxed"
          style={{ color: theme.hint_color }}
        >
          {tp('nutrition_page.subtitle')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALLERGEN_KEYS.map((key) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: active
                  ? theme.button_color
                  : theme.section_bg_color,
                color: active ? theme.button_text_color : theme.text_color,
                border: `1px solid ${active ? theme.button_color : theme.section_separator_color}`,
              }}
            >
              {allergenNames[key] ?? key}
            </button>
          );
        })}
      </div>
    </div>
  );
};
