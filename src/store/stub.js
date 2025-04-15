export const schema = {
  a: { trunks: [], leaves: ["b"] },
  b: { trunks: ["a"], leaves: ["d"] },
  d: { trunks: ["b"], leaves: [] },
};

export const root = "a";

export const trunk = "b";

export const twig = "d";

export const nonExisting = "c";

export const cases = {
  noBase: {
    queryObject: { a: "1" },
    queryString: "a=1",
  },
  baseValue: {
    queryObject: { _: "a", a: "1" },
    queryString: "_=a&a=1",
  },
  leafValue: {
    queryObject: { _: "a", b: "2" },
    queryString: "_=a&b=2",
  },
  nestedValue: {
    queryObject: { _: "a", b: { _: "b", b: "2", d: "3" } },
    queryString: "_=a&b=2&d=3",
  },
  twigOutOfOrder: {
    queryObject: { _: "a", b: { _: "b", b: "2", d: "3" } },
    queryString: "_=a&d=3&b=2",
  },
  emptyQuery: {
    queryObject: { _: "a", a: "" },
    queryString: "_=a&a=",
  },
};

export default {
  schema,
  root,
  trunk,
  twig,
  nonExisting,
  cases,
};
