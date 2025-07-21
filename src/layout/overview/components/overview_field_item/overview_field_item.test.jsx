import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { OverviewFieldItem } from "./overview_field_item.jsx";

describe("OverviewFieldItem", () => {
  test("value", async () => {
    const index = "";

    const item = "a";

    const branch = "name";

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });

  test("record", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
