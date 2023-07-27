import React from "react";
import { renderHook, act } from '@testing-library/react-hooks/dom' 
import { Context } from '../context/context';
import { useObserver } from "./useObserver";
import { listenersMap } from "../context/context";

// Mock the observer object and its methods
const mockObserver = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
};

describe("useObserver", () => {
  let context;
  beforeEach(() => {
    context = new Context("Test");
  });

  afterEach(() => {
    listenersMap.clear();
    jest.clearAllMocks();
    context = null;
  });

  it("should subscribe and unsubscribe to observer", async () => {
    const observer = mockObserver;
    const listener = jest.fn();
    const contexts = [context];

    const props = { observer, listener, contexts };
    let hook;
    await act(() => {
      hook = renderHook(() => useObserver(props));
    });
    const { unmount } = hook;

    expect(observer.subscribe).toHaveBeenCalledTimes(1);
    expect(observer.subscribe).toHaveBeenCalledWith(expect.any(Function));

    act(() => {
      unmount();
    });

    expect(observer.unsubscribe).toHaveBeenCalledTimes(1);
    expect(observer.unsubscribe).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should add and remove listener from listenersMap", async () => {
    const observer = mockObserver;
    const listener = jest.fn();
    const props = { observer, listener, contexts: [context] };

    await act(() => {
      renderHook(() => useObserver(props));
    });

    expect(listenersMap.get(listener.name)).toBe(listener);

    act(() => {
      listenersMap.clear();
    });

    expect(listenersMap.size).toBe(0);
  });

  it("should call listener and context update when payload matches context id", async () => {
    const observer = mockObserver;
    const listener = jest.fn();
    const context = { id: "contextId", update: jest.fn() };
    const payload = { context };
    const props = { observer, listener, contexts: [context] };

    await act(() => {
      renderHook(() => useObserver(props));
    });

    const subscribeCallback = observer.subscribe.mock.calls[0][0];
    const resolve = jest.fn();

    act(() => {
      subscribeCallback(payload, resolve);
    });

    expect(context.update).toHaveBeenCalledTimes(1);
    expect(context.update).toHaveBeenCalledWith({ value: payload, listener });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(payload, resolve);
  });
});
