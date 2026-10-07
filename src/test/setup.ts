import "@testing-library/jest-dom";
import { vi } from 'vitest';

vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    save: vi.fn(),
  }),
}));
