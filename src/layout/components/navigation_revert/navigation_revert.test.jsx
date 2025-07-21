import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { NavigationRevert } from "./navigation_revert.jsx";

describe("NavigationRevert", () => {
  test("", async () => {
    setStore("record", { _: "mind", mind: "mind" });

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationRevert />
      </StoreContext.Provider>
    ));

    const revert = getByText("revert");

    await userEvent.click(revert);

    expect(store.record).toEqual(undefined);
  });
});
