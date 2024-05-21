import { renderHook } from "@testing-library/react-hooks/dom";
import { useEffect } from "react";
import { useMutations } from "../src/hooks/useMutations";
import { useStore } from "../src/hooks/useStore";
import { describe, expect } from "vitest";
import { Context } from "../src/context/context";
import { Observer } from "../src/observer/observer";
import { Store } from "../src/store/store";

const useReRender = async (mutation, onChange) =>
  await renderHook(() => {
    useEffect(() => {
      // has re-render
      onChange();
    }, [mutation.result.current]);
  });

const CONSTANTS = {
  UPDATE_NAME: "UPDATE_NAME",
};

const reducer = (state, action) => {
  const events = {
    [CONSTANTS.UPDATE_NAME]: () => ({
      ...state,
      name: action.payload.value,
    }),
  };
  const result = events[action.type]();
  return result;
};

describe("useMutations", () => {
  let context;
  let observer;
  let store;
  beforeEach(() => {
    context = new Context("Test");
    observer = new Observer();
    store = new Store({ context, observer });
  });

  test("Check mutation only for targets ids", async () => {
    const id = "exampleId";
    const id2 = "exampleId2";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = vi.fn();
    const onChange2 = vi.fn();
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    renderHook(() => useMutations({ store, id, events, onChange }));
    renderHook(() =>
      useMutations({ store, id: id2, events, onChange: onChange2 })
    );
    result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      targets: [id],
      payload: { value: "test" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange2).toHaveBeenCalledTimes(0);
  });

  test("rerenders on events with noUpdate set to false", async () => {
    const id = "exampleId";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = vi.fn();
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );

    renderHook(() =>
      useMutations({ store, id, events, onChange, noUpdate: false })
    );
    result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      payload: { value: "test" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("Do not rerender if noUpdate is set to true", async () => {
    const id = "exampleId";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = vi.fn();
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    renderHook(() =>
      useMutations({ store, id, events, noUpdate: true, onChange })
    );

    result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      payload: { value: "test" },
    });
    setTimeout(
      () => expect(result.current.query((store) => store.state)).toBe("test"),
      1000
    );
  });

  test("Check ping pong mutation", async () => {
    const id = "exampleId";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = (_value, resolver) => {
      resolver("pong");
    };
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    renderHook(() =>
      useMutations({ store, id, events, noUpdate: true, onChange })
    );
    const pong = await result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      payload: { value: "ping" },
    });
    expect(pong).toBe("pong");
  });

  test("Check setNoUpdate dynamically", async () => {
    const id = "exampleId";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = (_value, _resolver, setNoUpdate) => {
      setNoUpdate(false);
    };
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    const mutation = renderHook(() =>
      useMutations({ store, id, events, noUpdate: true, onChange })
    );
    result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      payload: { value: "test" },
    });

    await useReRender(mutation, () => expect(true).toBe(true));
  });

  test("Check computed mutation state", async () => {
    const id = "exampleId";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = (_value, _resolver, _setNoUpdate, prevState) => ({
      name: prevState.name + " doe",
      age: prevState.age + 10,
    });
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    const mutation = renderHook(() =>
      useMutations({
        store,
        id,
        events,
        noUpdate: true,
        onChange,
        initialState: { name: "john", age: 28 },
      })
    );
    result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      payload: { value: "test" },
    });
    expect(mutation.result.current.state.name).toBe("john doe");
    expect(mutation.result.current.state.age).toBe(38);
  });

  test("Check computed value", async () => {
    const id = "exampleId";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = (_value, _resolver, _setNoUpdate) => ({
      name: "john",
      age: 38,
    });
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    const mutation = renderHook(() =>
      useMutations({
        store,
        id,
        events,
        noUpdate: true,
        onChange,
      })
    );
    result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      payload: { value: "test" },
    });
    expect(mutation.result.current.state.name).toBe("john");
    expect(mutation.result.current.state.age).toBe(38);
  });

  test("Check none computed value", async () => {
    const id = "exampleId";
    const events = [CONSTANTS.UPDATE_NAME];
    const onChange = (_value, _resolver, _setNoUpdate) => {};
    const data = { name: "" };
    const { result } = await renderHook(() =>
      useStore({ store, reducer, data })
    );
    const mutation = renderHook(() =>
      useMutations({
        store,
        id,
        events,
        noUpdate: true,
        onChange,
      })
    );
    result.current.mutate({
      type: CONSTANTS.UPDATE_NAME,
      payload: { value: "test" },
    });
    expect(mutation.result.current.state).toStrictEqual({});
  });
});
