// This is the file you need to update

import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react";

export type UseFetchOptions = {
  immediate: boolean;
};

export type UseFetchReturn<T> = {
  loading: boolean;
  error: string | null;
  data: T | null;
  url: string;
  load: () => Promise<void>;
  updateUrl: Dispatch<SetStateAction<string>>;
  updateOptions: Dispatch<SetStateAction<UseFetchOptions>>;
  updateRequestOptions: Dispatch<SetStateAction<RequestInit | undefined>>;
};

export default function useFetch<T>(
  initialUrl: string,
  initialRequestOptions?: RequestInit,
  initialOptions?: UseFetchOptions,
): UseFetchReturn<T> {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, updateUrl] = useState(initialUrl);
  const [options, updateOptions] = useState(initialOptions || { immediate: true });
  const [requestOptions, updateRequestOptions] = useState<RequestInit | undefined>(initialRequestOptions);
  
  const load = useCallback(async () => {
    if (!url) {
      setError("Empty URL");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(url, requestOptions);
      if (!res.ok) {
        setError(res.statusText);
        return;
      }
      const data = await res.json();
      setData(data);

    } catch (e) {
      const error  = e as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [url, requestOptions]);

  useEffect(() => {
    if (options?.immediate) {
      load();
    }
  }, [options, load]);

  return {
    url,
    loading,
    error,
    data,
    load,
    updateUrl,
    updateOptions,
    updateRequestOptions,
  };
}
