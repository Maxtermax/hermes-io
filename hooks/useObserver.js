import { useEffect } from "react";

export const useObserver = (props = {}) => {
  useEffect(() => {
    const { observer, listener, from = [] } = props;
    function handleAction(value) {
      const hasfromList = from.length !== 0;
      const hasValidList = hasfromList && from.includes(value.from);
      if (hasValidList) {
        listener?.(value);
      }
    }
    observer.subscribe(handleAction);
    return () => observer.unsubscribe(handleAction);
  }, [props]);
};
