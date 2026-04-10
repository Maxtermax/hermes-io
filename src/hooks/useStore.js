import { useCallback, useEffect, useRef } from "react";

export function useStore(props) {
  const { name, reducer, data, microStore, id } = props;
  const storeRef = useRef(props.store);
  const store = storeRef.current;
  const reducerRef = useRef(reducer);
  reducerRef.current = reducer;

  const mutate = (store.mutate = useCallback(({ type, payload, targets }) => {
    const newState = reducerRef.current(store.state, { type, payload });
    return store.notify({ type, payload, state: newState, targets });
  }, [store]));

  const query = (store.query = useCallback(
    (cb, defaultValue) => cb(store) ?? defaultValue,
    [store]
  ));
  if (!store.state) store.state = data;

  useEffect(() => {
    if (!id || !microStore || microStore.has?.(id)) return;
    microStore.add?.(id, store, name);
    return () => {
      microStore.removeAll?.(id);
    };
  }, [microStore, store, id]);

  return { query, mutate, store };
}
