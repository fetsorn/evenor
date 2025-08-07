import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { OverviewFilter } from "./overview_filter.jsx";

describe("OverviewFilter", () => {
  test("", async () => {
    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewFilter />
      </StoreContext.Provider>
    ));

    expect(true).toBe(false);
  });
});
