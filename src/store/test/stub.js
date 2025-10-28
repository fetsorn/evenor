export const schema = {
  a: { trunks: [], leaves: ["b"] },
  b: { trunks: ["a"], leaves: ["d"] },
  d: { trunks: ["b"], leaves: [] },
};

export const root = "a";

export const trunk = "b";

export const twig = "d";

export const nonExisting = "c";

export const id = "id";

export const mind = "mind";

export const name = "name";

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
  trunk: {
    schemaRecord: { _: "_", branch1: ["branch2"] },
    metaRecords: [
      { _: "branch", branch: "branch2", task: "date" },
      { _: "branch", branch: "branch1" },
    ],
    branchRecords: [
      { _: "branch", branch: "branch1", trunk: [], leaf: ["branch2"] },
      {
        _: "branch",
        branch: "branch2",
        trunk: ["branch1"],
        leaf: [],
        task: "date",
      },
    ],
    schema: {
      branch1: {
        leaves: ["branch2"],
        trunks: [],
      },
      branch2: {
        leaves: [],
        task: "date",
        trunks: ["branch1"],
      },
    },
  },
  description: {
    schema: {
      event: { trunks: [], leaves: ["datum"], description: { en: "", ru: "" } },
      datum: { trunks: ["event"], leaves: [] },
    },
    schemaRecord: { _: "_", event: ["datum"] },
    metaRecords: [
      { _: "branch", branch: "event", description_en: "", description_ru: "" },
      { _: "branch", branch: "datum" },
    ],
  },
  tags: {
    schema: {
      branch1: { trunks: [], leaves: ["branch2"] },
      branch2: { trunks: ["branch1"], leaves: [], task: "date" },
    },
    schemaRecord: { _: "_", branch1: ["branch2"] },
    metaRecords: [
      { _: "branch", branch: "branch2", task: "date" },
      { _: "branch", branch: "branch1" },
    ],
    branchRecords: [
      { _: "branch", branch: "branch1", trunk: [], leaf: ["branch2"] },
      {
        _: "branch",
        branch: "branch2",
        trunk: ["branch1"],
        leaf: [],
        task: "date",
      },
    ],
    remote: "remote",
    url: "https://example.com/name",
    hash: "6d5f2f8d8c58a6d3857d6c90ac753f9d2449831186240c5270cfd95f9c5ba33d",
    token: "token",
    originUrl: {
      _: "origin_url",
      origin_url: "https://example.com/name",
      origin_token: "token",
    },
    assetPath: "assetpath",
    localTag: {
      _: "local_tag",
      local_tag: "assetpath",
    },
    record: {
      _: "mind",
      mind: "id",
      name: "name",
      branch: [
        { _: "branch", branch: "branch1", trunk: [], leaf: ["branch2"] },
        {
          _: "branch",
          branch: "branch2",
          trunk: ["branch1"],
          leaf: [],
          task: "date",
        },
      ],
      origin_url: [
        {
          _: "origin_url",
          origin_url: "https://example.com/name",
          origin_token: "token",
        },
      ],
      local_tag: [
        {
          _: "local_tag",
          local_tag: "assetpath",
        },
      ],
    },
  },
};

export default {
  schema,
  root,
  trunk,
  twig,
  nonExisting,
  id,
  mind,
  name,
  cases,
};
