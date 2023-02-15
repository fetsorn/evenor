import { Paragraph } from "@/components";

interface IBodyFieldTextProps {
  value: any;
}

export default function FieldText({ value }: IBodyFieldTextProps) {
  return (
    <div>
      <Paragraph>{value}</Paragraph>
    </div>
  );
}
