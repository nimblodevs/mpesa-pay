import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

export const stkPush = (payload) => api.post("/api/mpesa/stk-push", payload);
export const b2c = (payload) => api.post("/api/mpesa/b2c", payload);
export const b2b = (payload) => api.post("/api/mpesa/b2b", payload);
export const transactionStatus = (payload) =>
  api.post("/api/mpesa/transaction-status", payload);
export const accountBalance = (payload) =>
  api.post("/api/mpesa/account-balance", payload);
export const reversal = (payload) => api.post("/api/mpesa/reversal", payload);
export const generateQr = (payload) => api.post("/api/mpesa/qr", payload);
export const ratiba = (payload) => api.post("/api/mpesa/ratiba", payload);
export const pullTransactions = (payload) =>
  api.post("/api/mpesa/pull-transactions", payload);

export default api;
