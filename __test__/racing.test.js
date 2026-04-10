import { renderHook } from "@testing-library/react-hooks/dom";
import { Observer } from "../src/observer/observer";
import { Context } from "../src/context/context";
import { Store, MicroStore } from "../src/store/store";
import { useStore } from "../src/hooks/useStore";
import { useMutations } from "../src/hooks/useMutations";

const CONSTANTS = {
  UPDATE_NAME: "UPDATE_NAME",
  UPDATE_AGE: "UPDATE_AGE",
};

const reducer = (state, action) => {
  const events = {
    [CONSTANTS.UPDATE_NAME]: () => ({ ...state, name: action.payload.value }),
    [CONSTANTS.UPDATE_AGE]: () => ({ ...state, age: action.payload.value }),
  };
  return events[action.type]?.() ?? state;
};

describe("Racing conditions", () => {
  describe("Observer", () => {
    it("concurrent notify calls should each resolve independently", async () => {
      const observer = new Observer();
      const results = [];
      observer.subscribe((args, resolve) => {
        setTimeout(() => {
          results.push(args.id);
          resolve(args.id);
        }, args.delay);
      });

      const [r1, r2, r3] = await Promise.all([
        observer.notify({ id: 1, delay: 30 }),
        observer.notify({ id: 2, delay: 10 }),
        observer.notify({ id: 3, delay: 20 }),
      ]);

      expect(r1).toBe(1);
      expect(r2).toBe(2);
      expect(r3).toBe(3);
    });

    it("notify resolves null on timeout instead of hanging", async () => {
      const observer = new Observer();
      observer.subscribe(() => {
        // never calls resolve
      });

      const result = await observer.notify({}, { timeout: 50 });
      expect(result).toBeNull();
    });

    it("rapid subscribe and unsubscribe should not corrupt subscriber list", () => {
      const observer = new Observer();
      const callbacks = Array.from({ length: 100 }, (_, i) => {
        const fn = vi.fn();
        fn.id = `cb-${i}`;
        return fn;
      });

      // subscribe all
      callbacks.forEach((cb) => observer.subscribe(cb));
      expect(observer.subscriptors).toHaveLength(100);

      // unsubscribe even-indexed
      callbacks.forEach((cb, i) => {
        if (i % 2 === 0) observer.unsubscribe(cb);
      });
      expect(observer.subscriptors).toHaveLength(50);

      // remaining should be odd-indexed only
      observer.subscriptors.forEach((cb) => {
        const index = parseInt(cb.id.split("-")[1]);
        expect(index % 2).toBe(1);
      });
    });

    it("unsubscribing during notify skips subsequent subscribers (known limitation)", () => {
      const observer = new Observer();
      const callOrder = [];
      const cb1 = vi.fn((args, resolve) => {
        callOrder.push(1);
        // unsubscribing cb2 during iteration causes forEach to skip it
        observer.unsubscribe(cb2);
      });
      const cb2 = vi.fn((args, resolve) => {
        callOrder.push(2);
        resolve("done");
      });
      cb1.id = "cb1";
      cb2.id = "cb2";

      observer.subscribe(cb1);
      observer.subscribe(cb2);
      observer.notify({ test: true });

      // cb2 is skipped because splice shifts indices during forEach
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(0);
      expect(callOrder).toEqual([1]);
      expect(observer.subscriptors).toHaveLength(1);
    });

    it("multiple resolves should only resolve promise once", async () => {
      const observer = new Observer();
      observer.subscribe((args, resolve) => {
        resolve("first");
        resolve("second");
      });

      const result = await observer.notify({});
      expect(result).toBe("first");
    });

    it("notify with zero timeout should not set a timer", async () => {
      const observer = new Observer();
      observer.subscribe((args, resolve) => resolve("ok"));

      const result = await observer.notify({}, { timeout: 0 });
      expect(result).toBe("ok");
    });
  });

  describe("Store concurrent mutations", () => {
    let context, observer, store;

    beforeEach(() => {
      context = new Context("RaceTest");
      observer = new Observer();
      store = new Store({ context, observer });
    });

    it("rapid sequential mutations should all trigger subscribers", async () => {
      const data = { name: "", age: 0 };
      const { result } = await renderHook(() =>
        useStore({ store, reducer, data })
      );

      const callCount = vi.fn((_value, resolver) => resolver?.());
      renderHook(() =>
        useMutations({
          store,
          id: "race-target",
          events: [CONSTANTS.UPDATE_NAME],
          onChange: callCount,
        })
      );

      for (let i = 0; i < 20; i++) {
        await result.current.mutate({
          type: CONSTANTS.UPDATE_NAME,
          payload: { value: `name-${i}` },
        });
      }

      expect(callCount).toHaveBeenCalledTimes(20);
    });

    it("interleaved mutations of different types should maintain consistency", async () => {
      const data = { name: "", age: 0 };
      const { result } = await renderHook(() =>
        useStore({ store, reducer, data })
      );

      const nameChanges = [];
      const ageChanges = [];

      renderHook(() =>
        useMutations({
          store,
          id: "interleave",
          events: [CONSTANTS.UPDATE_NAME],
          onChange: (value, resolver) => {
            nameChanges.push(value);
            resolver?.();
          },
        })
      );

      renderHook(() =>
        useMutations({
          store,
          id: "interleave-age",
          events: [CONSTANTS.UPDATE_AGE],
          onChange: (value, resolver) => {
            ageChanges.push(value);
            resolver?.();
          },
        })
      );

      for (let i = 0; i < 10; i++) {
        await result.current.mutate({
          type: CONSTANTS.UPDATE_NAME,
          payload: { value: `name-${i}` },
        });
        await result.current.mutate({
          type: CONSTANTS.UPDATE_AGE,
          payload: { value: i },
        });
      }

      expect(nameChanges).toHaveLength(10);
      expect(ageChanges).toHaveLength(10);
    });

    it("state flows correctly through notifications after burst", async () => {
      const data = { name: "" };
      const { result } = await renderHook(() =>
        useStore({ store, reducer, data })
      );

      const receivedValues = [];
      renderHook(() =>
        useMutations({
          store,
          id: "burst",
          events: [CONSTANTS.UPDATE_NAME],
          onChange: (value, resolver) => {
            receivedValues.push(value);
            resolver?.();
          },
        })
      );

      for (let i = 0; i < 50; i++) {
        await result.current.mutate({
          type: CONSTANTS.UPDATE_NAME,
          payload: { value: `v${i}` },
        });
      }

      expect(receivedValues).toHaveLength(50);
      expect(receivedValues[49]).toBe("v49");
    });
  });

  describe("MicroStore", () => {
    it("concurrent registerListener and subscribeStore should not duplicate subscriptions", () => {
      const microStore = new MicroStore();
      const context = new Context("MicroRace");
      const observer = new Observer();
      const store = new Store({ id: "ms-1", context, observer });

      const listeners = Array.from({ length: 10 }, (_, i) => {
        const fn = vi.fn();
        fn.id = `listener-${i}`;
        return fn;
      });

      // Register all listeners
      listeners.forEach((l) => microStore.registerListener("ms-1", l));

      // Subscribe multiple times — should not duplicate
      microStore.add("ms-1", store);
      microStore.subscribeStore("ms-1", store);
      microStore.subscribeStore("ms-1", store);

      expect(observer.subscriptors).toHaveLength(10);
    });

    it("remove unsubscribes wrapped subscriber from observer (known issue: wrapper reference mismatch)", () => {
      const microStore = new MicroStore();
      const context = new Context("RemoveRace");
      const observer = new Observer();
      const store = new Store({ id: "rm-1", context, observer });

      const fn1 = vi.fn();
      fn1.id = "l1";
      const fn2 = vi.fn();
      fn2.id = "l2";

      microStore.registerListener("rm-1", fn1);
      microStore.registerListener("rm-1", fn2);
      microStore.add("rm-1", store);

      expect(observer.subscriptors).toHaveLength(2);

      // remove tries observer.unsubscribe(listener) but observer holds subscriber wrappers
      // so the unsubscribe fails silently — the subscriber remains in observer
      microStore.remove("rm-1", "l1");

      // listener is removed from microStore's internal list
      expect(microStore.listeners.get("rm-1")).toHaveLength(1);

      // BUG: observer still has the wrapper because unsubscribe uses reference equality
      // and the wrapper !== the original listener
      expect(observer.subscriptors).toHaveLength(2);
    });

    it("registerListener preserves order for same id", () => {
      const microStore = new MicroStore();
      const fns = Array.from({ length: 5 }, (_, i) => {
        const fn = vi.fn();
        fn.id = `fn-${i}`;
        return fn;
      });

      fns.forEach((fn) => microStore.registerListener("ordered", fn));
      const stored = microStore.listeners.get("ordered");
      stored.forEach((fn, i) => {
        expect(fn.id).toBe(`fn-${i}`);
      });
    });

    it("hasListener returns correct results under rapid registration", () => {
      const microStore = new MicroStore();
      const fns = Array.from({ length: 20 }, (_, i) => {
        const fn = vi.fn();
        fn.id = `rapid-${i}`;
        return fn;
      });

      fns.forEach((fn) => microStore.registerListener("rapid", fn));

      fns.forEach((fn) => {
        expect(microStore.hasListener(fn.id)).toBe(true);
      });
      expect(microStore.hasListener("nonexistent")).toBe(false);
    });
  });

  describe("Targeted mutations under load", () => {
    it("only targeted subscribers receive notifications in burst", async () => {
      const context = new Context("TargetRace");
      const observer = new Observer();
      const store = new Store({ context, observer });
      const data = { name: "" };

      const { result } = await renderHook(() =>
        useStore({ store, reducer, data })
      );

      const handlers = {};
      const ids = Array.from({ length: 5 }, (_, i) => `target-${i}`);

      ids.forEach((id) => {
        handlers[id] = vi.fn((_value, resolver) => resolver?.());
        renderHook(() =>
          useMutations({
            store,
            id,
            events: [CONSTANTS.UPDATE_NAME],
            onChange: handlers[id],
          })
        );
      });

      // Fire 50 mutations each targeting a single subscriber
      for (let i = 0; i < 50; i++) {
        const targetId = ids[i % ids.length];
        await result.current.mutate({
          type: CONSTANTS.UPDATE_NAME,
          targets: [targetId],
          payload: { value: `burst-${i}` },
        });
      }

      // Each target should have received exactly 10 calls (50 / 5)
      ids.forEach((id) => {
        expect(handlers[id]).toHaveBeenCalledTimes(10);
      });
    });

    it("broadcast mutations reach all subscribers under load", async () => {
      const context = new Context("BroadcastRace");
      const observer = new Observer();
      const store = new Store({ context, observer });
      const data = { name: "" };

      const { result } = await renderHook(() =>
        useStore({ store, reducer, data })
      );

      const handlers = Array.from({ length: 10 }, () =>
        vi.fn((_value, resolver) => resolver?.())
      );

      handlers.forEach((handler, i) => {
        renderHook(() =>
          useMutations({
            store,
            id: `broadcast-${i}`,
            events: [CONSTANTS.UPDATE_NAME],
            onChange: handler,
          })
        );
      });

      // Fire 20 broadcast mutations (no targets)
      for (let i = 0; i < 20; i++) {
        await result.current.mutate({
          type: CONSTANTS.UPDATE_NAME,
          payload: { value: `broadcast-${i}` },
        });
      }

      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledTimes(20);
      });
    });
  });
});
