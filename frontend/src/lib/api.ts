import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const method = error.config?.method?.toUpperCase();
        const url = error.config?.url;
        const status = error.response?.status;
        console.error(`[API] ${method} ${url} → ${status ?? 'sem resposta'}`, error.response?.data);
        return Promise.reject(error);
    }
);