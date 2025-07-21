import { test, expect, vi } from "vitest";
import { createSignal } from "solid-js";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { store, onRecordEdit } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { ProfileValue } from "./profile_value.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((path, value) => setStore(...path, value)),
  };
});

test("profile value", async () => {
  const record = { _: "mind", mind: "mind" };

  setStore("record", record);

  const path = ["record", "mind"];

  const { getByText, getByRole } = render(() => (
    <ProfileValue value={store.record.mind} branch="mind" path={path} />
  ));

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("mind");

  input.focus();

  await userEvent.keyboard("a");

  expect(onRecordEdit).toHaveBeenCalledWith(path, "amind");

  expect(store.record.mind).toBe("amind");
});
