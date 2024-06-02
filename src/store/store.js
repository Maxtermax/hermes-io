export class Store {
  context = null;
  observer = null;
  id = null;
  state;
  constructor({ context, observer, id }) {
    this.context = context;
    this.observer = observer;
    this.id = id;
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
    return store;
  };
  remove = (id) => this.collection.delete(id);
  get = (id) => this.collection.get(id);
}
