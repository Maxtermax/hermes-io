import { test, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { withReactive } from "../src/components/withReactive/withReactive";
import { Context } from "../src/context/context";
import { Observer } from "../src/observer/observer";

const TestContext = new Context("Test");
const TestObserver = new Observer();

const Wrapper = withReactive({
  context: TestContext,
  observer: TestObserver,
  values: {
    title: "test",
  },
});

test("Should Renders the component correctly", () => {
  render(<Wrapper id="test" render={({ title }) => <h1>{title}</h1>} />);
  const node = screen.getByText(/test/gi);
  expect(node).toBeInTheDocument();
});

test("Should re-render on notification", async () => {
  await render(<Wrapper id="test2" render={({ title }) => <h1>{title}</h1>} />);
  TestObserver.notify({
    context: TestContext,
    value: {
      type: "test2",
      value: { title: "new title" },
    },
  });
  await waitFor(() =>
    expect(screen.getByText(/new title/gi)).toBeInTheDocument()
  );
});
