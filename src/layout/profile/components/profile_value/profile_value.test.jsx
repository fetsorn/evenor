import { test, expect, vi } from "vitest";
import { createSignal } from "solid-js";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { onRecordEdit } from "@/store/index.js";
import { ProfileValue } from "./profile_value.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn(),
  };
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
