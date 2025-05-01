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
  const record = { _: "repo", repo: "uuid" };

  setStore("record", record);

  const path = ["record", "repo"];

  const { getByText, getByRole } = render(() => (
    <ProfileValue value={store.record.repo} branch="repo" path={path} />
  ));

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("uuid");

  input.focus();

  await userEvent.keyboard("a");

  expect(onRecordEdit).toHaveBeenCalledWith(path, "auuid");

  expect(store.record.repo).toBe("auuid");
});
