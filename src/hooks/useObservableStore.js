import { useStore } from "./useStore";
import { Context } from "../context/context";
import { Observer } from "../observer/observer";
import { Store } from "../store/store";

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
  return { store };
};
