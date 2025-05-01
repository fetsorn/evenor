import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onRecordCreate } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { NavigationNew } from "./navigation_new.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordCreate: vi.fn(),
  };
});

describe("NavigationNew", () => {
  test("", async () => {
    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationNew />
      </StoreContext.Provider>
    ));

    const navigationNew = getByText("new");

    await userEvent.click(navigationNew);

    expect(onRecordCreate).toHaveBeenCalledWith();
  });
});
