// This is the file you need to update

import { type Dispatch, type SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from "react";

export type UseFetchOptions = {
  immediate: boolean;
};

export type UseFetchBaseState = {
  url: string;
}

export type UseFetchReturn<T> = UseFetchBaseState &{
  loading: boolean;
  error: string | null;
  data: T | null;
  load: () => Promise<void>;
  updateUrl: (url: string) => void;
  updateOptions: Dispatch<SetStateAction<UseFetchOptions>>;
  updateRequestOptions: Dispatch<SetStateAction<RequestInit | undefined>>;
};

export type UseFetchSate = UseFetchBaseState & {
  requestOptions?: RequestInit;
};

export type UseFetchActions = {
  type: "SET_URL",
  payload: {
    url: string;
  }
} | {
  type: "REQUEST_OPTIONS",
  payload: {
    requestOptions: RequestInit;  
  }
}

function useFetchReducer(state: UseFetchState, action: UseFetchActions): UseFetchState {
  switch (action.type) {
    case "SET_URL":
    case "REQUEST_OPTIONS":
      return {
        ...state,
        ...action.payload
      };
  }
  return state;
}

export default function useFetch<T>(
  initialUrl: string,
  initialRequestOptions?: RequestInit,
  initialOptions?: UseFetchOptions,
): UseFetchReturn<T> {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [{ url }, dispatch] = useReducer(useFetchReducer, { url: initialUrl });
  const [options, updateOptions] = useState(initialOptions || { immediate: true });
  const [requestOptions, updateRequestOptions] = useState<RequestInit | undefined>(initialRequestOptions);
  const abortController = useRef(new AbortController());

  const load = useCallback(async () => {
    abortController.current.abort();
    abortController.current = new AbortController();
    setData(null);

    if (!url) {
      setError("Empty URL");
      return;
    } else {
      setError(null);
    }

    setLoading(true);
    
    try {
      const requestInit = (requestOptions || {});
      requestInit.signal = abortController.current.signal;
      const currentAbortController = abortController.current;
      const res = await fetch(url, requestInit);
      if (!res.ok) {
        setError(res.statusText);
        return;
      }
      const data = await res.json();
      if (currentAbortController.signal.aborted) {
        return;
      }
      setData(data);

    } catch (e) {
      const error  = e as Error;
      if (error.name !== "AbortError") {
        setData(null);
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url, requestOptions]);

  useEffect(() => {
    if (options?.immediate) {
      load();
    }

    return () => {
      abortController.current.abort();
    };
  }, [options, load]);

  return {
    url,
    loading,
    error,
    data,
    load,
    updateUrl: (url: string) => dispatch({ type: "SET_URL", payload: { url } }),
    updateOptions,
    updateRequestOptions,
  };
}
