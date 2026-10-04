import { apiService } from './api.js';

export class ServiceApiService {
    async getAll() {
        return apiService.get('/services');
    }

    async getById(id) {
        return apiService.get(`/services/${id}`);
    }

    async create(data) {
        return apiService.post('/services', data);
    }

    async update(id, data) {
        return apiService.patch(`/services/${id}`, data);
    }

    async deactivate(id) {
        return apiService.patch(`/services/${id}/deactivate`);
    }

    async delete(id) {
        return apiService.delete(`/services/${id}`);
    }
}

export const serviceApi = new ServiceApiService();
