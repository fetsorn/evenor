import { describe, expect, test } from "vitest";
import { makeURL, parseQueryString, buildSearchParams } from "@/pure.js";

describe("makeURL", () => {
  test("sets root", () => {
    expect(makeURL(new URLSearchParams("_=a&a=1&b=2"), "root")).toStrictEqual(
      "#?_=a&a=1&b=2",
    );
  });

  test("sets mind", () => {
    expect(makeURL(new URLSearchParams("_=a&a=1&b=2"), "id")).toStrictEqual(
      "#/id?_=a&a=1&b=2",
    );
  });

  test("sets sortBy", () => {
    expect(makeURL(new URLSearchParams("_=a&a=1&b=2"), "id")).toStrictEqual(
      "#/id?_=a&a=1&b=2",
    );
  });
});

describe("parseQueryString", () => {
  const keywords = ["date", "name", "language"];

  test("empty string", () => {
    expect(parseQueryString("", keywords)).toStrictEqual({
      filters: {},
      freeform: [],
    });
  });

  test("freeform only", () => {
    expect(parseQueryString("hello world", keywords)).toStrictEqual({
      filters: {},
      freeform: ["hello", "world"],
    });
  });

  test("keyword only", () => {
    expect(parseQueryString("date:2024", keywords)).toStrictEqual({
      filters: { date: "2024" },
      freeform: [],
    });
  });

  test("mixed freeform and keywords", () => {
    expect(
      parseQueryString("hello date:2024 world language:rust", keywords),
    ).toStrictEqual({
      filters: { date: "2024", language: "rust" },
      freeform: ["hello", "world"],
    });
  });

  test("keyword with empty value stays keyword", () => {
    expect(parseQueryString("date:", keywords)).toStrictEqual({
      filters: { date: "" },
      freeform: [],
    });
  });

  test("unknown colon token becomes freeform", () => {
    expect(parseQueryString("foo:bar", keywords)).toStrictEqual({
      filters: {},
      freeform: ["foo:bar"],
    });
  });

  test("quoted value", () => {
    expect(parseQueryString('name:"John Doe"', keywords)).toStrictEqual({
      filters: { name: "John Doe" },
      freeform: [],
    });
  });
});

describe("buildSearchParams", () => {
  test("keyword filters", () => {
    const parsed = { filters: { date: "2024" }, freeform: [] };
    const params = buildSearchParams("mind", parsed);

    expect(params.get("_")).toBe("mind");
    expect(params.get("date")).toBe("2024");
    expect(params.get("mind")).toBeNull();
  });

  test("freeform becomes base regex", () => {
    const parsed = { filters: {}, freeform: ["hello", "world"] };
    const params = buildSearchParams("mind", parsed);

    expect(params.get("_")).toBe("mind");
    expect(params.get("mind")).toBe("hello|world");
  });

  test("mixed", () => {
    const parsed = { filters: { date: "2024" }, freeform: ["hello"] };
    const params = buildSearchParams("mind", parsed);

    expect(params.get("_")).toBe("mind");
    expect(params.get("date")).toBe("2024");
    expect(params.get("mind")).toBe("hello");
  });
});
