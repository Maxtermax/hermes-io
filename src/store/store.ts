import { hasValidList } from "../hooks/useObserver";
import type { Observer, Subscriber } from "../observer/observer";
import type { Context } from "../context/context";

export interface StoreConfig {
  context: Context;
  observer: Observer;
  id?: string;
}

export class Store {
  context: Context;
  observer: Observer;
  id: string | undefined;
  state: unknown;

  constructor({ context, observer, id }: StoreConfig) {
    this.id = id;
    this.context = context;
    this.observer = observer;
  }

  notify = (value: Record<string, unknown>): Promise<unknown> =>
    this.observer.notify({ context: this.context, value });

  query: (cb: (store: Store) => unknown, defaultValue?: unknown) => unknown = () =>
    console.log(
      "method is not connected to the reducer, please call useStore first"
    );

  mutate: (action: { type: string; payload?: unknown; targets?: string[] }) => unknown = () =>
    console.log(
      "method is not connected to the store, you need call useStore first"
    );
}

export type ListenerCallback = Subscriber;

export class MicroStore {
  collection = new Map<string, Store>();
  listeners = new Map<string, ListenerCallback[]>();

  subscribeStore = (id: string, store: Store): void => {
    const { observer, context } = store;
    const listeners = this.listeners.get(id) ?? [];
    for (const listener of listeners) {
      if (observer.has(listener.id!)) continue;
      const subscriber: Subscriber = function (payload, resolve) {
        const isInvalidContext = !hasValidList([context], payload);
        if (isInvalidContext) return;
        (payload as Record<string, unknown>)?.context &&
          (payload.context as Context).update?.({
            value: payload,
            listener: listener as unknown as (...args: unknown[]) => unknown,
          });
        listener?.(payload, resolve);
      };
      subscriber.id = listener.id;
      if (!observer.has(listener.id!)) observer.subscribe(subscriber);
    }
  };

  add = (id: string, store: Store, _name?: string): Store => {
    this.subscribeStore(id, store);
    this.collection.set(id, store);
    return store;
  };

  registerListener = (id: string, cb: ListenerCallback): void => {
    if (this.listeners.has(id)) {
      const listeners = this.listeners.get(id)!;
      listeners.push(cb);
      this.listeners.set(id, listeners);
    } else {
      this.listeners.set(id, [cb]);
    }
  };

  hasListener = (id: string): boolean => {
    let result = false;
    for (const [, listener] of this.listeners) {
      result = listener.some((cb) => cb.id === id);
      if (result) break;
    }
    return result;
  };

  remove = (id: string, mutationId: string): void => {
    const store = this.collection.get(id);
    if (!store) return;
    const listeners = this.listeners.get(id) ?? [];
    for (const listener of listeners) {
      if (listener.id !== mutationId) continue;
      if (store.observer.has(listener.id!)) {
        store.observer.unsubscribe(listener);
      }
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }
  };

  removeAll = (id: string): void => {
    const store = this.collection.get(id);
    if (!store) return;
    const listeners = this.listeners.get(id) ?? [];
    for (const listener of listeners) {
      if (store.observer.has(listener.id!)) {
        store.observer.unsubscribe(listener);
      }
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }
  };

  get = (id: string): Store | undefined => this.collection.get(id);
  has = (id: string): boolean => this.collection.has(id);
}
