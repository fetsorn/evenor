import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import {
  FilterCount,
  FilterSort,
  FilterOption,
  FilterQuery,
  FilterScroll,
} from "@/layout/filter/components/index.js";
import { Filter } from "./filter.jsx";

vi.mock("@/layout/filter/components/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    FilterCount: vi.fn(),
    FilterSort: vi.fn(),
    FilterOption: vi.fn(),
    FilterQuery: vi.fn(),
    FilterScroll: vi.fn(),
  };
});

describe("Filter", () => {
  test("", async () => {
    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Filter />
      </StoreContext.Provider>
    ));

    expect(FilterCount).toHaveBeenCalledWith({});

    expect(FilterSort).toHaveBeenCalledWith({});

    await userEvent.click(getByText(/search/));

    expect(FilterOption).toHaveBeenNthCalledWith(1, { field: "name" });

    expect(FilterQuery).toHaveBeenNthCalledWith(1, {
      field: "_",
      value: "mind",
    });

    expect(FilterScroll).toHaveBeenCalledWith({});
  });
});
