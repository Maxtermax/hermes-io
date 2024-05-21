import { useState } from "react";
import { useObserver } from "../hooks/useObserver";

const randomId = () =>
  crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 16);

export const useMutations = (args = {}) => {
  const { events, onChange, store, initialState = {} } = args;
  const [_renderId, setReRenderId] = useState(randomId());
  let mutation = { state: { ...initialState } };

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
          const result =
            onChange?.(value, resolver, setNoUpdate, mutation.state) ??
            {};
          mutation.state = { ...mutation.state, ...result };
        }
      });
      if (hasNotTargets) {
        const result =
          onChange?.(value, resolver, setNoUpdate, mutation.state) ?? {};
        mutation.state = { ...mutation.state, ...result };
      }
      if (args.noUpdate === true || match === false) continue;
      setReRenderId(randomId());
    }
  };

  useObserver({
    listener: handleNotification,
    contexts: [store.context],
    observer: store.observer,
  });

  return mutation;
};
