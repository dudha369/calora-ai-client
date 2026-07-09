import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { LayoutDashboard, Users, Settings, Megaphone } from 'lucide-react';
import { DashboardTab } from '../components/DashboardTab';
import { UsersTab } from '../components/UsersTab';
import { SettingsTab } from '../components/SettingsTab';
import { BroadcastTab } from '../components/BroadcastTab';

const TABS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Users', icon: Users },
  { label: 'Settings', icon: Settings },
  { label: 'Broadcast', icon: Megaphone },
] as const;

export const AdminPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const dragEnabled = selectedUserId === null;
  const [emblaRef, emblaApi] = useEmblaCarousel({ watchDrag: dragEnabled });

  const [activeIndex, setActiveIndex] = useState(0);

  // embla → активная вкладка (свайп пальцем)
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // dragEnabled меняется реактивно — embla должна узнать об этом явно
  useEffect(() => {
    emblaApi?.reInit({ watchDrag: dragEnabled });
  }, [emblaApi, dragEnabled]);

  const goToTab = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const handleBack = useCallback(() => {
    if (selectedUserId !== null) {
      setSelectedUserId(null);
    } else {
      navigate('/profile');
    }
  }, [selectedUserId, navigate]);

  useBackButton(handleBack, true);

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden">
      <div
        className="sticky top-0 z-10 px-4 py-2"
        style={{ backgroundColor: theme.bg_color }}
      >
        <div className="flex items-center gap-3 pb-3">
          <h1 className="text-xl font-bold" style={{ color: theme.text_color }}>
            Admin Panel
          </h1>
        </div>

        <div
          className="flex rounded-2xl p-1"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          {TABS.map((t, index) => {
            const Icon = t.icon;
            const isActive = activeIndex === index;
            return (
              <button
                key={t.label}
                onClick={() => goToTab(index)}
                className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isActive
                    ? theme.button_color
                    : 'transparent',
                  color: isActive ? theme.button_text_color : theme.hint_color,
                }}
              >
                <Icon size={14} className="shrink-0" />
                <span className="hidden truncate min-[380px]:inline">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          <div className="min-w-0 flex-[0_0_100%] overflow-y-auto px-4 pt-4 pb-6">
            <DashboardTab />
          </div>
          <div className="min-w-0 flex-[0_0_100%] overflow-y-auto px-4 pt-4 pb-6">
            <UsersTab
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
            />
          </div>
          <div className="min-w-0 flex-[0_0_100%] overflow-y-auto px-4 pt-4 pb-6">
            <SettingsTab />
          </div>
          <div className="min-w-0 flex-[0_0_100%] overflow-y-auto px-4 pt-4 pb-6">
            <BroadcastTab />
          </div>
        </div>
      </div>
    </div>
  );
};
