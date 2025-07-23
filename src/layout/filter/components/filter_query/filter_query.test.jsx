import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { FilterQuery } from "./filter_query.jsx";

describe("FilterQuery", () => {
  test("changes", async () => {
    const field = "field";

    const value = "value";

    setStore("searchParams", new URLSearchParams("field=value"));

    const { getByRole, getByText } = render(() => (
      <FilterQuery field={field} value={value} />
    ));

    const input = getByRole("textbox");

    expect(input).toHaveValue("value");

    input.focus();

    await userEvent.keyboard("1");

    expect(store.searchParams.toString()).toEqual(
      new URLSearchParams("field=value1").toString(),
    );
  });

  test("removes", async () => {
    const field = "field";

    const value = "value";

    setStore("searchParams", new URLSearchParams("field=value"));

    const { getByRole, getByText } = render(() => (
      <FilterQuery field={field} value={value} />
    ));

    const remove = getByText("X");

    await userEvent.click(remove);

    expect(store.searchParams.toString()).toEqual(
      new URLSearchParams("").toString(),
    );
  });
});
