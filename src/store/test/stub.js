export const schema = {
  a: { trunks: [], leaves: ["b"] },
  b: { trunks: ["a"], leaves: ["d"] },
  d: { trunks: ["b"], leaves: [] },
};

export const root = "a";

export const trunk = "b";

export const twig = "d";

export const nonExisting = "c";

export const uuid = "uuid";

export const reponame = "reponame";

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
      { _: "branch", branch: "branch1", trunks: [], leaves: ["branch2"] },
      {
        _: "branch",
        branch: "branch2",
        trunks: ["branch1"],
        leaves: [],
        task: "date",
      },
    ],
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
      { _: "branch", branch: "branch1", trunks: [], leaves: ["branch2"] },
      {
        _: "branch",
        branch: "branch2",
        trunks: ["branch1"],
        leaves: [],
        task: "date",
      },
    ],
    remote: "remote",
    url: "https://example.com/reponame",
    token: "token",
    remoteTag: {
      _: "remote_tag",
      remote_tag: "remote",
      remote_url: "https://example.com/reponame",
      remote_token: "token",
    },
    assetPath: "assetpath",
    localTag: {
      _: "local_tag",
      local_tag: "assetpath",
    },
    record: {
      _: "repo",
      repo: "uuid",
      reponame: "reponame",
      branch: [
        { _: "branch", branch: "branch1", trunks: [], leaves: ["branch2"] },
        {
          _: "branch",
          branch: "branch2",
          trunks: ["branch1"],
          leaves: [],
          task: "date",
        },
      ],
      remote_tag: [
        {
          _: "remote_tag",
          remote_tag: "remote",
          remote_url: "https://example.com/reponame",
          remote_token: "token",
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
  uuid,
  reponame,
  cases,
};
