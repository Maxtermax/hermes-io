import { useStore } from "./useStore";
import { Context } from "../context/context";
import { Observer } from "../observer/observer";
import { Store } from "../store/store";

export const useStoreFactory = (id, data, reducer, microStore) => {
  const payload = {
    store: new Store({
      id,
      context: new Context(`Context_${id}`),
      observer: new Observer(),
    }),
    reducer,
    data,
  };
  if (microStore) payload.microStore = microStore;
  const { store } = useStore(payload);
  return { store };
};
