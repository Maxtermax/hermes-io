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
