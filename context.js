window.contexts = [];

export class Context {
  id = null;
  date = null;
  value = null;
  listener = null;
  stackTrace = null;
  constructor(description) {
    this.id = Symbol(description);
  }
  update({ value, listener }) {
    this.date = new Date();
    this.value = value;
    this.stackTrace = this.getStackTrace();
    this.listener = listener;
    window.contexts.push(this.takeSnapshot())
  }
  takeSnapshot() {
    return { ...this };
  }
  getStackTrace() {
    const err = new Error();
    return err.stack;
  }
};
