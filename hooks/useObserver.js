import React, { useEffect } from "react";

export const useObserver = (props = {}) => {
  useEffect(() => {
    const { observer, listener, contexts = [] } = props;
    function handleAction(payload, resolve) {
      const hasfromList = contexts.length !== 0;
      const hasValidList = hasfromList && contexts.find((ctx) => ctx.id === payload?.context?.id);
      if (hasValidList) {
        payload?.context?.update({ value: payload, listener });
        listener?.(payload, resolve);
      }
    }
    observer.subscribe(handleAction);
    return () => observer.unsubscribe(handleAction);
  }, [props]);
};
