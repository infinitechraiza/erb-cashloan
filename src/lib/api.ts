export interface ApiResponse<T = any> {
  message?: string
  data?: T
  error?: string
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }

    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API error: ${response.statusText}`)
  }

  return response.json()
}
