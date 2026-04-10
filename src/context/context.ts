import CONSTANTS from "../constants";

interface SnapshotItem {
  _internalId: string;
  value: unknown;
  date: Date | null;
  listener: ((...args: unknown[]) => unknown) | null;
  stackTrace: string | undefined;
  isFromExternalRecording?: boolean;
  id?: string;
}

interface DevtoolsPayload {
  type?: string;
  recording?: Array<Record<string, unknown>>;
  id?: string;
  [key: string]: unknown;
}

let recording = false;
let collection: SnapshotItem[] = [];
export const listenersMap = new Map<string, (...args: unknown[]) => unknown>();

function startRecording(): void {
  recording = true;
}

function stopRecording(): void {
  recording = false;
}

function resetRecording(): void {
  collection = [];
  recording = false;
}

function setContext({ id = "" }: DevtoolsPayload): void {
  const context = collection.find((context) => context._internalId === id);
  if (context) {
    if (context.isFromExternalRecording) {
      const listener = listenersMap.get(context.listener as unknown as string);
      listener?.({ value: JSON.parse(context.value as string) });
      return;
    }
    (context.listener as (value: unknown) => void)?.(context.value);
  }
}

function loadRecording(payload: DevtoolsPayload): void {
  collection = (payload.recording ?? []).map((item = {}) => ({
    ...item,
    isFromExternalRecording: true,
    _internalId: (item as Record<string, unknown>).id as string,
  })) as SnapshotItem[];
}

const actions: Record<string, (payload?: DevtoolsPayload) => void> = {
  [CONSTANTS.START_RECORDING]: startRecording,
  [CONSTANTS.STOP_RECORDING]: stopRecording,
  [CONSTANTS.RESET_RECORDING]: resetRecording,
  [CONSTANTS.SET_CONTEXT]: setContext as (payload?: DevtoolsPayload) => void,
  [CONSTANTS.LOAD_RECORDING]: loadRecording as (payload?: DevtoolsPayload) => void,
};

const handleMessageFromDevtools = (event: MessageEvent): void => {
  try {
    if (event.origin !== window.location.origin) return;
    const { source, payload } = event.data;
    if (source === CONSTANTS.CHROME_EXTENSION) {
      if (payload?.type) {
        actions[payload.type]?.(payload);
        return;
      }
      actions[payload]?.();
    }
  } catch (error) {
    console.error(error);
  }
};

let listenerRegistered = false;

export function subscribeDevtools(): void {
  if (typeof window === "undefined" || listenerRegistered) return;
  listenerRegistered = true;
  window.addEventListener("message", handleMessageFromDevtools);
}

export function unsubscribeDevtools(): void {
  if (typeof window === "undefined" || !listenerRegistered) return;
  listenerRegistered = false;
  window.removeEventListener("message", handleMessageFromDevtools);
}

subscribeDevtools();

export class Context {
  id: symbol;
  _internalId: string | null = null;
  date: Date | null = null;
  value: unknown = null;
  listener: ((...args: unknown[]) => unknown) | null = null;
  stackTrace: string | undefined = undefined;

  constructor(description: string) {
    this.id = Symbol(description);
  }

  update = ({ value, listener }: { value: unknown; listener: (...args: unknown[]) => unknown }): void => {
    this.date = new Date();
    this.value = value;
    this.stackTrace = this.getStackTrace();
    this.listener = listener;
    if (recording) {
      this.sendSnapshot();
    }
  };

  sendSnapshot = (): void => {
    const snapshot = this.takeSnapshot();
    const { listener, stackTrace, value, date, _internalId } = snapshot;
    collection.push(snapshot);
    if (typeof window !== "undefined") {
      window.postMessage(
        {
          type: CONSTANTS.CONTEXT_SNAPSHOT,
          payload: {
            value: JSON.stringify((value as Record<string, unknown>)?.value),
            listener: (listener as { name?: string })?.name,
            stackTrace,
            date,
            id: _internalId,
          },
          source: "hermes-io",
        },
        window.location.origin
      );
    }
  };

  takeSnapshot = (): SnapshotItem => {
    return {
      _internalId: crypto.randomUUID(),
      value: this.value,
      date: this.date,
      listener: this.listener,
      stackTrace: this.stackTrace,
    };
  };

  getStackTrace = (): string | undefined => {
    const err = new Error();
    return err.stack;
  };
}
