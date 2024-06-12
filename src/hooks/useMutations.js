import { useState, useRef } from 'react';
import { useObserver } from "./useObserver";

const randomId = () =>
  crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 16);

export const useMutations = (props = {}) => {
  const { events, onChange, store, id, initialState = {} } = props;
  const [_renderId, setReRenderId] = useState(randomId());
  let mutation = useRef({ state: { ...initialState } });

  const setNoUpdate = (value) => (props.noUpdate = value);

  const handleNotification = (e, resolver) => {
    for (const event of events) {
      if (e.value.type !== event) continue;
      const value = e.value?.payload?.value;
      const targets = e.value?.targets;
      const hasNotTargets = !targets;
      let match = false;
      targets?.forEach?.((target) => {
        if (target === props.id) {
          match = true;
          const result =
            onChange?.(value, resolver, setNoUpdate, mutation.current.state) ??
            {};
          mutation.current.state = { ...mutation.current.state, ...result };
        }
      });
      if (hasNotTargets) {
        const result =
          onChange?.(value, resolver, setNoUpdate, mutation.current.state) ??
          {};
        mutation.current.state = { ...mutation.current.state, ...result };
      }
      if (props.noUpdate === true || match === false) continue;
      setReRenderId(randomId());
    }
  };

  useObserver({
    id,
    microStore: store,
    listener: handleNotification,
    contexts: [store?.context],
    observer: store?.observer,
  });
  return mutation.current;
};
