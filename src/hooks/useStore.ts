import { useCallback, useEffect, useRef } from "react";
import type { Store } from "../store/store";
import type { MicroStore } from "../store/store";

export interface UseStoreProps {
  store: Store;
  reducer: (state: unknown, action: { type: string; payload?: unknown }) => unknown;
  data?: unknown;
  microStore?: MicroStore;
  id?: string;
  name?: string;
}

export function useStore(props: UseStoreProps) {
  const { name, reducer, data, microStore, id } = props;
  const storeRef = useRef(props.store);
  const store = storeRef.current;
  const reducerRef = useRef(reducer);
  reducerRef.current = reducer;

  const mutate = (store.mutate = useCallback(
    ({ type, payload, targets }: { type: string; payload?: unknown; targets?: string[] }) => {
      const newState = reducerRef.current(store.state, { type, payload });
      return store.notify({ type, payload, state: newState, targets });
    },
    [store]
  ));

  const query = (store.query = useCallback(
    (cb: (store: Store) => unknown, defaultValue?: unknown) =>
      cb(store) ?? defaultValue,
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
