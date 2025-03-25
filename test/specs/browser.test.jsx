import { $, expect } from "@wdio/globals";
import { render } from "solid-js/web";
import {
  make,
  save,
  edit,
  wipe,
  open,
  close,
  clone,
  pull,
  push,
} from "./actions.js";

import App from "../../src/layout/layout.jsx";

// calculates the luma from a hex color `#abcdef`
function luma(hex) {
  if (hex.startsWith("#")) {
    hex = hex.substring(1);
  }

  const rgb = parseInt(hex, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe("my component tests", () => {
  it("should do something cool", async () => {
    render(() => <App />, document.body);
    await expect($("h1")).toHaveText("Hello world!");
  });
});

describe("Hello Tauri", () => {
  it("should be cordial", async () => {
    render(() => <App />, document.body);
    const header = await $("h1");
    const text = await header.getText();
    expect(text).toMatch(/^[hH]ello/);
  });

  it("should be excited", async () => {
    render(() => <App />, document.body);
    const header = await $("h1");
    const text = await header.getText();
    expect(text).toMatch(/!$/);
  });

  it("should be easy on the eyes", async () => {
    render(() => <App />, document.body);
    const body = await $("body");
    const backgroundColor = await body.getCSSProperty("background-color");
    expect(luma(backgroundColor.parsed.hex)).toBeLessThan(100);
  });
});

describe("integration", () => {
  it("should create a repo", async () => {
    render(() => <App />, document.body);
    // check that no records in the overview
    make();
    save();
    // check that one record in the overview
  });

  it("should edit a repo", async () => {
    render(() => <App />, document.body);
    // check name of record in the overview
    edit();
    save();
    // check name of record in the overview
  });

  it("should delete a repo", async () => {
    render(() => <App />, document.body);
    // check that one record in the overview
    // check name of record in the overview
    wipe();
    // check that no records in the overview
  });

  it("should open a repo", async () => {
    render(() => <App />, document.body);
    // check that one record in the overview
    open();
    // check that url changed
  });

  it("should close a repo", async () => {
    render(() => <App />, document.body);
    // check that repo is opened
    close();
    // check that url changed
  });

  it("should create an event", async () => {
    render(() => <App />, document.body);
    // check that one record in the overview
    open();
    // check that no records in the overview
    make();
    save();
    // check that one record in the overview
  });

  it("should clone a repo", async () => {
    render(() => <App />, document.body);
    // check that no records in the overview
    make();
    clone();
    // check that one record in the overview
  });

  it("should pull a repo", async () => {
    render(() => <App />, document.body);
    open();
    // check that one record in the overview
    close();
    pull();
    open();
    // check that record changed in the overview
  });

  it("should push a repo", async () => {
    render(() => <App />, document.body);
    open();
    edit();
    close();
    push();
    // check that remote repo changed
  });
});
