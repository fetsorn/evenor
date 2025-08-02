import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { NavigationLoader } from "./navigation_loader.jsx";

describe("NavigationLoader", () => {
  test("first to last", async () => {
    setStore("loading", true);

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationLoader />
      </StoreContext.Provider>
    ));

    expect(() => getByText("Loading...")).not.toThrowError();
  });
});
