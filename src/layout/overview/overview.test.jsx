import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { Overview } from "./overview.jsx";

describe("Overview", () => {
  test("no items", async () => {
    const items = [];

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Overview items={items} />
      </StoreContext.Provider>
    ));

    expect(() =>
      getByText('press "new" in the top right corner to add entries'),
    ).not.toThrowError();
  });

  test("item", async () => {
    const item = {
      _: "mind",
      mind: "mind",
    };

    const items = [item];

    setStore("records", items);

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Overview />
      </StoreContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
