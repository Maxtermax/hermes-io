import { Context } from "./Context";

describe("Context", () => {
  let context;

  beforeEach(() => {
    context = new Context("Test Description");
  });

  afterEach(() => {
    context = null;
  });

  test("update method updates context properties", () => {
    const value = "test value";
    const listener = jest.fn();
    context.update({ value, listener });

    expect(context.date).toBeInstanceOf(Date);
    expect(context.value).toBe(value);
    expect(context.listener).toBe(listener);
    expect(context.stackTrace).toEqual(expect.any(String));
  });

  test("takeSnapshot method returns a snapshot object", () => {
    const snapshot = context.takeSnapshot();

    expect(snapshot._internalId).toEqual(expect.any(String));
    expect(snapshot.value).toBe(context.value);
    expect(snapshot.date).toBe(context.date);
    expect(snapshot.listener).toBe(context.listener);
    expect(snapshot.stackTrace).toBe(context.stackTrace);
  });

  test("getStackTrace method returns stack trace", () => {
    const stackTrace = context.getStackTrace();

    expect(stackTrace).toEqual(expect.any(String));
  });
});
