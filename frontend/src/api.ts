import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Important for sending cookies/JWT with every request
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If there's a response and it's a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      console.warn('401 Unauthorized: Redirecting to login...');
      // Clear any stored token (assuming it's in localStorage)
      localStorage.removeItem('token');
      // Redirect to the login page
      window.location.href = '/login';
    }

    let errorMessage = 'An unexpected error occurred.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
      // If the message is an array (e.g., from express-validator), stringify it
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.map((e: any) => e.msg || e.message).join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', errorMessage);

    // Re-throw the error so specific components can still catch it
    return Promise.reject(error);
  }
);

export const submitFeedback = async (feedback: { name: string; email: string; message: string }) => {
    const { data } = await api.post("/api/feedback", feedback);
    return data;
};

export const getAdminFeedback = async () => {
    const { data } = await api.get("/api/admin/feedback");
    return data;
};
