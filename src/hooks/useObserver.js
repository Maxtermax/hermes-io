import { useEffect } from "react";
import { MicroStore } from "../store/store";

export const useObserver = (props) => {
  useEffect(() => {
    const { listener, id, microStore } = props;
    let observer = props.observer;
    let contexts = props.contexts;

    function subscriber(payload, resolve) {
      const hasValidList = contexts?.find?.(
        (ctx) => ctx.id === payload?.context?.id,
      );
      if (hasValidList) {
        payload?.context?.update({ value: payload, listener });
        listener?.(payload, resolve);
      }
    }
    function microStoreSubscriber() {
      const store = microStore?.get?.(id);
      observer = store?.observer;
      contexts = store?.context ? [store.context] : [];
      observer?.subscribe?.(subscriber);
    }
    if (microStore instanceof MicroStore && id) {
      const store = microStore?.get?.(id);
      const isStoreAvailable = !!store;
      if (isStoreAvailable) microStoreSubscriber();
      microStore?.subscribe?.(microStoreSubscriber);
    } else {
      observer?.subscribe?.(subscriber);
    }
    return () => {
      observer?.unsubscribe?.(subscriber);
      microStore?.unsubscribe?.(microStoreSubscriber);
    };
  }, [
    props.id,
    props.listener,
    props.observer,
    props.contexts,
    props.microStore,
  ]);
};
