import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { MenuBaseQuery } from "./menu_base_query.jsx";

describe("MenuBaseQuery", () => {
  test("", async () => {
    setStore("searchParams", "_=mind");

    const { getByRole, getAllByRole } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <MenuBaseQuery />
      </StoreContext.Provider>
    ));

    expect(getByRole('option', { name: 'mind' }).selected).toBe(true)

    expect(getAllByRole('option').length).toBe(14)

    await userEvent.selectOptions(
      getByRole('combobox'),
      getByRole('option', { name: 'branch' }),
    );

    expect(getByRole('option', { name: 'branch' }).selected).toBe(true)
  });
});
