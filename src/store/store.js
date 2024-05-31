export class Store {
  context = null;
  observer = null;
  state;
  constructor({ context, observer }) {
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
  add = (id, store) => {
    this.collection.set(id, store);
    store.removeFromCollection = () => this.collection.delete(id);
    return store;
  };
  get = (id) => this.collection.get(id);
}
