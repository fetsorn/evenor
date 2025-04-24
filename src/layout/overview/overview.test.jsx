import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { Overview } from "./overview.jsx";

describe("Overview", () => {
  test("no items", async () => {
    const items = [];

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Overview items={items} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("list no items")).not.toThrowError();
  });

  test("item", async () => {
    const item = {
      _: "repo",
      repo: "uuid",
      branch: [{ _: "branch", branch: "a" }],
    };

    const items = [item];

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Overview items={items} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
