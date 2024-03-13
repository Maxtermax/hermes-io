import { renderHook } from "@testing-library/react-hooks/dom";
import { useMutations } from "../src/hooks/useMutations";
import { useStore } from "../src/hooks/useStore";
import { describe } from "vitest";
import { Context } from "../src/context/context";
import { Observer } from "../src/observer/observer";
import { Store } from "../src/store/store";

describe("useMutations", () => {
  let context;
  let observer;
  let store;
  beforeEach(() => {
    context = new Context("Test");
    observer = new Observer();
    store = new Store({ context, observer });
  });

  test("rerenders on events with noUpdate set to false", async () => {
    const id = "exampleId";
    const events = ["EVENT_1", "EVENT_2"];
    const onChange = vi.fn();
    const reducer = (state) => state;
    const data = {};
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );

    renderHook(() =>
      useMutations({ store, id, events, onChange, noUpdate: false })
    );
    result.current.mutate({ type: "EVENT_1", payload: { value: "test" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("do no rerender if noUpdate is set to true", async () => {
    const id = "exampleId";
    const events = ["EVENT_1", "EVENT_2"];
    const onChange = vi.fn();
    const reducer = (state) => {
      return {
        ...state,
        name: "test",
      };
    };
    const data = {};
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    result.current.mutate({ type: "EVENT_1", payload: { value: "test" } });
    renderHook(() =>
      useMutations({ store, id, events, noUpdate: true, onChange })
    );

    setTimeout(
      () =>
        expect(result.current.query((store) => store.state.name)).toBe("test"),
      1000
    );
  });
});
