import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { OverviewValue } from "./overview_value.jsx";

describe("OverviewValue", () => {
  test("", async () => {
    const value = "a";

    const { getByText } = render(() => <OverviewValue value={value} />);

    expect(() => getByText("a")).not.toThrowError();
  });
});
