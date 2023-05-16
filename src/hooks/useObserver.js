import React, { useEffect } from "react";

export const useObserver = (props = {}) => {
  useEffect(() => {
    const { observer, listener, contexts = [] } = props;
    function subscriber(payload, resolve) {
      const hasfromList = contexts.length !== 0;
      const hasValidList = hasfromList && contexts.find((ctx) => ctx.id === payload?.context?.id);
      if (hasValidList) {
        payload?.context?.update({ value: payload, listener });
        listener?.(payload, resolve);
      }
    }
    observer?.subscribe?.(subscriber);
    return () => observer?.unsubscribe?.(subscriber);
  }, [props]);
};
