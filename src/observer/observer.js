export class Observer {
  subscriptors = [];
  subscribe(callback) {
    this.subscriptors.push(callback);
  }
  unsubscribe(callback) {
    const index = this.subscriptors.findIndex((cb) => cb === callback);
    if (index > -1) this.subscriptors.splice(index, 1);
  }

  has = (id) => this.subscriptors.some((subscriber) => id === subscriber.id);

  notify(args = {}, { timeout = 30000 } = {}) {
    return new Promise((resolve) => {
      const timer = timeout > 0
        ? setTimeout(() => resolve(null), timeout)
        : null;
      const wrappedResolve = (value) => {
        if (timer) clearTimeout(timer);
        resolve(value);
      };
      this.subscriptors.forEach((callback) => callback(args, wrappedResolve));
    });
  }
}
