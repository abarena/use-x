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
  const [options, setOptions] = useState(initialOptions || { immediate: true });
  
  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(initialUrl);
    const data = await res.json();
    setData(data);
    setLoading(false);
  }, [initialUrl]);

  useEffect(() => {
    if (options?.immediate) {
      load();
    }
  }, [options, load]);

  return {
    url: "",
    loading,
    error: null,
    data,
    load,
    updateUrl: () => {},
    updateOptions: setOptions,
    updateRequestOptions: () => {},
  };
}
