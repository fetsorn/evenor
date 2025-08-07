import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onRecordCreate } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { BottomNew } from "./bottom_new.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordCreate: vi.fn(),
  };
});

describe("BottomNew", () => {
  test("", async () => {
    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <BottomNew />
      </StoreContext.Provider>
    ));

    const bottomNew = getByText("new");

    await userEvent.click(bottomNew);

    expect(onRecordCreate).toHaveBeenCalledWith();
  });
});
