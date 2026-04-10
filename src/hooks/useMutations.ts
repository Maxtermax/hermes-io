import { useState, useEffect, useRef, useCallback } from "react";
import { useObserver } from "./useObserver";
import { MicroStore } from "../store/store";
import type { Store } from "../store/store";
import type { Subscriber } from "../observer/observer";
import { getStackTrace, randomId } from "../utils";

type OnChangeCallback = (
  value: unknown,
  resolver: (value?: unknown) => void,
  setNoUpdate: (value: boolean) => void,
  prevState: Record<string, unknown>
) => Record<string, unknown> | void;

interface CustomEvent {
  event: string;
  onChange: OnChangeCallback;
}

interface MutationRef {
  id: string;
  state: Record<string, unknown>;
  events: CustomEvent[];
  onEvent: (event: string, onChange: OnChangeCallback) => void;
}

export interface UseMutationsProps {
  events?: string[];
  onChange?: OnChangeCallback;
  store?: Store;
  id?: string;
  initialState?: Record<string, unknown>;
  name?: string;
  noUpdate?: boolean;
}

export const useMutations = (props: UseMutationsProps = {}) => {
  const {
    events = [],
    onChange,
    store,
    id,
    initialState = {},
    name = "",
    noUpdate: initialNoUpdate,
  } = props;
  const [_renderId, setReRenderId] = useState(randomId());
  const noUpdateRef = useRef(initialNoUpdate);
  const mutationRef = useRef<MutationRef>({
    id: `${getStackTrace()}_${id ?? ""}`,
    state: { ...initialState },
    events: [],
    onEvent: (event: string, onChange: OnChangeCallback) => {
      const events = mutationRef.current.events;
      const isAlreadyIn = events.some((item) => item.event === event);
      if (!isAlreadyIn) events.push({ event, onChange });
    },
  });

  const setNoUpdate = (value: boolean) => {
    noUpdateRef.current = value;
  };

  const executeEvent = (
    targets: string[] | undefined,
    value: unknown,
    resolver: (value?: unknown) => void,
    onChange?: OnChangeCallback
  ) => {
    const hasNotTargets = !targets;
    let match = false;
    targets?.forEach?.((target) => {
      if (target === id) {
        match = true;
        let result: Record<string, unknown> =
          (onChange?.(value, resolver, setNoUpdate, mutationRef.current.state) as Record<string, unknown>) ??
          {};
        if (noUpdateRef.current) result = {};
        mutationRef.current.state = { ...mutationRef.current.state, ...result };
      }
    });
    if (hasNotTargets) {
      let result: Record<string, unknown> =
        (onChange?.(value, resolver, setNoUpdate, mutationRef.current.state) as Record<string, unknown>) ??
        {};
      if (noUpdateRef.current) result = {};
      mutationRef.current.state = { ...mutationRef.current.state, ...result };
    }
    if (noUpdateRef.current === true || match === false) return;
    setReRenderId(randomId());
  };

  const handleNotification: Subscriber = useCallback(
    ((e: Record<string, unknown>, resolver: (value?: unknown) => void) => {
      const payload = (e.value as Record<string, unknown>)?.payload as Record<string, unknown> | undefined;
      const value = payload?.value;
      const targets = (e.value as Record<string, unknown>)?.targets as string[] | undefined;
      const customs = mutationRef.current?.events;
      const hasCustomEvents = customs.length > 0;
      if (hasCustomEvents) {
        for (const custom of customs) {
          if ((e.value as Record<string, unknown>).type !== custom.event) continue;
          executeEvent(targets, value, resolver, custom.onChange);
        }
        return;
      }
      for (const event of events) {
        if ((e.value as Record<string, unknown>).type !== event) continue;
        executeEvent(targets, value, resolver, onChange);
      }
    }) as Subscriber,
    [events, mutationRef.current?.events]
  );

  useEffect(() => {
    const isMicroStore = store instanceof MicroStore;
    if (isMicroStore) {
      const microStore = store as MicroStore;
      const { id: mutationId } = mutationRef.current;
      (handleNotification as Subscriber).id = mutationId;
      const isPopulated = microStore.has(id!);
      if (!microStore.hasListener(mutationId)) {
        microStore.registerListener(id!, handleNotification);
      }
      if (isPopulated && !microStore.get(id!)!.observer.has(mutationId)) {
        microStore.subscribeStore(id!, microStore.get(id!)!);
      }
    }
    return () => {
      if (isMicroStore) (store as MicroStore).remove(id!, mutationRef.current.id);
    };
  }, []);

  useObserver({
    store,
    listener: handleNotification,
    contexts: store?.context ? [store.context] : [],
    observer: store?.observer,
  });

  return mutationRef.current;
};
