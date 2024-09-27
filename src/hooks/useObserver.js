import { useEffect } from "react";
import { Store } from "../store/store.js";

export const hasValidList = (contexts = [], payload) =>
  contexts?.find?.((ctx) => ctx.id === payload?.context?.id);

export const useObserver = (props) => {
  useEffect(() => {
    const { listener, observer, contexts, store } = props;
    const isStore = store instanceof Store;
    function subscriber(payload, resolve) {
      if (!hasValidList(contexts, payload)) return;
      payload?.context?.update({ value: payload, listener });
      listener?.(payload, resolve);
    }
    if (isStore) observer?.subscribe?.(subscriber);
    return () => isStore && observer?.unsubscribe?.(subscriber);
  }, [props.listener, props.observer, props.contexts]);
};
