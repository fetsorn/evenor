import React from 'react';
import { Paragraph } from '../../../../../../../components/components/index.js';

export function FieldText({ value }) {
  return (
    <div>
      <Paragraph>{value}</Paragraph>
    </div>
  );
}
