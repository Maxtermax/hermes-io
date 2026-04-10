import { Observer } from "../src/observer/observer";

describe("Observer", () => {
  let observer;
  let callback1;
  let callback2;

  beforeEach(() => {
    observer = new Observer();
    callback1 = vi.fn();
    callback2 = vi.fn();
  });

  afterEach(() => {
    observer = null;
    callback1 = null;
    callback2 = null;
  });

  it("subscribe and notify", () => {
    observer.subscribe(callback1);
    observer.subscribe(callback2);
    const args = { data: "test" };
    observer.notify(args);
    expect(callback1).toHaveBeenCalledWith(args, expect.any(Function));
    expect(callback2).toHaveBeenCalledWith(args, expect.any(Function));
  });

  it("unsubscribe", async () => {
    observer.subscribe(callback1);
    observer.unsubscribe(callback1);
    expect(callback1).not.toHaveBeenCalled();
  });

  it("unsubscribe should not remove other subscribers when callback is not found", () => {
    observer.subscribe(callback1);
    observer.subscribe(callback2);
    const unknownCallback = vi.fn();
    observer.unsubscribe(unknownCallback);
    expect(observer.subscriptors).toHaveLength(2);
  });

  it("unsubscribe should only remove the target subscriber", () => {
    observer.subscribe(callback1);
    observer.subscribe(callback2);
    observer.unsubscribe(callback1);
    expect(observer.subscriptors).toHaveLength(1);
    expect(observer.subscriptors[0]).toBe(callback2);
  });

  it("has should return true when subscriber with matching id exists", () => {
    const subscriber = vi.fn();
    subscriber.id = "test-id";
    observer.subscribe(subscriber);
    expect(observer.has("test-id")).toBe(true);
  });

  it("has should return false when no subscriber matches the id", () => {
    const subscriber = vi.fn();
    subscriber.id = "test-id";
    observer.subscribe(subscriber);
    expect(observer.has("other-id")).toBe(false);
  });

  it("has should return false when there are no subscribers", () => {
    expect(observer.has("any-id")).toBe(false);
  });

  it("notify should return a promise", () => {
    const result = observer.notify();
    expect(result).toBeInstanceOf(Promise);
  });

  it("notify should use empty object as default args", () => {
    observer.subscribe(callback1);
    observer.notify();
    expect(callback1).toHaveBeenCalledWith({}, expect.any(Function));
  });

  it("notify should resolve when a subscriber calls resolve", async () => {
    const subscriber = vi.fn((args, resolve) => resolve("done"));
    observer.subscribe(subscriber);
    const result = await observer.notify({ data: "test" });
    expect(result).toBe("done");
  });

  it("unsubscribed callback should not be called on notify", async () => {
    observer.subscribe(callback1);
    observer.subscribe(callback2);
    observer.unsubscribe(callback1);
    observer.notify({ data: "test" });
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith({ data: "test" }, expect.any(Function));
  });

  it("subscribe should allow adding the same callback multiple times", () => {
    observer.subscribe(callback1);
    observer.subscribe(callback1);
    expect(observer.subscriptors).toHaveLength(2);
  });
});
