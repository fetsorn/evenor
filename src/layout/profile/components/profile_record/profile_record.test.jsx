import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { ProfileRecord } from "./profile_record.jsx";

describe("ProfileRecord", () => {
  test("base value", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = { _: "repo", branch: items };

    const onRecordChange = vi.fn(() => {});

    const onRecordRemove = vi.fn(() => {});

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileRecord
          index={index}
          baseRecord={baseRecord}
          record={item}
          onRecordChange={onRecordChange}
          onRecordRemove={onRecordRemove}
        />
      </StoreContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");

    expect(() => getByText("Add description_en")).not.toThrowError();
  });

  test("leaf value", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a", description_en: "b" };

    const items = [item];

    const baseRecord = { _: "repo", branch: items };

    const onRecordChange = vi.fn(() => {});

    const onRecordRemove = vi.fn(() => {});

    const { getAllByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileRecord
          index={index}
          baseRecord={baseRecord}
          record={item}
          onRecordChange={onRecordChange}
          onRecordRemove={onRecordRemove}
        />
      </StoreContext.Provider>
    ));

    const inputs = getAllByRole("textbox");

    // render an input with value
    expect(inputs[0]).toHaveTextContent("a");

    expect(inputs[1]).toHaveTextContent("b");

    expect(() => getByText("Add another description_en")).not.toThrowError();
  });
});
