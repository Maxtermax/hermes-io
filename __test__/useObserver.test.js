import { renderHook, act } from "@testing-library/react-hooks/dom";
import { Context, listenersMap } from "../src/context/context";
import { Observer, useObserver } from "../src/observer/observer";
import { test } from "vitest";

// Mock the observer object and its methods
const mockObserver = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

describe("useObserver", () => {
  let context;
  beforeEach(() => {
    context = new Context("Test");
  });

  afterEach(() => {
    listenersMap.clear();
    vi.clearAllMocks();
    context = null;
  });

  test("should subscribe and unsubscribe to observer ", async () => {
    const observer = new Observer();
    const listener = vi.fn();
    const contexts = [context];
    const { unmount } = await renderHook(() => {
      const hook = useObserver({ observer, listener, contexts });
      expect(observer.subscriptors.length).toBe(1);
      return hook;
    });
    await act(() => unmount());
    expect(observer.subscriptors.length).toBe(0);
  });

  it("should add and remove listener from listenersMap", async () => {
    const observer = new Observer();
    const listener = vi.fn();
    const { unmount } = await renderHook(() => {
      const hook = useObserver({ observer, listener, contexts: [context] });
      expect(listenersMap.size).toBe(1);
      return hook;
    });
    await act(() => unmount());
    expect(listenersMap.size).toBe(0);
  });

  it("should call listener on notification", async () => {
    const observer = mockObserver;
    const listener = vi.fn();
    renderHook(() => {
      useObserver({ observer, listener, contexts: [context] });
      observer.notify({
        context,
        value: {
          test: true,
        },
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
