export class Observer {
  subscriptors = [];
  subscribe(callback) {
    this.subscriptors.push(callback);
  }
  unsubscribe(callback) {
    this.subscriptors.splice(
      this.subscriptors.findIndex((cb) => cb === callback),
      1
    );
  }

  has = (id) => this.subscriptors.some((subscriber) => id === subscriber.id);

  notify(args = {}) {
    return new Promise((resolve) => {
      this.subscriptors.forEach((callback) => callback(args, resolve));
    });
  }
}
