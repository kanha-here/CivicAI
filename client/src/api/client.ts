import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_SOCKET_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiError = {
  message: string;
  statusCode?: number;
  data?: unknown;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiEnvelope<unknown>>) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || "Request failed",
          statusCode: error.response?.status,
          data: error.response?.data?.data,
        };
        const normalizedError = Object.assign(new Error(apiError.message), apiError);

        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          if (window.location.pathname !== "/auth") window.location.href = "/auth";
        } else if (apiError.message) {
          toast.error(apiError.message);
        }

        throw normalizedError;
      },
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<ApiEnvelope<T>>(config);
    return response.data.data;
  }

  async download(url: string, params?: unknown) {
    const response = await this.client.request<Blob>({
      method: "GET",
      url,
      params,
      responseType: "blob",
    });
    return response.data;
  }

  get<T>(url: string, params?: unknown) {
    return this.request<T>({ method: "GET", url, params });
  }

  post<T>(url: string, data?: unknown) {
    return this.request<T>({ method: "POST", url, data });
  }

  put<T>(url: string, data?: unknown) {
    return this.request<T>({ method: "PUT", url, data });
  }

  delete<T>(url: string) {
    return this.request<T>({ method: "DELETE", url });
  }
}

export const apiClient = new ApiClient();
