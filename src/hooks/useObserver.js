import { useEffect } from "react";
import { listenersMap } from "../context/context";

export const useObserver = (props) => {
  useEffect(() => {
    const { observer, listener, contexts = [] } = props || {};
    function subscriber(payload, resolve) {
      const hasfromList = contexts.length !== 0;
      const hasValidList = hasfromList && contexts.find((ctx) => ctx.id === payload?.context?.id);
      if (hasValidList) {
        payload?.context?.update({ value: payload, listener });
        listener?.(payload, resolve);
      }
    }
    observer?.subscribe?.(subscriber);
    listenersMap.set(props.listener.name, props.listener); 
    return () => {
      listenersMap.delete(props.listener.name); 
      observer?.unsubscribe?.(subscriber);
    };
  }, [props]);
};
