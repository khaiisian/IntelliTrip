import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle token refresh
api.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config;
        const token = localStorage.getItem("token");

        if (!token) {
            return Promise.reject(error);
        }

        if (originalRequest.url.includes("/auth/refresh")) {
            localStorage.removeItem("token");
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await api.post("/auth/refresh");
                const newToken = res.data.data.token;

                localStorage.setItem("token", newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                return api(originalRequest);
            } catch {
                localStorage.removeItem("token");
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;