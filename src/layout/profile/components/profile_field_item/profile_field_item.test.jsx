import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { ProfileFieldItem } from "./profile_field_item.jsx";

describe("ProfileFieldItem", () => {
  test("object", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const { getByRole, getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileFieldItem
          index={index}
          branch={branch}
          item={item}
          path={["record", "branch", 0]}
        />
      </StoreContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");
  });
});
