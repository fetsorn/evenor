import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Confirmation } from "./confirmation.jsx";

describe("Confirmation", () => {
  test("no", async () => {
    const action = "action";

    const question = "question?";

    const onAction = vi.fn();

    const onCancel = vi.fn();

    const { getByText } = render(() => (
      <Confirmation action={action} question={question} onAction={onAction} onCancel={onCancel} />
    ));

    // find remove
    const command = getByText(action);

    // click remove
    await userEvent.click(command);

    // find no
    const no = getByText(/No/);

    // click no
    await userEvent.click(no);

    // check that action did not work
    expect(onAction).not.toHaveBeenCalled();

    expect(onCancel).toHaveBeenCalled();

    // check that action shows again
    expect(() => getByText(action)).not.toThrowError();
  });

  test("yes", async () => {
    const action = "action";

    const question = "question?";

    const onAction = vi.fn();

    const { getByText } = render(() => (
      <Confirmation action={action} question={question} onAction={onAction} />
    ));

    // find remove
    const command = getByText(action);

    // click remove
    await userEvent.click(command);

    // find yes
    const yes = getByText(/Yes/);

    // click yes
    await userEvent.click(yes);

    // check that action worked
    expect(onAction).toHaveBeenCalledWith();
  });
});
