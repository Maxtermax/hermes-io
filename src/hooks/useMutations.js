import { useState, useRef } from "react";
import { useObserver } from "./useObserver";

const randomId = () =>
  crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 16);

export const useMutations = (props = {}) => {
  const { events = [], onChange, store, id, initialState = {} } = props;
  const [_renderId, setReRenderId] = useState(randomId());
  if (props.parent) {
    console.trace("PARENT");
  }
  let mutationRef = useRef({
    state: { ...initialState },
    events: [],
    onEvent: (event, onChange) => {
      const events = mutationRef.current.events;
      const isAlreadyIn = events.some((item) => item.event === event);
      if (!isAlreadyIn) events.push({ event, onChange });
    },
  });

  const setNoUpdate = (value) => (props.noUpdate = value);

  const executeEvent = (targets, value, resolver, onChange) => {
    const hasNotTargets = !targets;
    let match = false;
    targets?.forEach?.((target) => {
      if (target === props.id) {
        match = true;
        let result =
          onChange?.(value, resolver, setNoUpdate, mutationRef.current.state) ??
          {};
        if (props.noUpdate) result = {};
        mutationRef.current.state = { ...mutationRef.current.state, ...result };
      }
    });
    if (hasNotTargets) {
      let result =
        onChange?.(value, resolver, setNoUpdate, mutationRef.current.state) ?? {};
      if (props.noUpdate) result = {};
      mutationRef.current.state = { ...mutationRef.current.state, ...result };
    }
    if (props.noUpdate === true || match === false) return;
    setReRenderId(randomId());
  };

  const handleNotification = (e, resolver) => {
    const value = e.value?.payload?.value;
    const targets = e.value?.targets;
    const customs = mutationRef.current?.events;
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
    parent: props.parent,
    listener: handleNotification,
    contexts: [store?.context],
    observer: store?.observer,
  });

  return mutationRef.current;
};
