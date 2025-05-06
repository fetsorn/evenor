export async function click(element) {
  // element.click() doesn't work on tauri
  // https://github.com/tauri-apps/tauri/issues/6541
  await browser.execute("arguments[0].click();", element);
}

export async function setValue(field, value) {
  // element.setValue(value) doesn't work on tauri
  // https://github.com/tauri-apps/tauri/issues/6541
  await browser.execute(`arguments[0].value="${value}"`, field);
  await browser.execute(
    'arguments[0].dispatchEvent(new Event("input", { bubbles: true }))',
    field,
  );
}

export async function make() {
  // check that no records in the overview
  await click(await $("aria/new"));
}

export async function save() {
  // save profile
  await click(await $("aria/save"));

  // wait for record to save
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function revert() {
  await click(await $("aria/revert"));
}

export async function edit() {
  await click(await $("aria/edit"));
}

export async function newRepo() {
  await make();

  // input reponame in profile
  await setValue(await $("aria/reponame -"), "foobar");

  await save();
}

export async function wipe() {
  await click(await $("aria/delete"));

  await click(await $("aria/Yes"));
}

export async function open() {
  // find button "open event"
  await click(await $("aria/open"));

  await new Promise((resolve) => setTimeout(resolve, 500));

  // click button "open event"
  await click(await $("aria/open").nextElement());
}

export async function close() {
  // click button "back"
  await click(await $("aria/back"));
}

export async function clone() {
  await make();

  // input reponame in profile
  await setValue(await $("aria/reponame -"), "foobar");

  // add
  await click(await $("aria/repo -").nextElement().nextElement());

  // click button "add remote"
  await click(await $("aria/remote_tag"));

  await setValue(await $("aria/remote_tag -"), "origin");

  // with
  await click(
    await $("aria/remote_tag -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  // add
  await click(
    await $("aria/remote_tag -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  await click(await $("aria/remote_url"));

  // git-http-mock-server
  await setValue(
    await $("aria/remote_url -"),
    "http://localhost:8174/test-repo1.git",
  );

  await click(await $("aria/clone..."));

  await click(await $("aria/Yes"));

  // wait for clone
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await save();
}

export async function updateFixture() {}

export async function pull() {
  // edit
  await edit();

  // with
  await click(
    await $("aria/remote_tag -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  await setValue(
    await $("aria/remote_url -"),
    "http://localhost:8174/test-repo2.git",
  );

  await click(await $("aria/pull"));

  await new Promise((resolve) => setTimeout(resolve, 5000));

  await save();
}

export async function push() {
  // edit
  await edit();

  // with
  await click(
    await $("aria/remote_tag -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  await setValue(
    await $("aria/remote_url -"),
    "http://localhost:8174/test-repo1.git",
  );

  await click(await $("aria/push"));

  await new Promise((resolve) => setTimeout(resolve, 5000));

  await save();
}
