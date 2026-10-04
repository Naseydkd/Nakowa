import { apiService } from '../services/api.js';

// Backward-compatible export for pages that still import from core/api.js.
export const api = apiService;
