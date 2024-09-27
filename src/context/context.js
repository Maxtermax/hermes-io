import CONSTANTS from "../constants.js";

let recording = false;
let collection = [];
export const listenersMap = new Map();

function startRecording() {
  recording = true;
}

function stopRecording() {
  recording = false;
}

function resetRecording() {
  collection = [];
  recording = false;
}

function setContext({ id = "" }) {
  const context = collection.find((context) => context._internalId === id);
  if (context) {
    if (context.isFromExternalRecording) {
      const listener = listenersMap.get(context.listener);
      return listener?.({ value: JSON.parse(context.value) });
    }
    return context.listener(context.value);
  }
}

function loadRecording(payload) {
  collection = payload.recording.map((item = {}) => ({
    ...item,
    isFromExternalRecording: true,
    _internalId: item.id,
  }));
}

const actions = {
  [CONSTANTS.START_RECORDING]: startRecording,
  [CONSTANTS.STOP_RECORDING]: stopRecording,
  [CONSTANTS.RESET_RECORDING]: resetRecording,
  [CONSTANTS.SET_CONTEXT]: setContext,
  [CONSTANTS.LOAD_RECORDING]: loadRecording,
};

const handleMessageFromDevtools = (event) => {
  try {
    const { source, payload } = event.data;
    if (source === CONSTANTS.CHROME_EXTENSION) {
      if (payload?.type) return actions[payload.type](payload);
      actions[payload]();
    }
  } catch (error) {
    console.error(error);
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("message", handleMessageFromDevtools);
}

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
    if (typeof window !== "undefined") {
      window.postMessage(
        {
          type: CONSTANTS.CONTEXT_SNAPSHOT,
          payload: {
            value: JSON.stringify(value.value),
            listener: listener.name,
            stackTrace,
            date,
            id: _internalId,
          },
          source: "hermes-io",
        },
        "*"
      );
    }
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
