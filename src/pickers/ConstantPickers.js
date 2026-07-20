import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { ACTIVITY_STATUS_LIST } from '../constants';

function makePicker(pickerLabel, constants) {
  function Picker({
    required, withNull, readOnly, onChange, value, nullLabel, withLabel, label,
  }) {
    return (
      <ConstantBasedPicker
        module="coordination"
        label={label || pickerLabel}
        constants={constants}
        required={required}
        withNull={withNull}
        readOnly={readOnly}
        onChange={onChange}
        value={value}
        nullLabel={nullLabel}
        withLabel={withLabel}
      />
    );
  }
  return Picker;
}

export const ActivityStatusPicker = makePicker('coordination.status', ACTIVITY_STATUS_LIST);
