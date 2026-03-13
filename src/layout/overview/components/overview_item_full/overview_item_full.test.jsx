import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { OverviewItemFull } from "./overview_item_full.jsx";

describe("OverviewItemFull", () => {
  test("", async () => {
    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewItemFull item={record} index={index} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
