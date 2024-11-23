import { useStore } from "./useStore.js";
import { Context } from "../context/context.js";
import { Observer } from "../observer/observer.js";
import { Store } from "../store/store.js";
import { useMicroStore } from "./useMicroStore.js";

export const useObservableStore = (id, data, reducer, microStore, name) => {
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

  useMicroStore({ id, microStore, store, name });

  return { store };
};
