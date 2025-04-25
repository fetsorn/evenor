import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { OverviewField } from "./overview_field.jsx";

describe("OverviewField", () => {
  test("no items", async () => {
    const index = "";

    const branch = "branch";

    const baseRecord = { _: "repo", repo: "uuid" };

    const items = [];

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewField index={index} branch={branch} items={items} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("field no items")).not.toThrowError();
  });

  test("record", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = { _: "repo", repo: "uuid", branch: items };

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewField index={index} branch={branch} items={items} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
