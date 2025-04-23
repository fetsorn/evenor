import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { ProfileFieldItem, Foo } from "./profile_field_item.jsx";

describe("Foo", () => {
  test("schema undefined", async () => {
    const index = "";

    const branch = "a";

    const item = "b";

    const baseRecord = { _: "c", a: [item] };

    const onFieldItemChange = vi.fn(() => {});

    const onFieldItemRemove = vi.fn(() => {});

    const { getByRole } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Foo
          index={index}
          baseRecord={baseRecord}
          branch={branch}
          item={item}
          onFieldItemChange={onFieldItemChange}
          onFieldItemRemove={onFieldItemRemove}
        />
      </StoreContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("b");
  });

  test("object", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const baseRecord = { _: "repo", branch: [item] };

    const onFieldItemChange = vi.fn(() => {});

    const onFieldItemRemove = vi.fn(() => {});

    const { getByRole } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <Foo
          index={index}
          baseRecord={baseRecord}
          branch={branch}
          item={item}
          onFieldItemChange={onFieldItemChange}
          onFieldItemRemove={onFieldItemRemove}
        />
      </StoreContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");
  });
});

describe("ProfileFieldItem", () => {
  test("confirmation no", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const baseRecord = { _: "repo", branch: [item] };

    const onFieldItemChange = vi.fn(() => {});

    const onFieldItemRemove = vi.fn(() => {});

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileFieldItem
          index={index}
          baseRecord={baseRecord}
          branch={branch}
          item={item}
          onFieldItemChange={onFieldItemChange}
          onFieldItemRemove={onFieldItemRemove}
        />
      </StoreContext.Provider>
    ));

    // find remove
    const remove = getByText(/Remove/);

    // click remove
    await userEvent.click(remove);

    // find no
    const no = getByText(/No/);

    // click no
    await userEvent.click(no);

    // check that remove did not work
    expect(onFieldItemRemove).not.toHaveBeenCalled();

    // check that remove shows again
    expect(() => getByText(/Remove/)).not.toThrowError();
  });

  test("confirmation yes", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const baseRecord = { _: "repo", branch: [item] };

    const onFieldItemChange = vi.fn(() => {});

    const onFieldItemRemove = vi.fn(() => {});

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <ProfileFieldItem
          index={index}
          baseRecord={baseRecord}
          branch={branch}
          item={item}
          onFieldItemChange={onFieldItemChange}
          onFieldItemRemove={onFieldItemRemove}
        />
      </StoreContext.Provider>
    ));

    // find remove
    const remove = getByText(/Remove/);

    // click remove
    await userEvent.click(remove);

    // find yes
    const yes = getByText(/Yes/);

    // click yes
    await userEvent.click(yes);

    // check that remove worked
    expect(onFieldItemRemove).toHaveBeenCalledWith();
  });
});
