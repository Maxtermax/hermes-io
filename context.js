let recording = false;
let collection = [];

const handleMessageFromDevtools = (event) => {
  const { source, payload } = event.data;
  if (source === "hermes-io-devtools") {
    if (payload === "START_RECORDING") {
      recording = true;
      return;
    }
    if (payload === "STOP_RECORDING") {
      recording = false;
    }
    if (payload === "RESET_RECORDING") {
      collection = [];
      recording = false;
    }
    if (payload?.type === "SET_CONTEXT") {
      const context = collection.find((context) => context._internalId === payload.id);
      if (context) {
        context.listener(context.value);
      }
    }
  }
};


window.addEventListener("message", handleMessageFromDevtools);

export class Context {
  id = null;
  _internalId = null;
  date = null;
  value = null;
  listener = null;
  stackTrace = null;
  constructor(description) {
    this.id = Symbol(description);
  }
  update = ({ value, listener }) => {
    this.date = new Date();
    this.value = value;
    this.stackTrace = this.getStackTrace();
    this.listener = listener;
    if (recording) {
      this.sendSnapshot();
    }
  };
  sendSnapshot = () => {
    const snapshot = this.takeSnapshot();
    const { listener, stackTrace, value, date, _internalId } = snapshot;
    collection.push(snapshot);
    window.postMessage(
      {
        type: "CONTEXT_SNAPSHOT",
        payload: { value: JSON.stringify(value.value), listener: listener.name, stackTrace, date, id: _internalId },
        source: "hermes-io",
      },
      "*"
    );
  };
  takeSnapshot = () => {
    return {
      _internalId: crypto.randomUUID(),
      value: this.value,
      date: this.date,
      listener: this.listener,
      stackTrace: this.stackTrace,
    };
  };
  getStackTrace = () => {
    const err = new Error();
    return err.stack;
  };
}
