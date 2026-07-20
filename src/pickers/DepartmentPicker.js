import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { MODULE_NAME, PICKER_LIMIT } from '../constants';


function DepartmentPicker({
  multiple, required, readOnly, value, onChange, label, withLabel = false, filterSelectedOptions,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const [filters, setFilters] = useState({ first: PICKER_LIMIT, isActive: true });

  const { isLoading, data, error } = useGraphqlQuery(
    `query CoordinationDepartmentPicker($search: String, $first: Int, $isActive: Boolean) {
      coordinationDepartment(name_Icontains: $search, first: $first, isActive: $isActive) {
        edges { node { id code name } }
      }
    }`,
    filters,
  );

  const departments = data?.coordinationDepartment?.edges?.map((e) => e.node) ?? [];

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={departments}
      isLoading={isLoading}
      value={value}
      label={label || formatMessage('coordination.departmentPicker')}
      withLabel={withLabel}
      required={required}
      getOptionLabel={(o) => (o ? `${o.code} - ${o.name}` : '')}
      onChange={(v) => onChange(v, v ? `${v.code} - ${v.name}` : null)}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ first: PICKER_LIMIT, isActive: true, search })}
      renderInput={(inputProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...inputProps} required={required} label={label || formatMessage('coordination.departmentPicker')} />
      )}
    />
  );
}

export default DepartmentPicker;
