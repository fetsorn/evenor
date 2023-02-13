import { Paragraph } from "@/components";

interface IBodyFieldTextProps {
  label: any;
  value: any;
}

export default function FieldText({ label, value }: IBodyFieldTextProps) {
  return (
    <div>
      <div>{label}</div>

      <Paragraph>{value}</Paragraph>
    </div>
  );
}
