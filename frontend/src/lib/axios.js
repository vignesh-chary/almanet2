import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`;

export const axiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true
	// Removed default Content-Type header to allow it to be set per request
});

let isRefreshing = false;
let failedQueue = [];
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve();
		}
	});
	
	failedQueue = [];
};

// Function to handle token refresh
const refreshAccessToken = async () => {
	try {
		const response = await axios.post(
			`${BASE_URL}/auth/refresh`,
			{},
			{ withCredentials: true }
		);
		return response.data.success;
	} catch (error) {
		console.error("Error refreshing token:", error);
		return false;
	}
};

// Add request interceptor to handle FormData properly
axiosInstance.interceptors.request.use(config => {
	// If the request data is FormData, remove the Content-Type header
	// to let the browser set it with the correct boundary
	if (config.data instanceof FormData) {
		// Delete any preset content-type header
		if (config.headers) {
			delete config.headers['Content-Type'];
		}
	}
	return config;
});

// Add response interceptor to handle 401 errors and token refresh
axiosInstance.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config;
		
		// If error is 401 and we haven't already tried refreshing
		if (error.response?.status === 401 && !originalRequest._retry) {
			const now = Date.now();
			if (now - lastRefreshTime < REFRESH_COOLDOWN) {
				return Promise.reject(error);
			}

			if (isRefreshing) {
				// If refresh is in progress, add request to queue
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => {
						return axiosInstance(originalRequest);
					})
					.catch(err => {
						return Promise.reject(err);
					});
			}
			
			originalRequest._retry = true;
			isRefreshing = true;
			lastRefreshTime = now;
			
			try {
				// Try to refresh the token
				const refreshed = await refreshAccessToken();
				
				if (refreshed) {
					processQueue(null);
					return axiosInstance(originalRequest);
				} else {
					processQueue(new Error('Failed to refresh token'));
					if (window.location.pathname !== '/login') {
						window.location.href = '/login';
					}
					return Promise.reject(error);
				}
			} catch (refreshError) {
				processQueue(refreshError);
				if (window.location.pathname !== '/login') {
					window.location.href = '/login';
				}
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
		
		return Promise.reject(error);
	}
);
