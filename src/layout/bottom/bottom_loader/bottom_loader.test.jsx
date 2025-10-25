import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { BottomLoader } from "./bottom_loader.jsx";

describe("BottomLoader", () => {
  test("", async () => {
    setStore("loading", true);

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <BottomLoader />
      </StoreContext.Provider>
    ));

    expect(() => getByText("Conflict")).not.toThrowError();
  });
});
