import { useState, useRef } from "react";
import { useObserver } from "../hooks/useObserver";

const randomId = () =>
  crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 16);

export const useMutations = (props = {}) => {
  const [_, rerender] = useState(randomId());
  const value = useRef(null);

  const setNoUpdate = (value) => (props.noUpdate = value);

  const handleNotification = (e, resolver) => {
    for (const event of props.events) {
      if (e.value.type === event) {
        const value = e.value?.payload?.value;
        const hasNotTargets = !e.value?.targets;
        e?.value?.targets?.forEach?.(
          (target) =>
            target === props.id &&
            props?.onChange?.(value, resolver, setNoUpdate)
        );
        if (hasNotTargets) props.onChange?.(value, resolver, setNoUpdate);
        if (props.noUpdate === true) continue;
        rerender(randomId());
      }
    }
  };

  useObserver({
    listener: handleNotification,
    contexts: [props.store.context],
    observer: props.store.observer,
  });

  return value;
};
