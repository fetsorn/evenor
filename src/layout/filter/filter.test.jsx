import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import {
  FilterOption,
  FilterQuery,
} from "@/layout/filter/components/index.js";
import { Filter } from "./filter.jsx";

vi.mock("@/layout/filter/components/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    FilterOption: vi.fn(),
    FilterQuery: vi.fn(),
  };
});

describe("Filter", () => {
  test("", async () => {
    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Filter />
      </StoreContext.Provider>
    ));

    await userEvent.click(getByText(/search/));

    expect(FilterOption).toHaveBeenNthCalledWith(1, { field: "name" });
  });
});
