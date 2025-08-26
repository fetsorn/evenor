import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { MenuSortQuery } from "./menu_sort_query.jsx";

describe("MenuSortQuery", () => {
  test("", async () => {
    setStore("searchParams", "_=mind&.sortBy=mind");

    const { getByRole, getAllByRole } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <MenuSortQuery />
      </StoreContext.Provider>
    ));

    expect(getByRole('option', { name: 'name' }).selected).toBe(false)

    expect(getAllByRole('option').length).toBe(7)

    await userEvent.selectOptions(
      getByRole('combobox'),
      getByRole('option', { name: 'name' }),
    );

    expect(getByRole('option', { name: 'name' }).selected).toBe(true)
  });
});
