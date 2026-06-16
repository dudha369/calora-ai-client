import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Мокаем axios и Telegram SDK до импорта request
vi.mock('axios');
vi.mock('@tma.js/sdk-react', () => ({
  initData: { raw: () => 'mock_init_data' },
}));

const mockedAxios = vi.mocked(axios);

// Динамический импорт после моков
const { request } = await import('../request');

describe('request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.request.mockResolvedValue({ data: { ok: true } });
  });

  it('sends GET request with correct headers', async () => {
    await request('users/me');

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          initData: 'mock_init_data',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('does not stringify JSON body — axios handles it', async () => {
    const payload = { name: 'test', value: 42 };
    await request('food/log', 'POST', payload);

    const call = mockedAxios.request.mock.calls[0][0];
    // data должен быть объектом, НЕ строкой
    expect(call.data).toEqual(payload);
    expect(typeof call.data).toBe('object');
  });

  it('sends FormData without Content-Type (browser sets boundary)', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['data']), 'photo.jpg');

    await request('food/analyze', 'POST', formData);

    const call = mockedAxios.request.mock.calls[0][0];
    expect(call.data).toBe(formData);
    expect(call.headers).not.toHaveProperty('Content-Type');
  });

  it('sends undefined data for GET requests with no body', async () => {
    await request('stats/daily/2026-06-14');

    const call = mockedAxios.request.mock.calls[0][0];
    expect(call.data).toBeUndefined();
  });
});
