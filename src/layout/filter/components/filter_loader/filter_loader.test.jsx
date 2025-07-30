import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { FilterDirection } from "./filter_direction.jsx";

describe("FilterDirection", () => {
  test("first to last", async () => {
    setStore("searchParams", new URLSearchParams(".sortDirection=first"));

    expect(new URLSearchParams(store.searchParams).toString()).toEqual(
      new URLSearchParams(".sortDirection=first").toString(),
    );

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <FilterDirection />
      </StoreContext.Provider>
    ));

    const first = getByText("sort first");

    await userEvent.click(first);

    expect(new URLSearchParams(store.searchParams).toString()).toEqual(
      new URLSearchParams(".sortDirection=last").toString(),
    );
  });

  test("last to first", async () => {
    setStore("searchParams", new URLSearchParams(".sortDirection=last"));

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <FilterDirection />
      </StoreContext.Provider>
    ));

    const last = getByText("sort last");

    await userEvent.click(last);

    expect(new URLSearchParams(store.searchParams).toString()).toEqual(
      new URLSearchParams(".sortDirection=first").toString(),
    );
  });
});
