import { renderHook } from "@testing-library/react-hooks/dom";
import { useStore } from "../src/hooks/useStore";
import { Context } from "../src/context/context";
import { Observer } from "../src/observer/observer";
import { describe } from "vitest";
import { MicroStore, Store } from "../src/store/store";

describe("useStore", () => {
  let store;
  beforeEach(() => {
    store = {
      notify: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    store = null;
  });

  test("should simulate a mutation", async () => {
    const reducer = (state) => state; // A simple reducer for testing purposes
    const data = {};
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );

    result.current.mutate({ type: "TEST_ACTION", payload: { value: "test" } });

    expect(store.notify).toHaveBeenCalledWith({
      type: "TEST_ACTION",
      payload: { value: "test" },
      state: data,
    });
  });

  test("should simulate a query", async () => {
    const reducer = (state) => state; // A simple reducer for testing purposes
    const data = { name: "test" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    expect(result.current.query((store) => store.state.name)).toBe(data.name);
  });

  test("should populate micro store", async () => {
    const reducer = (state) => state; // A simple reducer for testing purposes
    const micro = new MicroStore();
    const data = { name: "test" };
    const id = 1;
    const store = new Store({
      id,
      context: new Context("Test"),
      observer: new Observer(),
    });
    await renderHook(() =>
      useStore({
        id,
        microStore: micro,
        store,
        reducer,
        data,
      })
    );
    expect(micro.collection.size).toBe(1);
    expect(micro.get(id)).toBe(store);
  });
});
