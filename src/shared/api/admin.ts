import { request, requestRaw } from './request';
import type { Profile } from '../types/Profile';
import type { Goal } from '../types/Goal';

// ── Types ──────────────────────────────────────────────────────────

export interface AdminDashboard {
  total_users: number;
  new_today: number;
  new_week: number;
  new_month: number;
  completed_onboarding: number;
  stuck_onboarding: number;
  onboarding_rate: number;
  dau: number;
  total_food_logs: number;
  total_photo_scans: number;
  quests: { active: number; done: number; failed: number };
  signups_by_day: { date: string; count: number }[];
  dau_trend: { date: string; dau: number }[];
  onboarding_funnel: { step: number; count: number }[];
}

export interface AdminUser {
  telegram_id: number;
  full_name: string;
  username: string | null;
  language_code: string;
  current_streak: number;
  max_streak: number;
  quests_completed: number;
  created_at: string;
  onboarded: boolean;
  in_whitelist: boolean;
}

export interface AdminUserList {
  users: AdminUser[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AdminFoodLog {
  id: number;
  log_date: string;
  photo_url: string | null;
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  items: { food_name: string; portion_g: number; calories: number }[];
}

export interface AdminQuest {
  title: string;
  status: string;
  current_value: number;
  target_value: number;
  icon: string;
}

export interface AdminUserDetail {
  user: AdminUser & { in_whitelist: boolean };
  profile: Profile | null;
  goal: Goal | null;
  food_logs: AdminFoodLog[];
  quests: AdminQuest[];
}

export interface BroadcastItem {
  id: number;
  text: string;
  segment: string;
  status: string;
  total: number;
  sent: number;
  failed: number;
  created_at: string;
}

// ── API ────────────────────────────────────────────────────────────

export const admin = {
  getConfig: () => request<{ is_admin: boolean }>('admin/config'),

  getDashboard: () => request<AdminDashboard>('admin/dashboard'),

  getUsers: (params: { search?: string; filter?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.filter) q.set('filter', params.filter);
    if (params.page) q.set('page', String(params.page));
    return request<AdminUserList>(`admin/users?${q.toString()}`);
  },

  getUserDetail: (id: number) => request<AdminUserDetail>(`admin/users/${id}`),

  resetUser: (id: number) => request('admin/users/' + id + '/reset', 'POST'),
  deleteUser: (id: number) => request('admin/users/' + id, 'DELETE'),

  getSettings: () =>
    request<{ settings: Record<string, string> }>('admin/settings'),
  updateSettings: (settings: Record<string, string>) =>
    request('admin/settings', 'PUT', { settings }),

  getWhitelist: () =>
    request<{
      whitelist: {
        telegram_id: number;
        full_name: string | null;
        username: string | null;
        in_db: boolean;
      }[];
      enabled: boolean;
    }>('admin/whitelist'),
  getUserAvatar: (telegramId: number) =>
    requestRaw(`admin/users/${telegramId}/avatar`),

  addToWhitelist: (id: number) => request('admin/whitelist/' + id, 'POST'),
  removeFromWhitelist: (id: number) =>
    request('admin/whitelist/' + id, 'DELETE'),

  sendBroadcast: (data: {
    text: string;
    segment: string;
    button_text?: string;
    button_url?: string;
    preview?: boolean;
  }) =>
    request<{ ok: boolean; broadcast_id?: number; recipients?: number }>(
      'admin/broadcast',
      'POST',
      data,
    ),

  getBroadcasts: () =>
    request<{ broadcasts: BroadcastItem[] }>('admin/broadcasts'),
};
