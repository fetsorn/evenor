import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import {
  MenuSortQuery,
  MenuBaseQuery,
} from "@/layout/navigation/navigation_menu/components/index.js";
import { NavigationMenu } from "./navigation_menu.jsx";

vi.mock(
  "@/layout/navigation/navigation_menu/components/index.js",
  async (importOriginal) => {
    const mod = await importOriginal();

    return {
      ...mod,
      MenuSortQuery: vi.fn(),
      MenuBaseQuery: vi.fn(),
    };
  },
);

describe("NavigationMenu", () => {
  test("", async () => {
    setStore("searchParams", "_=mind&.sortBy=mind");

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationMenu />
      </StoreContext.Provider>
    ));

    expect(MenuBaseQuery).toHaveBeenCalled();

    expect(MenuSortQuery).toHaveBeenCalled();
  });
});
