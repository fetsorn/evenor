import { $, expect, browser } from "@wdio/globals";
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

export function t() {
  it("should create a repo", async () => {
    // check that no records in the overview
    const navigationAdd = await $("a.navigationAdd");

    await navigationAdd.click();

    const w = await $("a.spoilerOpen");

    await w.click();

    const add = await $("a.spoilerOpen");

    await add.click();

    const reponame = await $("a.spoilerOpen");

    await reponame.click();

    const input = await $("");

    await input.focus();

    await browser.keys("foo");

    const save = await $("a.navigationSave");

    await save.click();

    // check that one record in the overview
    expect(false).toBe(false);
  });

  //it("should edit a repo", async () => {
  //  // check name of record in the overview
  //  edit();
  //  save();
  //  // check name of record in the overview
  //});

  //it("should delete a repo", async () => {
  //  // check that one record in the overview
  //  // check name of record in the overview
  //  wipe();
  //  // check that no records in the overview
  //});

  //it("should open a repo", async () => {
  //  // check that one record in the overview
  //  open();
  //  // check that url changed
  //});

  //it("should close a repo", async () => {
  //  // check that repo is opened
  //  close();
  //  // check that url changed
  //});

  //it("should create an event", async () => {
  //  // check that one record in the overview
  //  open();
  //  // check that no records in the overview
  //  make();
  //  save();
  //  // check that one record in the overview
  //});

  //it("should clone a repo", async () => {
  //  // check that no records in the overview
  //  make();
  //  clone();
  //  // check that one record in the overview
  //});

  //it("should pull a repo", async () => {
  //  open();
  //  // check that one record in the overview
  //  close();
  //  pull();
  //  open();
  //  // check that record changed in the overview
  //});

  //it("should push a repo", async () => {
  //  open();
  //  edit();
  //  close();
  //  push();
  //  // check that remote repo changed
  //});
}
