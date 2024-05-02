import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { withNotify } from "../src/components/withNotify/withNotify";
import { Context } from "../src/context/context";
import { Observer } from "../src/observer/observer";

const TestContext = new Context("Test");
const TestObserver = new Observer();

const Wrapper = withNotify((props) => <h1>{Object.keys(props)}</h1>, {
  context: TestContext,
  observer: TestObserver,
});

test("Should render notify component", () => {
  render(<Wrapper />);
  const node = screen.getByText(/notify/gi);
  expect(node).toBeInTheDocument();
})

