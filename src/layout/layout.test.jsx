import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onRepoChange } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import {
  NavigationBack,
  NavigationNew,
  NavigationRevert,
  NavigationSave,
} from "./components/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import { Filter } from "./filter/filter.jsx";
import { App, LayoutOverview, LayoutProfile } from "./layout.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRepoChange: vi.fn(),
  };
});

vi.mock("./components/index.js", () => ({
  NavigationBack: vi.fn(),
  NavigationNew: vi.fn(),
  NavigationRevert: vi.fn(),
  NavigationSave: vi.fn(),
}));

vi.mock("./overview/overview.jsx", () => ({
  Overview: vi.fn(),
}));

vi.mock("./profile/profile.jsx", () => ({
  Profile: vi.fn(),
}));

vi.mock("./filter/filter.jsx", () => ({
  Filter: vi.fn(),
}));

describe("LayoutOverview", () => {
  test("", async () => {
    render(() => <LayoutOverview />);

    expect(NavigationBack).toHaveBeenCalledWith({});

    expect(NavigationNew).toHaveBeenCalledWith({});

    expect(Filter).toHaveBeenCalledWith({});

    expect(Overview).toHaveBeenCalledWith({});
  });
});

describe("LayoutProfile", () => {
  test("", async () => {
    setStore("record", { _: "repo", repo: "uuid" });

    render(() => (
      <StoreContext.Provider value={{ store }}>
        <LayoutProfile />
      </StoreContext.Provider>
    ));

    expect(NavigationRevert).toHaveBeenCalledWith({});

    expect(NavigationSave).toHaveBeenCalledWith({});

    expect(Profile).toHaveBeenCalledWith({});
  });
});

describe("App", () => {
  test("git commit", async () => {
    const { getByText } = render(() => <App />);

    expect(() =>
      getByText(__COMMIT_HASH__, {
        includeHidden: true,
      }),
    ).not.toThrowError();
  });

  test("git commit", async () => {
    render(() => <App />);

    expect(onRepoChange).toHaveBeenCalledWith("/", "");
  });
});
