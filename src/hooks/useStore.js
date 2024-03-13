import { useEffect } from "react";

export function useStore({ store, reducer, data }) {
  const mutate = ({ type, payload, targets }) => {
    const newState = reducer(store.state, { type, payload });
    return store.notify({ type, payload, state: newState, targets });
  };

  const query = (cb, defaultValue) => cb(store) ?? defaultValue;

  useEffect(() => {
    if (!store.state) store.state = data;
    store.mutate = mutate;
    store.query = query;
  }, []);

  return { query, mutate, state: store.state };
}
