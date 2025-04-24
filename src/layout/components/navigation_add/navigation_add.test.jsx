import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onRecordCreate } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { NavigationAdd } from "./navigation_add.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordCreate: vi.fn(),
  };
});

describe("NavigationAdd", () => {
  test("", async () => {
    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationAdd />
      </StoreContext.Provider>
    ));

    const add = getByText("add");

    await userEvent.click(add);

    expect(onRecordCreate).toHaveBeenCalledWith();
  });
});
