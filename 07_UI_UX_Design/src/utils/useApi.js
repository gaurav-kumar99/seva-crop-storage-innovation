import { useCallback, useEffect, useState } from "react";

// Runs an async loader when the component mounts (and when `deps` change).
// Returns { data, loading, error, status, reload }.
export function useApi(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "", status: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: "", status: 0 }));

    loader()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: "", status: 200 });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err.message || "Something went wrong.",
            status: err.status || 0,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
