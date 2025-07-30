import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { FilterLoader } from "./filter_loader.jsx";

describe("FilterLoader", () => {
  test("first to last", async () => {
    setStore("loading", true);

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <FilterLoader />
      </StoreContext.Provider>
    ));

    expect(() => getByText("Loading...")).not.toThrowError();
  });
});
