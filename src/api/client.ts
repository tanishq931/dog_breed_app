export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
}

export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    timeoutMs = 15000,
    retries = 3,
    backoffMs = 1000,
    headers,
    ...fetchOpts
  } = options;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOpts,
        headers: {
          Accept: 'application/vnd.api+json, application/json',
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);

      if (!response.ok) {
        throw new ApiError(
          `Request failed with status ${response.status}`,
          response.status,
          false,
        );
      }

      const json = (await response.json()) as T;
      return json;
    } catch (err: unknown) {
      clearTimeout(timeoutTimer);
      lastError = err;

      const isLastAttempt = attempt >= retries;
      if (isLastAttempt) {
        break;
      }

      const jitter = Math.floor(Math.random() * 300);
      const delay = backoffMs * Math.pow(2, attempt) + jitter;
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), delay);
      });
      attempt += 1;
    }
  }

  if (lastError instanceof ApiError) {
    throw lastError;
  }

  const message =
    lastError instanceof Error ? lastError.message : 'Network request failed';
  throw new ApiError(message, undefined, true);
}
