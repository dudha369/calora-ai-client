import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useBackButton } from '../../hooks/useBackButton';
import { LayoutDashboard, Users, Settings, Megaphone } from 'lucide-react';
import { DashboardTab } from './tabs/DashboardTab';
import { UsersTab } from './tabs/UsersTab';
import { SettingsTab } from './tabs/SettingsTab';
import { BroadcastTab } from './tabs/BroadcastTab';

type Tab = 'dashboard' | 'users' | 'settings' | 'broadcast';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
];

export const AdminPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Telegram BackButton: если открыт детальный просмотр — назад к списку,
  // иначе — выход из админки в профиль
  const handleBack = useCallback(() => {
    if (selectedUserId !== null) {
      setSelectedUserId(null);
    } else {
      navigate('/profile');
    }
  }, [selectedUserId, navigate]);

  useBackButton(handleBack, true);

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-2 pb-0"
        style={{ backgroundColor: theme.bg_color }}
      >
        <div className="flex items-center gap-3 pb-3">
          <h1
            className="text-xl font-bold"
            style={{ color: theme.text_color }}
          >
            Admin Panel
          </h1>
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isActive ? theme.button_color : 'transparent',
                  color: isActive ? theme.button_text_color : theme.hint_color,
                }}
              >
                <Icon size={14} />
                <span className="hidden min-[380px]:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-6">
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'users' && (
          <UsersTab
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
          />
        )}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'broadcast' && <BroadcastTab />}
      </div>
    </div>
  );
};
