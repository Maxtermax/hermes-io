import { useEffect } from "react";
import { Store } from "../store/store";
import type { Context } from "../context/context";
import type { Observer, Subscriber } from "../observer/observer";

export const hasValidList = (
  contexts: Context[] = [],
  payload: Record<string, unknown>
): Context | undefined =>
  contexts?.find?.((ctx) => ctx.id === (payload?.context as Context)?.id);

export interface UseObserverProps {
  store?: Store;
  listener?: Subscriber;
  contexts?: Context[];
  observer?: Observer;
}

export const useObserver = (props: UseObserverProps): void => {
  useEffect(() => {
    const { listener, observer, contexts, store } = props;
    const isStore = store instanceof Store;
    const subscriber: Subscriber = function (payload, resolve) {
      if (!hasValidList(contexts, payload)) return;
      (payload as Record<string, unknown>)?.context &&
        (payload.context as Context).update?.({
          value: payload,
          listener: listener as unknown as (...args: unknown[]) => unknown,
        });
      listener?.(payload, resolve);
    };
    if (isStore) observer?.subscribe?.(subscriber);
    return () => {
      if (isStore) observer?.unsubscribe?.(subscriber);
    };
  }, [props.listener, props.observer, props.contexts]);
};
