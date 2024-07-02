import { useState, useRef } from "react";
import { useObserver } from "./useObserver";

const randomId = () =>
  crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 16);

export const useMutations = (props = {}) => {
  const { events = [], onChange, store, id, initialState = {} } = props;
  const [_renderId, setReRenderId] = useState(randomId());
  let mutation = useRef({
    state: { ...initialState },
    events: [],
    onEvent: (event, onChange) =>
      (mutation.current.events = [
        ...mutation.current.events,
        { event, onChange },
      ]),
  });

  const setNoUpdate = (value) => (props.noUpdate = value);

  const executeEvent = (targets, value, resolver, onChange) => {
    const hasNotTargets = !targets;
    let match = false;
    targets?.forEach?.((target) => {
      if (target === props.id) {
        match = true;
        let result =
          onChange?.(value, resolver, setNoUpdate, mutation.current.state) ??
          {};
        if (props.noUpdate) result = {};
        mutation.current.state = { ...mutation.current.state, ...result };
      }
    });
    if (hasNotTargets) {
      let result =
        onChange?.(value, resolver, setNoUpdate, mutation.current.state) ?? {};
      if (props.noUpdate) result = {};
      mutation.current.state = { ...mutation.current.state, ...result };
    }
    if (props.noUpdate === true || match === false) return;
    setReRenderId(randomId());
  };

  const handleNotification = (e, resolver) => {
    const value = e.value?.payload?.value;
    const targets = e.value?.targets;
    const customs = mutation.current?.events;
    const hasCustomEvents = customs.length > 0;
    if (hasCustomEvents) {
      for (const custom of customs) {
        if (e.value.type !== custom.event) continue;
        executeEvent(targets, value, resolver, custom.onChange);
      }
      return;
    }
    for (const event of events) {
      if (e.value.type !== event) continue;
      executeEvent(targets, value, resolver, onChange);
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
