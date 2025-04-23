import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { ProfileField } from "./profile_field.jsx";

describe("ProfileField", () => {
  test("items", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = { _: "repo", branch: items };

    const onFieldChange = vi.fn(() => {});

    const onFieldRemove = vi.fn(() => {});

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileField
          index={index}
          branch={branch}
          items={items}
          baseRecord={baseRecord}
          onFieldChange={onFieldChange}
          onFieldRemove={onFieldRemove}
        />
      </StoreContext.Provider>
    ));

    // for some reason spoiler state is shared between test cases
    try {
      const ellipsis = getByText(`${branch}...`);

      await userEvent.click(ellipsis);
    } catch {}

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");
  });

  test("no items", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [];

    const baseRecord = { _: "repo", branch: items };

    const onFieldChange = vi.fn(() => {});

    const onFieldRemove = vi.fn(() => {});

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileField
          index={index}
          branch={branch}
          items={items}
          baseRecord={baseRecord}
          onFieldChange={onFieldChange}
          onFieldRemove={onFieldRemove}
        />
      </StoreContext.Provider>
    ));

    // for some reason spoiler state is shared between test cases
    try {
      const ellipsis = getByText(`${branch}...`);

      await userEvent.click(ellipsis);
    } catch {}

    expect(() => getByText(/field no items/)).not.toThrowError();
  });
});
