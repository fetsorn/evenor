import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { OverviewItem } from "./overview_item.jsx";

describe("OverviewItem", () => {
  test("", async () => {
    const index = "";

    const value = "a";

    const baseRecord = {
      _: "repo",
      repo: "uuid",
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewItem item={record} index={index} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("uuid")).not.toThrowError();
  });
});
