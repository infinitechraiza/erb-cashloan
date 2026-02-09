// lib/auth-utils.ts

// Router type compatible with Next.js useRouter
type Router = {
  push: (href: string) => void
  replace?: (href: string) => void
  back?: () => void
  forward?: () => void
  refresh?: () => void
  prefetch?: (href: string) => void
}

/**
 * Get the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Set the authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
}

/**
 * Remove the authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

/**
 * Authenticated fetch wrapper that includes auth token
 * Automatically handles 401 responses and redirects to login
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  router?: Router
): Promise<Response> {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    removeAuthToken()
    if (router) {
      router.push('/')
    } else if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return response
}

/**
 * Handle API responses with error handling and auth checks
 * Returns parsed JSON data or throws an error
 */
export async function handleApiResponse<T>(
  response: Response,
  router?: Router
): Promise<T> {
  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    removeAuthToken()
    if (router) {
      router.push('/')
    } else if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    throw new Error('Unauthorized - Please log in again')
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    throw new Error('Access forbidden - You do not have permission to perform this action')
  }

  // Handle 404 Not Found
  if (response.status === 404) {
    throw new Error('Resource not found')
  }

  // Handle other error responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }))
    throw new Error(error.message || error.error || 'An error occurred')
  }

  // Parse and return JSON response
  return response.json()
}

/**
 * Wrapper function that combines authenticatedFetch and handleApiResponse
 * Usage: const data = await apiRequest<DataType>('/api/endpoint', { method: 'POST', body: JSON.stringify(payload) }, router)
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  router?: Router
): Promise<T> {
  const response = await authenticatedFetch(url, options, router)
  return handleApiResponse<T>(response, router)
}

/**
 * Type-safe API methods
 */
export const api = {
  /**
   * GET request
   */
  get: async <T>(url: string, router?: Router): Promise<T> => {
    return apiRequest<T>(url, { method: 'GET' }, router)
  },

  /**
   * POST request
   */
  post: async <T>(
    url: string,
    data?: any,
    router?: Router
  ): Promise<T> => {
    return apiRequest<T>(
      url,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      router
    )
  },

  /**
   * PUT request
   */
  put: async <T>(
    url: string,
    data?: any,
    router?: Router
  ): Promise<T> => {
    return apiRequest<T>(
      url,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      router
    )
  },

  /**
   * PATCH request
   */
  patch: async <T>(
    url: string,
    data?: any,
    router?: Router
  ): Promise<T> => {
    return apiRequest<T>(
      url,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      router
    )
  },

  /**
   * DELETE request
   */
  delete: async <T>(url: string, router?: Router): Promise<T> => {
    return apiRequest<T>(url, { method: 'DELETE' }, router)
  },
}