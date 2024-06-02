import { useCallback, useEffect, useRef } from "react";

export function useStore(args) {
  const { storeMap, reducer, data } = args;
  const storeRef = useRef(args.store);
  const store = storeRef.current;
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
    storeMap?.add?.(store?.id, store);
    return () => storeMap?.remove?.(store?.id);
  }, [args]);

  return { query, mutate, store };
}
