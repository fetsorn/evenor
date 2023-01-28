import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Paragraph } from "../../../../../../components";

interface IBodyFieldTextProps {
  schema: any;
  label: any;
  value: any;
}

export default function FieldText({ schema, label, value }: IBodyFieldTextProps) {
  const { i18n } = useTranslation();

  const propDescription = useMemo(() => {
    const prop = Object.keys(schema).find(
      (prop: any) => schema[prop]["label"] === label
    );

    const lang = i18n.resolvedLanguage;

    const description = schema?.[prop]?.description?.[lang] ?? label;

    return description;
  }, [schema, label]);

  return (
    <div>
      <div>{propDescription}</div>

      <Paragraph>{value}</Paragraph>
    </div>
  );
}
