import React from "react";
import { useTranslation } from "react-i18next";

export default function GraphRangeInput({
  depth,
  onSetDepth,
}) {
  const { t } = useTranslation();

  return (
    <>
      <div>
        {t("tree.label.depth")}: {depth}
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={depth}
        title={t("tree.field.depth")}
        onChange={async (e) => {
          await onSetDepth(e.target.value);
        }}
      />
    </>
  );
}
