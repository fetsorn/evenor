import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { BottomSync } from "./bottom_sync.jsx";

describe("BottomSync", () => {
  test("", async () => {
    setStore("mergeConflict", true);

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <BottomSync />
      </StoreContext.Provider>
    ));

    expect(() => getByText("Loading...")).not.toThrowError();
  });
});
