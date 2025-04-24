import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onRecordSave } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { NavigationSave } from "./navigation_save.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordSave: vi.fn(),
  };
});

describe("NavigationSave", () => {
  test("", async () => {
    const record = { _: "repo", repo: "uuid" };

    setStore("record", record);

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationSave />
      </StoreContext.Provider>
    ));

    const save = getByText("save");

    await userEvent.click(save);

    expect(onRecordSave).toHaveBeenCalledWith(record, record);
  });
});
