import { useCallback, useEffect } from "react";

export function useStore({ store, reducer, data }) {
  const mutate = useCallback(({ type, payload, targets }) => {
    const newState = reducer(store.state, { type, payload });
    return store.notify({ type, payload, state: newState, targets });
  }, []);

  const query = useCallback(
    (cb, defaultValue) => cb(store) ?? defaultValue,
    []
  );

  if (!store.state) store.state = data;
  store.mutate = mutate;
  store.query = query;

  useEffect(() => {
    return () => store?.removeFromCollection?.();
  }, []);

  return { query, mutate, state: store.state };
}
