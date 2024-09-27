import { useEffect } from "react";
import { useStore } from "./useStore.js";
import { Context } from "../context/context.js";
import { Observer } from "../observer/observer.js";
import { Store } from "../store/store.js";

export const useObservableStore = (id, data, reducer, microStore) => {
  const { store } = useStore({
    microStore,
    store: new Store({
      id,
      context: new Context(`Context_${id}`),
      observer: new Observer(),
    }),
    reducer,
    data,
  });

  useEffect(() => {
    microStore?.add?.(id, store);
  }, [microStore, store, id]);

  return { store };
};
