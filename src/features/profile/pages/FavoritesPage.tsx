import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { useTheme } from '@/shared/context/ThemeContext';
import { favorites } from '@/shared/api/favorites';
import { logFavoriteMeal } from '@/shared/lib/logFavoriteMeal';
import type { FavoriteMeal } from '@/shared/types/api/favorites';
import { Skeleton } from '@/shared/ui/Skeleton';

export const FavoritesPage = () => {
  const navigate = useNavigate();
  useBackButton(() => navigate('/profile'), true);

  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => (await favorites.getAll()).data,
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  const { mutate: removeFavorite } = useMutation({
    mutationFn: (id: number) => favorites.remove(id),
    onMutate: (id: number) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const { mutate: addToToday } = useMutation({
    mutationFn: (favorite: FavoriteMeal) => logFavoriteMeal(favorite),
    onMutate: (favorite: FavoriteMeal) => setAddingId(favorite.id),
    onSettled: () => setAddingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const list = data ?? [];

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
      <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>
        {t('favorites.title')}
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : list.length === 0 ? (
        <p
          className="py-10 text-center text-sm"
          style={{ color: theme.hint_color }}
        >
          {t('favorites.empty')}
        </p>
      ) : (
        <div
          className="flex flex-col divide-y divide-(--tg-section-separator-color) rounded-2xl"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          {list.map((fav) => {
            const totalCalories = fav.items.reduce((s, i) => s + i.calories, 0);
            return (
              <div
                key={fav.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ opacity: deletingId === fav.id ? 0.5 : 1 }}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.secondary_bg_color }}
                >
                  <UtensilsCrossed
                    size={18}
                    style={{ color: theme.hint_color }}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className="truncate text-sm font-semibold"
                    style={{ color: theme.text_color }}
                  >
                    {fav.meal_name}
                  </span>
                  <span className="text-xs" style={{ color: theme.hint_color }}>
                    {totalCalories} {tc('units.kcal')}
                  </span>
                </div>

                <button
                  onClick={() => addToToday(fav)}
                  disabled={addingId === fav.id}
                  aria-label={t('favorites.add_today')}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70 disabled:opacity-40"
                  style={{
                    backgroundColor: theme.button_color,
                    color: theme.button_text_color,
                  }}
                >
                  <Plus size={16} />
                </button>

                <button
                  onClick={() => removeFavorite(fav.id)}
                  disabled={deletingId === fav.id}
                  aria-label={t('favorites.delete')}
                  className="rounded-lg p-1.5 transition-opacity active:opacity-50"
                >
                  <Trash2
                    size={16}
                    style={{ color: theme.destructive_text_color }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
