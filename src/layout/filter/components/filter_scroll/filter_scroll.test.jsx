import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { FilterScroll } from "./filter_scroll.jsx";

describe("FilterScroll", () => {
  test("", async () => {
    const { getByText } = render(() => <FilterScroll />);

    expect(() => getByText("scroll to top")).not.toThrowError();
  });
});
