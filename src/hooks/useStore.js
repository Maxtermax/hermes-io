import { useCallback, useEffect } from "react";

export function useStore(args) {
  const { store, reducer, data } = args;
  const mutate = useCallback(({ type, payload, targets }) => {
    const newState = reducer(store.state, { type, payload });
    return store.notify({ type, payload, state: newState, targets });
  }, []);

  const query = useCallback(
    (cb, defaultValue) => cb(store) ?? defaultValue,
    []
  );

  useEffect(() => {
    if (!store.state) store.state = data;
    store.mutate = mutate;
    store.query = query;

    return () => store?.removeFromCollection?.();
  }, [args]);

  return { query, mutate, state: store.state };
}
