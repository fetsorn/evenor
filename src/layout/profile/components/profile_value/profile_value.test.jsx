import { test, expect, vi } from "vitest";
import { createSignal } from "solid-js";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { ContentEditable } from "@bigmistqke/solid-contenteditable";
import { onRecordEdit } from "@/store/index.js";
import { ProfileValue } from "./profile_value.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn(),
  };
});

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
    <ProfileValue value={a()} branch="b" path={["b"]} />
  ));

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("a");

  input.focus();

  await userEvent.keyboard("c");

  expect(input).toHaveTextContent(/^ca$/);

  expect(onRecordEdit).toHaveBeenCalledWith(["b"], "ca");
});
