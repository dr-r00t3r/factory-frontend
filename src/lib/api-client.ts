import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined" &&
      originalRequest.headers?.Authorization
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/api/refresh`,
          refreshToken
        );

        const newToken = response.data.access_token;
        localStorage.setItem("access_token", newToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const persianMessage = extractPersianError(error);
    return Promise.reject({ ...error, persianMessage });
  }
);

function extractPersianError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) {
      return data[firstKey][0] || "خطایی رخ داده است";
    }
  }
  if (error instanceof Error) {
    if (error.message === "Network Error") return "خطا در ارتباط با سرور";
    return error.message;
  }
  return "خطایی رخ داده است";
}

export default apiClient;
