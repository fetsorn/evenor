import { $ } from "@wdio/globals";

export async function make() {
  // check that no records in the overview
  await $("aria/new").click();
}

export async function save() {
  // save profile
  await $("aria/save").click();

  // wait for record to save
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function revert() {
  await $("aria/revert").click();
}

export async function edit() {
  await $("aria/edit").click();
}

export async function newRepo() {
  await make();

  // input reponame in profile
  await $("aria/reponame -").setValue("foobar");

  await save();
}

export async function wipe() {
  await $("aria/delete").click();

  await $("aria/Yes").click();
}

export async function open() {
  // find button "open event"
  await $("aria/open").click();

  // click button "open event"
  await $("aria/event").click();
}

export async function close() {
  // click button "back"
  await $("aria/back").click();
}

export async function clone() {
  // input reponame in profile
  await $("aria/reponame -").setValue("foobar");

  // add
  await $("aria/repo -").nextElement().nextElement().click();

  //// click button "add remote"
  await $("aria/remote_tag").click();

  await $("aria/remote_tag -").setValue("origin");

  // with
  await $("aria/remote_tag -")
    .nextElement()
    .nextElement()
    .nextElement()
    .nextElement()
    .click();

  // add
  await $("aria/remote_tag -")
    .nextElement()
    .nextElement()
    .nextElement()
    .nextElement()
    .nextElement()
    .click();

  await $("aria/remote_url").click();

  // git-http-mock-server
  await $("aria/remote_url -").setValue("http://localhost:8174/test-repo1.git");

  await $("aria/clone...").click();

  await $("aria/Yes").click();

  // wait for clone
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

export async function updateFixture() {}

export async function pull() {
  await edit();

  await $("aria/pull").click();

  await save();
  // find button "pull"
  // click button "pull"
}

export async function push() {
  // click push
  await edit();

  await $("aria/push").click();

  await save();
}
