const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    // Only set Content-Type to application/json if it's not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
    }

    return response;
}

export const apiClient = {
    get: (endpoint: string) => fetchWithAuth(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => fetchWithAuth(endpoint, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    upload: (endpoint: string, formData: FormData) => fetchWithAuth(endpoint, {
        method: 'POST',
        body: formData,
    }),
    delete: (endpoint: string) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};
