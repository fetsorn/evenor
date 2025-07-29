export async function click(element) {
  // polyfill doesn't work in browser
  //await element.click();
  // element.click() doesn't work on tauri
  // https://github.com/tauri-apps/tauri/issues/6541
  await browser.execute("arguments[0].click();", element);
}

export async function setValue(field, value) {
  // polyfill doesn't work in browser
  //await field.setValue(value);
  // element.setValue(value) doesn't work on tauri
  // https://github.com/tauri-apps/tauri/issues/6541
  await browser.execute(`arguments[0].value="${value}"`, field);
  await browser.execute(
    'arguments[0].dispatchEvent(new Event("input", { bubbles: true }))',
    field,
  );
}

export async function make() {
  await (await $("aria/new")).waitForExist({ timeout: 5000 });

  // check that no records in the overview
  await click(await $("aria/new"));

  await (await $("aria/save")).waitForExist({ timeout: 5000 });
}

export async function save() {
  // save profile
  await click(await $("aria/save"));

  // wait for record to save
  await (await $("aria/save")).waitForExist({ reverse: true, timeout: 5000 });
}

export async function revert() {
  await click(await $("aria/revert"));
}

export async function edit() {
  await click(await $("aria/edit"));
}

export async function newMind() {
  await make();

  // input name in profile
  await setValue(await $("aria/name -"), "foobar");

  await save();
}

export async function wipe() {
  await (await $("aria/delete")).waitForExist({ timeout: 5000 });

  await click(await $("aria/delete"));

  await (await $("aria/Yes")).waitForExist({ timeout: 5000 });

  await click(await $("aria/Yes"));

  await (await $("aria/delete")).waitForExist({ reverse: true, timeout: 5000 });
}

export async function open() {
  await (await $("aria/open")).waitForExist({ timeout: 5000 });

  // find button "open event"
  await click(await $("aria/open"));

  await (await $("aria/open").nextElement()).waitForExist({ timeout: 5000 });

  // click button "open event"
  await click(await $("aria/open").nextElement());

  await (await $("aria/back")).waitForExist({ timeout: 5000 });
}

export async function close() {
  // click button "back"
  await click(await $("aria/back"));
}

export async function clone() {
  await make();

  // input name in profile
  await setValue(await $("aria/name -"), "foobar");

  // add
  await click(await $("aria/mind -").nextElement().nextElement());

  // click button "add remote"
  await click(await $("aria/origin_url"));

  await setValue(await $("aria/origin_url -"), "origin");

  // with
  await click(
    await $("aria/origin_url -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  // add
  await click(
    await $("aria/origin_url -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  await click(await $("aria/origin_url"));

  // git-http-mock-server
  await setValue(
    await $("aria/origin_url -"),
    "http://localhost:8174/test-mind1.git",
  );

  await click(await $("aria/clone..."));

  await click(await $("aria/Yes"));

  await (await $("aria/Yes")).waitForExist({ reverse: true, timeout: 5000 });

  await save();
}

export async function updateFixture() {}

export async function pull() {
  // edit
  await edit();

  // with
  await click(
    await $("aria/origin_url -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  await setValue(
    await $("aria/origin_url -"),
    "http://localhost:8174/test-mind2.git",
  );

  await click(await $("aria/pull"));

  await (
    await $("aria/Loading")
  ).waitUntil(() => {}, { reverse: true, timeout: 5000 });

  await save();
}

export async function push() {
  // edit
  await edit();

  // with
  await click(
    await $("aria/origin_url -")
      .nextElement()
      .nextElement()
      .nextElement()
      .nextElement(),
  );

  await setValue(await $("aria/url -"), "http://localhost:8174/test-mind1.git");

  await click(await $("aria/push"));

  await save();
}
