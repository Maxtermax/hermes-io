import { hasValidList } from "../hooks/useObserver.js";

export class Store {
  context = null;
  observer = null;
  id = null;
  state;
  constructor({ context, observer, id }) {
    this.id = id;
    this.context = context;
    this.observer = observer;
  }
  notify = (value) => this.observer.notify({ context: this.context, value });
  query = () =>
    console.log(
      "method is not conencted to the reducer, please call useStore first"
    );
  mutate = () =>
    console.log(
      "method is not connected to the store, you need call useStore first"
    );
}

export class MicroStore {
  collection = new Map();
  listeners = new Map();
  subscribeStore = (id, store) => {
    const { observer, context } = store;
    const listeners = this.listeners.get(id) ?? [];
    for (const listener of listeners) {
      function subscriber(payload, resolve) {
        const isInvalidContext = !hasValidList([context], payload);
        if (isInvalidContext) return;
        payload?.context?.update({ value: payload, listener });
        listener?.(payload, resolve);
      }
      subscriber.id = listener.id;
      const hasListener = observer.has(listener.id);
      if (!hasListener) observer.subscribe(subscriber);
    }
  };
  add = (id, store) => {
    this.subscribeStore(id, store);
    this.collection.set(id, store);
    return store;
  };
  registerListener = (id, cb) => {
    if (this.listeners.has(id)) {
      const listeners = this.listeners.get(id);
      listeners.push(cb);
      this.listeners.set(id, listeners);
    } else {
      this.listeners.set(id, [cb]);
    }
  };
  hasListener = (id) => {
    let result = false;
    for (const [_, listener] of this.listeners) {
      result = listener.some((cb) => cb.id === id);
      if (result) break;
    }
    return result;
  };
  remove = (id, mutationId) => {
    const store = this.collection.get(id);
    const listeners = this.listeners.get(id) ?? [];
    for (const listener of listeners) {
      if (listener.id !== mutationId) continue;
      if (store.observer.has(listener.id)) {
        store.observer.unsubscribe(listener);
      }
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }
  };
  removeAll = (id) => {
    const store = this.collection.get(id);
    const listeners = this.listeners.get(id) ?? [];
    for (const listener of listeners) {
      if (store.observer.has(listener.id)) {
        store.observer.unsubscribe(listener);
      }
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }
  };
  get = (id) => this.collection.get(id);
  has = (id) => this.collection.has(id);
}
