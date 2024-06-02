import { useCallback, useEffect } from "react";

export function useStore(args) {
  const { store, storeMap, reducer, data } = args;
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
    storeMap?.add?.(store);
    return () => storeMap?.remove?.(store?.id);
  }, [args]);

  return { query, mutate, store };
}
