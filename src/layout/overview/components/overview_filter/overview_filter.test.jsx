import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onSearchBar } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { OverviewFilter } from "./overview_filter.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onSearchBar: vi.fn(),
  };
});

describe("OverviewFilter", () => {
  test("", async () => {
    const { getByText, getByRole } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewFilter />
      </StoreContext.Provider>
    ));

    const input = getByRole("textbox");

    input.focus();

    await userEvent.keyboard("a");

    expect(onSearchBar).toHaveBeenCalledWith("a");

    expect(() => getByText("search")).not.toThrowError();
  });
});
