import { useState, useRef } from "react";
import { useObserver } from "../hooks/useObserver";

const randomId = () => crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 16);

export const useMutations = ({
  store,
  id,
  events,
  noUpdate = false,
  onChange,
}) => {
  const [_, rerender] = useState(randomId());
  const value = useRef(null);

  const handleNotification = (e, resolver) => {
    for (const event of events) {
      if (e.value.type === event) {
        const value = e.value?.payload?.value;
        if (
          (!e.value.targets || e.value.targets.includes(id)) &&
          noUpdate === false
        ) {
          rerender(randomId());
        }
        onChange?.(value, resolver);
      }
    }
  };

  useObserver({
    listener: handleNotification,
    contexts: [store.context],
    observer: store.observer,
  });

  return value;
};
