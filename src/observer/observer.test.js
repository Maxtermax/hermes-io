import { Observer } from "./observer";

describe("Observer", () => {
  let observer;
  let callback1;
  let callback2;

  beforeEach(() => {
    observer = new Observer();
    callback1 = jest.fn();
    callback2 = jest.fn();
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
});
