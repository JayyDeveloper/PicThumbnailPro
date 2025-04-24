import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse error as JSON first
    let errorText = res.statusText;
    
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await res.json();
        if (errorJson.error) {
          // If we have a structured error message, use it
          errorText = errorJson.error;
        }
      } else {
        // Otherwise try to get the text
        errorText = await res.text() || res.statusText;
      }
    } catch (e) {
      // If parsing fails, fallback to status text
      console.error('Error parsing error response:', e);
    }
    
    // Special handling for insufficient points (403 Forbidden)
    if (res.status === 403 && (
      errorText.includes('Insufficient points') || 
      errorText.toLowerCase().includes('out of points')
    )) {
      throw new Error('Insufficient points');
    }
    
    throw new Error(`${res.status}: ${errorText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get auth token from localStorage (try both possible keys)
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log(`Adding auth token to ${method} ${url}`);
  } else {
    console.log(`No auth token found for ${method} ${url}`);
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  try {
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error for ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth token from localStorage (try both possible keys)
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`Adding auth token to query for ${queryKey[0]}`);
    } else {
      console.log(`No auth token found for query ${queryKey[0]}`);
    }
    
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        headers,
      });

      console.log(`Query response for ${queryKey[0]}: status ${res.status}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Returning null for 401 on ${queryKey[0]}`);
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error for ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
