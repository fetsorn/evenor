import { onRecordEdit } from "@/store/index.js";

export function NavigationRevert() {
  return (
    <a
      className="navigationRevert"
      title={""}
      onClick={() => onRecordEdit(["record"], undefined)}
    >
      revert
    </a>
  );
}
