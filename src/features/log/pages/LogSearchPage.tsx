import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search as SearchIcon,
  UtensilsCrossed,
  Star,
  Trash2,
} from 'lucide-react';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { useTheme } from '@/shared/context/ThemeContext';
import { useNavBar } from '@/shared/context/NavBarContext';
import { food, todayApiDate } from '@/shared/api/food';
import { favorites } from '@/shared/api/favorites';
import { logFavoriteMeal } from '@/shared/lib/logFavoriteMeal';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import {
  NutritionEditGrid,
  type NutritionValues,
} from '@/shared/ui/NutritionEditGrid';
import type { FoodSearchResult } from '@/shared/types/api/food';
import type { FavoriteMeal } from '@/shared/types/api/favorites';

type Tab = 'all' | 'favorites';

function toNutrition(r: FoodSearchResult): NutritionValues {
  return {
    portion_g: r.portion_g,
    calories: r.calories,
    protein_g: r.protein_g,
    fat_g: r.fat_g,
    carbs_g: r.carbs_g,
    fiber_g: r.fiber_g,
    sugar_g: r.sugar_g,
    water_ml: r.water_ml,
  };
}

export const LogSearchPage = () => {
  const navigate = useNavigate();
  useBackButton(() => navigate(-1), true);

  const theme = useTheme();
  const { t } = useTranslation('quick_actions');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const { setHidden } = useNavBar();

  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);

  // Скрываем навбар пока открыта клавиатура — иначе он остаётся висеть
  // поверх/под клавиатурой и выглядит как лишний плавающий элемент.
  useEffect(() => () => setHidden(false), [setHidden]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await food.search(q.trim());
      setResults(data.results);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== 'all') return;
    const id = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(id);
  }, [query, tab, runSearch]);

  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => (await favorites.getAll()).data,
    enabled: tab === 'favorites',
  });

  function invalidateAfterLog() {
    const date = todayApiDate();
    queryClient.invalidateQueries({ queryKey: ['food', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'daily', date] });
    queryClient.invalidateQueries({ queryKey: ['stats', 'active-dates'] });
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }

  const {
    mutate: addFavoriteMeal,
    isPending: isAddingFavorite,
    variables: pendingFavorite,
  } = useMutation({
    mutationFn: (favorite: FavoriteMeal) => logFavoriteMeal(favorite),
    onSuccess: () => {
      invalidateAfterLog();
      navigate('/');
    },
  });

  const { mutate: removeFavorite } = useMutation({
    mutationFn: (id: number) => favorites.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const favList = favoritesData ?? [];

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>
          {t('search_sheet.title')}
        </h1>
        <SegmentedControl
          options={[
            { value: 'all', label: t('search_sheet.tab_all') },
            {
              value: 'favorites',
              label: t('search_sheet.tab_favorites'),
              icon: <Star size={13} />,
            },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'all' && (
        <>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: theme.section_bg_color }}
          >
            <SearchIcon size={16} style={{ color: theme.hint_color }} />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setHidden(true)}
              onBlur={() => setHidden(false)}
              placeholder={t('search_sheet.placeholder')}
              className="flex-1 bg-transparent text-sm"
              style={{ color: theme.text_color }}
            />
          </div>

          {isSearching && (
            <p
              className="py-4 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              {tc('loading')}
            </p>
          )}
          {!isSearching && query.trim() && results.length === 0 && (
            <p
              className="py-4 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              {t('search_sheet.empty')}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {results.map((r) => (
              <button
                key={r.food_name}
                onClick={() => setSelected(r)}
                className="flex items-center gap-3 rounded-2xl p-2.5 text-left transition-opacity active:opacity-60"
                style={{ backgroundColor: theme.section_bg_color }}
              >
                {r.photo_url ? (
                  <img
                    src={r.photo_url}
                    alt=""
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: theme.secondary_bg_color }}
                  >
                    <UtensilsCrossed
                      size={22}
                      style={{ color: theme.hint_color }}
                    />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className="truncate text-sm font-medium"
                    style={{ color: theme.text_color }}
                  >
                    {r.food_name}
                  </span>
                  <span className="text-xs" style={{ color: theme.hint_color }}>
                    {r.portion_g} {tc('units.g')}
                  </span>
                </div>
                <span
                  className="shrink-0 text-sm font-semibold"
                  style={{ color: theme.text_color }}
                >
                  {r.calories} {tc('units.kcal')}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'favorites' && (
        <div className="flex flex-col gap-2">
          {favoritesLoading ? (
            <p
              className="py-6 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              {tc('loading')}
            </p>
          ) : favList.length === 0 ? (
            <p
              className="py-6 text-center text-sm"
              style={{ color: theme.hint_color }}
            >
              {t('favorites.empty')}
            </p>
          ) : (
            favList.map((fav) => {
              const totalCalories = fav.items.reduce(
                (s, i) => s + i.calories,
                0,
              );
              const isThisPending =
                isAddingFavorite && pendingFavorite?.id === fav.id;
              return (
                <div
                  key={fav.id}
                  className="flex items-center gap-3 rounded-2xl p-2.5"
                  style={{ backgroundColor: theme.section_bg_color }}
                >
                  <button
                    onClick={() => addFavoriteMeal(fav)}
                    disabled={isAddingFavorite}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity active:opacity-60 disabled:opacity-50"
                  >
                    <div
                      className="flex size-14 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: theme.secondary_bg_color }}
                    >
                      <UtensilsCrossed
                        size={22}
                        style={{ color: theme.hint_color }}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className="truncate text-sm font-medium"
                        style={{ color: theme.text_color }}
                      >
                        {fav.meal_name}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: theme.hint_color }}
                      >
                        {isThisPending
                          ? tc('loading')
                          : `${totalCalories} ${tc('units.kcal')}`}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    aria-label={t('favorites.delete')}
                    className="shrink-0 rounded-lg p-1.5 transition-opacity active:opacity-50"
                  >
                    <Trash2
                      size={16}
                      style={{ color: theme.destructive_text_color }}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {selected && (
        <SearchResultSheet
          result={selected}
          onClose={() => setSelected(null)}
          onLogged={() => {
            invalidateAfterLog();
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

function SearchResultSheet({
  result,
  onClose,
  onLogged,
}: {
  result: FoodSearchResult;
  onClose: () => void;
  onLogged: () => void;
}) {
  const { t: tc } = useTranslation('common');
  const [values, setValues] = useState<NutritionValues>(toNutrition(result));
  const baseValues = toNutrition(result);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      food.log({
        log_date: todayApiDate(),
        items: [
          {
            food_name: result.food_name,
            portion_g: values.portion_g,
            calories: values.calories,
            protein_g: values.protein_g,
            fat_g: values.fat_g,
            carbs_g: values.carbs_g,
            fiber_g: values.fiber_g,
            sugar_g: values.sugar_g,
            water_ml: values.water_ml,
          },
        ],
        water_ml: values.water_ml > 0 ? values.water_ml : undefined,
      }),
    onSuccess: onLogged,
  });

  return (
    <BottomSheet
      title={result.food_name}
      onClose={onClose}
      actionLabel={tc('buttons.save')}
      onAction={() => mutate()}
      isProcessing={isPending}
    >
      <div className="flex flex-col gap-3 pb-1">
        {result.photo_url && (
          <img
            src={result.photo_url}
            alt=""
            className="h-40 w-full rounded-2xl object-cover"
          />
        )}
        <NutritionEditGrid
          values={values}
          baseValues={baseValues}
          onChange={setValues}
        />
      </div>
    </BottomSheet>
  );
}
