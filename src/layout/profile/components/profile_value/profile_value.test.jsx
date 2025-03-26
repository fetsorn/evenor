import { test, expect } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
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

  // cannot use user.keyboard because jsdom needs innerText
  // https://github.com/jsdom/jsdom/issues/1245
  fireEvent.input(input, {
    target: { innerText: a() },
    inputType: "insertText",
    data: "c",
  });

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

  const label = getByText(/^b is$/);

  expect(label).toHaveTextContent(/^b is a$/);

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("a");

  input.focus();

  // cannot use user.keyboard because jsdom needs innerText
  // https://github.com/jsdom/jsdom/issues/1245
  fireEvent.input(input, {
    target: { innerText: a() },
    inputType: "insertText",
    data: "c",
  });

  expect(input).toHaveTextContent(/^ca$/);
});
