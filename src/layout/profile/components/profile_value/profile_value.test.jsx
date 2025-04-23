import { test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { ProfileValue } from "./profile_value.jsx";
import { ContentEditable } from "@bigmistqke/solid-contenteditable";

test("contenteditable", async () => {
  const [a, setA] = createSignal("a");

  const { getByRole } = render(() => (
    <ContentEditable
      textContent={a()}
      onTextContent={(content) => setA(content)}
      style={{ display: "inline-block", "min-width": "4rem" }}
    />
  ));

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("a");

  input.focus();

  await userEvent.keyboard("c");

  expect(input).toHaveTextContent(/^ca$/);
});

test("profile value", async () => {
  const [a, setA] = createSignal("a");

  const { getByText, getByRole } = render(() => (
    <ProfileValue
      value={a()}
      branch="b"
      onValueChange={(content) => {
        console.log(content);
        setA(content);
      }}
    />
  ));

  //const label = getByText(/^b is$/);

  //expect(label).toHaveTextContent(/^b is a$/);

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("a");

  input.focus();

  await userEvent.keyboard("c");

  expect(input).toHaveTextContent(/^ca$/);
});
