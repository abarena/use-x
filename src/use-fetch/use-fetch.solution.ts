/*

▗▄▄▖ ▗▄▄▄▖▗▖ ▗▖ ▗▄▖ ▗▄▄▖ ▗▄▄▄▖
▐▌ ▐▌▐▌   ▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌▐▌
▐▛▀▚▖▐▛▀▀▘▐▌ ▐▌▐▛▀▜▌▐▛▀▚▖▐▛▀▀▘
▐▙▄▞▘▐▙▄▄▖▐▙█▟▌▐▌ ▐▌▐▌ ▐▌▐▙▄▄▖

▗▄▄▖ ▗▄▖ ▗▖   ▗▖ ▗▖▗▄▄▄▖▗▄▄▄▖ ▗▄▖ ▗▖  ▗▖
▐▌   ▐▌ ▐▌▐▌   ▐▌ ▐▌  █    █  ▐▌ ▐▌▐▛▚▖▐▌
 ▝▀▚▖▐▌ ▐▌▐▌   ▐▌ ▐▌  █    █  ▐▌ ▐▌▐▌ ▝▜▌
▗▄▄▞▘▝▚▄▞▘▐▙▄▄▖▝▚▄▞▘  █  ▗▄█▄▖▝▚▄▞▘▐▌  ▐▌

▗▄▄▖ ▗▄▄▄▖▗▖    ▗▄▖ ▗▖ ▗▖
▐▌ ▐▌▐▌   ▐▌   ▐▌ ▐▌▐▌ ▐▌
▐▛▀▚▖▐▛▀▀▘▐▌   ▐▌ ▐▌▐▌ ▐▌
▐▙▄▞▘▐▙▄▄▖▐▙▄▄▖▝▚▄▞▘▐▙█▟▌

 ▗▄▖ ▗▖  ▗▖▗▖ ▗▖  ▗▖
▐▌ ▐▌▐▛▚▖▐▌▐▌  ▝▚▞▘
▐▌ ▐▌▐▌ ▝▜▌▐▌   ▐▌
▝▚▄▞▘▐▌  ▐▌▐▙▄▄▖▐▌

 ▗▄▄▖ ▗▄▄▖▗▄▄▖  ▗▄▖ ▗▖   ▗▖
▐▌   ▐▌   ▐▌ ▐▌▐▌ ▐▌▐▌   ▐▌
 ▝▀▚▖▐▌   ▐▛▀▚▖▐▌ ▐▌▐▌   ▐▌
▗▄▄▞▘▝▚▄▄▖▐▌ ▐▌▝▚▄▞▘▐▙▄▄▖▐▙▄▄▖

▗▄▄▄▖▗▄▄▄▖    ▗▖  ▗▖▗▄▖ ▗▖ ▗▖
  █  ▐▌        ▝▚▞▘▐▌ ▐▌▐▌ ▐▌
  █  ▐▛▀▀▘      ▐▌ ▐▌ ▐▌▐▌ ▐▌
▗▄█▄▖▐▌         ▐▌ ▝▚▄▞▘▝▚▄▞▘

▗▖ ▗▖ ▗▄▖ ▗▖  ▗▖▗▄▄▄▖    ▗▄▄▄▖▗▄▖
▐▌ ▐▌▐▌ ▐▌▐▛▚▖▐▌  █        █ ▐▌ ▐▌
▐▌ ▐▌▐▛▀▜▌▐▌ ▝▜▌  █        █ ▐▌ ▐▌
▐▙█▟▌▐▌ ▐▌▐▌  ▐▌  █        █ ▝▚▄▞▘

▗▄▄▖ ▗▄▄▄▖▗▖  ▗▖▗▄▄▄▖ ▗▄▖ ▗▖       ▗▄▄▄▖▗▄▄▄▖
▐▌ ▐▌▐▌   ▐▌  ▐▌▐▌   ▐▌ ▐▌▐▌         █    █
▐▛▀▚▖▐▛▀▀▘▐▌  ▐▌▐▛▀▀▘▐▛▀▜▌▐▌         █    █
▐▌ ▐▌▐▙▄▄▖ ▝▚▞▘ ▐▙▄▄▖▐▌ ▐▌▐▙▄▄▖    ▗▄█▄▖  █

*/

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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

export default function useFetchSolution<T>(
  initialUrl: string,
  initialRequestOptions?: RequestInit,
  initialOptions?: UseFetchOptions,
): UseFetchReturn<T> {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, updateUrl] = useState(initialUrl);
  const [requestOptions, updateRequestOptions] = useState(initialRequestOptions);
  const [options, updateOptions] = useState(initialOptions || { immediate: true });
  const abortController = useRef(new AbortController());

  const load = useCallback(async () => {
    abortController.current.abort();
    abortController.current = new AbortController();
    setData(null);
    if (!url) {
      setError("Empty URL");
      return;
    }
    else {
      setError(null);
    }
    setLoading(true);
    try {
      const requestInit = (requestOptions || {});
      requestInit.signal = abortController.current.signal;
      const currentController = abortController.current;
      // // artificial delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch(url, requestInit);
      const json = await response.json();
      if (currentController.signal.aborted) {
        return;
      }
      setData(json);
    }
    catch (e) {
      const error = e as Error;
      if (error.name === "AbortError") {
        setError(null);
        setData(null);
      }
      else {
        setError(error.message);
      }
    }
    setLoading(false);
  }, [url, requestOptions]);

  useEffect(() => {
    if (options?.immediate) {
      load();
    }

    return () => {
      abortController.current.abort();
    };
  }, [load, options]);

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
