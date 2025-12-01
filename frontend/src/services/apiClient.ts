const API_URL = import.meta.env.VITE_API_URL as string;

const getToken = (): string | null => localStorage.getItem("token");

const handleResponse = async (response: Response): Promise<any> => {
  if (
    response.status === 401 &&
    response.statusText === "Invalid email or password"
  ) {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-error"));
    throw new Error(response.statusText);
  }

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(
        response.statusText || `HTTP error! status: ${response.status}`
      );
    }
    throw new Error(
      errorData?.error || errorData?.message || "API request failed"
    );
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error("Invalid JSON response from server");
  }
};

const buildOptions = (
  method: string,
  body: unknown = null,
  requiresAuth = false
): RequestInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn(
        "Auth required for this request, but no token is available."
      );
    }
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  return options;
};

const request = async (
  endpoint: string,
  options?: RequestInit
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return handleResponse(response);
  } catch (error) {
    console.error("Network error or fetch failed:", error);
    throw error;
  }
};

const apiClient = {
  get: (endpoint: string, requiresAuth = false): Promise<any> => {
    const options = buildOptions("GET", null, requiresAuth);
    return request(endpoint, options);
  },

  post: (
    endpoint: string,
    body: unknown,
    requiresAuth = false
  ): Promise<any> => {
    const options = buildOptions("POST", body, requiresAuth);
    return request(endpoint, options);
  },

  patch: (
    endpoint: string,
    body: unknown,
    requiresAuth = false
  ): Promise<any> => {
    const options = buildOptions("PATCH", body, requiresAuth);
    return request(endpoint, options);
  },

  delete: (endpoint: string, requiresAuth = false): Promise<any> => {
    const options = buildOptions("DELETE", null, requiresAuth);
    return request(endpoint, options);
  },
};

export default apiClient;
