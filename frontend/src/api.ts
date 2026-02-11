import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  withCredentials: true, // Important for sending cookies/JWT with every request
});

const csrfClient = axios.create({
  baseURL,
  withCredentials: true,
});

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = csrfClient
      .get('/api/auth/csrf-token')
      .then((res) => {
        csrfToken = res.data.csrfToken;
        return csrfToken as string;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
};

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  const needsCsrf = method === 'post' || method === 'put' || method === 'patch' || method === 'delete';

  if (!needsCsrf || (config.url && config.url.includes('/api/auth/csrf-token'))) {
    return config;
  }

  const token = await getCsrfToken();
  config.headers = config.headers ?? {};
  config.headers['X-CSRF-Token'] = token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      csrfToken = null;
    }

    // If there's a response and it's a 401 Unauthorized error
    const requestUrl = error.config?.url as string | undefined;
    const isAuthProbe = !!requestUrl && requestUrl.includes('/api/auth/me');

    if (error.response && error.response.status === 401 && !isAuthProbe) {
      console.warn('401 Unauthorized: Redirecting to login...');
      // Redirect to the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
