import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore, onStartup } from "@/store/store.js";
import { NavigationBack } from "./navigation_back.jsx";

describe("NavigationBack", () => {
  test("", async () => {
    await onStartup();

    setStore("mind", { _: "mind", mind: "somemind" });

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationBack />
      </StoreContext.Provider>
    ));

    const back = getByText("back");

    await userEvent.click(back);

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(store.mind).toEqual({ _: "mind", mind: "root", name: "minds" });
  });
});
