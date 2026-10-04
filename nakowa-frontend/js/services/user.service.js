import { apiService } from './api.js';

export class UserApiService {
    async getAll() {
        return apiService.get('/users');
    }

    async getById(id) {
        return apiService.get(`/users/${id}`);
    }

    async create(data) {
        return apiService.post('/users', data);
    }

    async update(id, data) {
        return apiService.patch(`/users/${id}`, data);
    }

    async deactivate(id) {
        return apiService.patch(`/users/${id}/deactivate`);
    }

    async delete(id) {
        return apiService.delete(`/users/${id}`);
    }
}

export const userApi = new UserApiService();
