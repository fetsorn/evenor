import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import { OverviewValue } from "./overview_value.jsx";

describe("OverviewValue", () => {
  test("", async () => {
    const branch = "repo";

    const value = "uuid";

    const { getByText } = render(() => (
      <StoreContext.Provider value={{ store }}>
        <OverviewValue value={value} branch={branch} />
      </StoreContext.Provider>
    ));

    expect(() => getByText("uuid")).not.toThrowError();
  });
});
