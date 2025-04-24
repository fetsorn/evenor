import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { NavigationBack } from "./navigation_back.jsx";

describe("NavigationBack", () => {
  test("", async () => {
    setStore("repo", { _: "repo", repo: "uuid" });

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <NavigationBack />
      </StoreContext.Provider>
    ));

    const back = getByText("back");

    await userEvent.click(back);

    expect(store.repo).toEqual({ _: "repo", repo: "root" });
  });
});
