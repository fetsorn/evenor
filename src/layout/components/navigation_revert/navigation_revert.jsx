import { onRecordEdit } from "@/store/index.js";

export function NavigationRevert() {
  return (
    <button
      className="navigationRevert"
      title={""}
      onClick={() => onRecordEdit(["record"], undefined)}
    >
      revert
    </button>
  );
}
