import { useCallback, useEffect, useRef } from "react";

export function useStore(args) {
  const { reducer, data } = args;
  const storeRef = useRef(null);
  useEffect(() => {
    const isMicroStore = typeof args.store === "function";
    storeRef.current = args.store;
    if (isMicroStore) storeRef.current = args.store();
    if (!storeRef.current.state) storeRef.current.state = data;
    storeRef.current.mutate = mutate;
    storeRef.current.query = query;
    return () => storeRef.current?.removeFromCollection?.();
  }, [args]);

  const mutate = useCallback(({ type, payload, targets }) => {
    const newState = reducer(storeRef.current.state, { type, payload });
    return storeRef.current.notify({ type, payload, state: newState, targets });
  }, []);

  const query = useCallback(
    (cb, defaultValue) => cb(storeRef.current) ?? defaultValue,
    []
  );

  return { query, mutate };
}
