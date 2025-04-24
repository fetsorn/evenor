import { describe, test, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { FilterOption } from "./filter_option.jsx";

describe("FilterOption", () => {
  test("", async () => {
    const field = "field";

    const { getByText } = render(() => <FilterOption field={field} />);

    expect(() => getByText("field")).not.toThrowError();
  });
});
