import { useState } from "react";
import { useObserver } from "../hooks/useObserver";

const randomId = () =>
  crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 16);

export const useMutations = (args = {}) => {
  const { events, onChange, store } = args;
  const [renderId, setReRenderId] = useState(randomId());

  const setNoUpdate = (value) => (args.noUpdate = value);

  const handleNotification = (e, resolver) => {
    for (const event of events) {
      if (e.value.type !== event) continue;
      const value = e.value?.payload?.value;
      const targets = e.value?.targets;
      const hasNotTargets = !targets;
      let match = false;
      targets?.forEach?.((target) => {
        if (target === args.id) {
          match = true;
          onChange?.(value, resolver, setNoUpdate);
        }
      });
      if (hasNotTargets) onChange?.(value, resolver, setNoUpdate);
      if (args.noUpdate === true || match === false) continue;
      setReRenderId(randomId());
    }
  };

  useObserver({
    listener: handleNotification,
    contexts: [store.context],
    observer: store.observer,
  });

  return renderId;
};
