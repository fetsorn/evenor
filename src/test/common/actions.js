export async function click(element) {
  await element.waitForExist({ timeout: 5000 });

  if (window.__TAURI__) {
    // element.click() doesn't work on tauri
    // https://github.com/tauri-apps/tauri/issues/6541
    await browser.execute("arguments[0].click();", element);
  } else {
    // polyfill doesn't work in browser
    await element.click();
  }
}

export async function setValue(field, value) {
  await field.waitForExist({ timeout: 5000 });

  if (window.__TAURI__) {
    // element.setValue(value) doesn't work on tauri
    // https://github.com/tauri-apps/tauri/issues/6541
    await browser.execute(`arguments[0].value="${value}"`, field);
    await browser.execute(
      'arguments[0].dispatchEvent(new Event("input", { bubbles: true }))',
      field,
    );
  } else {
    // polyfill doesn't work in browser
    await field.setValue(value);
  }
}
