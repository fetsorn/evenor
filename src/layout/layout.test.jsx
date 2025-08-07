import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store, onMindChange } from "@/store/index.js";
import { setStore } from "@/store/store.js";
import {
  NavigationBack,
  NavigationRevert,
  NavigationSave,
  NavigationMenu,
} from "./navigation/index.js";
import {
  BottomCount,
  BottomLoader,
  BottomNew
} from "./bottom/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import { Filter } from "./filter/filter.jsx";
import { App, LayoutOverview, LayoutProfile } from "./layout.jsx";

vi.mock("@/store/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onMindChange: vi.fn(),
  };
});

vi.mock("./navigation/index.js", () => ({
  NavigationBack: vi.fn(),
  NavigationRevert: vi.fn(),
  NavigationSave: vi.fn(),
  NavigationMenu: vi.fn(),
}));

vi.mock("./bottom/index.js", () => ({
  BottomCount: vi.fn(),
  BottomLoader: vi.fn(),
  BottomNew: vi.fn(),
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

    expect(NavigationMenu).toHaveBeenCalledWith({});

    expect(Filter).toHaveBeenCalledWith({});

    expect(Overview).toHaveBeenCalledWith({});

    expect(BottomCount).toHaveBeenCalledWith({});

    expect(BottomLoader).toHaveBeenCalledWith({});

    expect(BottomNew).toHaveBeenCalledWith({});
  });
});

describe("LayoutProfile", () => {
  test("", async () => {
    setStore("record", { _: "mind", mind: "mind" });

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

  test("change mind", async () => {
    render(() => <App />);

    expect(onMindChange).toHaveBeenCalledWith("/", "");
  });
});
