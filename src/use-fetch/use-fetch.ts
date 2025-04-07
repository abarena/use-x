import { useCallback, useEffect, useReducer, useRef } from "react";

export type UseFetchOptions = {
  immediate: boolean;
};

export type UseFetchBaseState<T> = {
  url: string;
  loading: boolean;
  error: string | null;
  data: T | null;
}

export type UseFetchReturn<T> = UseFetchBaseState<T> &{
  load: () => Promise<void>;
  updateUrl: (url: string) => void;
  updateOptions: (options: UseFetchOptions)=> void;
  updateRequestOptions: (requestOptions?:  RequestInit) => void;
};

export type UseFetchState<T> = UseFetchBaseState<T> & {
  requestOptions?: RequestInit;
  options: UseFetchOptions;
};

export type UseFetchActions<T> = {
  type: "SET_URL",
  payload: Pick<UseFetchState<T>, "url">;
} | {
  type: "SET_REQUEST_OPTIONS",
  payload: Pick<UseFetchState<T>, "requestOptions">;
} | {
  type: "SET_OPTIONS",
  payload: Pick<UseFetchState<T>, "options">;
} | {
  type: "FINISH_FETCHING",
  payload: Pick<UseFetchState<T>, "data" | "error">;
} | {
  type: "ABORT_FETCHING" | "START_FETCHING",
};

function useFetchReducer<T>(state: UseFetchState<T>, action: UseFetchActions<T>): UseFetchState<T> {
  switch (action.type) {
    case "SET_URL":
    case "SET_REQUEST_OPTIONS":
    case "SET_OPTIONS":
      return {
        ...state,
        ...action.payload
      };
    case "FINISH_FETCHING":
    return {
      ...state,
      ...action.payload,
      loading: false,
    };
    case "ABORT_FETCHING":
    case "START_FETCHING":
      return {
        ...state,
        loading: action.type === "START_FETCHING",
        error: null,
        data: null,
      };
    return state;
  }
}

export default function useFetch<T>(
  initialUrl: string,
  initialRequestOptions?: RequestInit,
  initialOptions?: UseFetchOptions,
): UseFetchReturn<T> {
  const [{
    url,
    loading,
    data,
    error,
    requestOptions,
    options,
  }, dispatch] = useReducer(useFetchReducer<T>, {
    loading: false,
    data: null,
    error: null,
    url: initialUrl,
    requestOptions: initialRequestOptions,
    options: initialOptions || { immediate: true },
  });

  const abortController = useRef(new AbortController());

  const load = useCallback(async () => {
    abortController.current.abort();
    abortController.current = new AbortController();

    if (!url) {
      dispatch({
        type: "FINISH_FETCHING",
        payload: {
          data: null,
          error: "Empty URL"
        }
      });
      return;
    }

    dispatch({ type: "START_FETCHING" });
    
    try {
      const requestInit = (requestOptions || {});
      requestInit.signal = abortController.current.signal;
      const currentAbortController = abortController.current;
      const res = await fetch(url, requestInit);
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      if (currentAbortController.signal.aborted) {
        return;
      }
      dispatch({
        type: "FINISH_FETCHING",
        payload: {
          data,
          error: null
        }
      });
    } catch (e) {
      const error  = e as Error;
      if (error.name === "AbortError") {
        dispatch({
          type: "ABORT_FETCHING",
        });
      } else {  
        dispatch({
          type: "FINISH_FETCHING",
          payload: {
            data: null,
            error: error.message
          }
        });
      }
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
    updateOptions: (options: UseFetchOptions) => dispatch({ type: "SET_OPTIONS", payload: { options } }),
    updateRequestOptions: (requestOptions?: RequestInit) => dispatch({ type: "SET_REQUEST_OPTIONS", payload: { requestOptions } }),
  };

}