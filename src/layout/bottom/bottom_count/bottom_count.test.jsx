import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { BottomCount } from "./bottom_count.jsx";

describe("BottomCount", () => {
  test("0", async () => {
    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <BottomCount />
      </StoreContext.Provider>
    ));

    expect(() => getByText("found 0")).not.toThrowError();
  });

  test("1", async () => {
    setStore("records", [1]);

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <BottomCount />
      </StoreContext.Provider>
    ));

    expect(() => getByText("found 1")).not.toThrowError();
  });
});
