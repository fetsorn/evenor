import { describe, expect, test } from "vitest";
import { makeURL } from "@/pure.js";

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
