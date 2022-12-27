export class Observer {
  subscriptors = [];
  subscribe(callback) {
    this.subscriptors.push(callback);
  }
  unsubscribe(callback) {
    this.subscriptors.splice(this.subscriptors.findIndex(cb => cb  === callback), 1);
  }
  notify(args = {}) {
    this.subscriptors.forEach(callback => callback(args));
  }
}
