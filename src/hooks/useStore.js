import { useEffect, useCallback, useRef } from "react";

export function useStore(props) {
  const { reducer, data, microStore, id } = props;
  const storeRef = useRef(props.store);
  const store = storeRef.current;
  const mutate = (store.mutate = useCallback(({ type, payload, targets }) => {
    const newState = reducer(store.state, { type, payload });
    return store.notify({ type, payload, state: newState, targets });
  }, []));

  const query = (store.query = useCallback(
    (cb, defaultValue) => cb(store) ?? defaultValue,
    []
  ));
  if (!store.state) store.state = data;

  useEffect(() => {
    // add store to collection if available.
    if (microStore) microStore.add(id, store);
  }, [microStore, store, id]);

  return { query, mutate, store };
}
