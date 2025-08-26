import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { OverviewRecord } from "./overview_record.jsx";

describe("OverviewRecord", () => {
  test("no items", async () => {
    const index = "";

    const baseRecord = { _: "mind", mind: "mind" };

    const record = baseRecord;

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewRecord record={record} index={index} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("record no items")).toThrowError();
  });

  test("", async () => {
    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
      branch: [{ _: "branch", branch: value }],
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewRecord record={record} index={index} />
      </StoreContext.Provider>
    ));

    await userEvent.click(getByText("with..."));

    expect(() => getByText("a")).not.toThrowError();
  });
});
