import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Paper, Grid, Divider, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Tooltip, Button, Checkbox,
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import {
  Helmet, TextInput, ProgressOrError, journalize, coreConfirm, clearConfirm,
  useTranslations, useModulesManager,
} from '@openimis/fe-core';
import { MODULE_NAME, RIGHT_DEPARTMENT_MANAGE } from '../constants';
import { fetchDepartments, saveDepartment, deleteDepartment } from '../actions';

const styles = (theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  paperHeader: theme.paper.title,
  tableTitle: theme.table.title,
  tableHeader: theme.table.header,
  item: theme.paper.item,
  hint: { padding: 10, color: theme.palette.text.secondary, fontSize: 13 },
});

const EMPTY = { code: '', name: '', description: '', isActive: true };

function SettingsPage({ classes }) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const rights = useSelector((s) => s.core.user?.i_user?.rights ?? []);
  const departments = useSelector((s) => s.coordination.departments);
  const fetching = useSelector((s) => s.coordination.fetchingDepartments);
  const submittingMutation = useSelector((s) => s.coordination.submittingMutation);
  const mutation = useSelector((s) => s.coordination.mutation);
  const confirmed = useSelector((s) => s.core.confirmed);

  const [edited, setEdited] = useState({ ...EMPTY });
  const [toDelete, setToDelete] = useState(null);
  const prevMutation = useRef();

  const canManage = rights.includes(RIGHT_DEPARTMENT_MANAGE);

  useEffect(() => { dispatch(fetchDepartments(modulesManager)); }, []);

  useEffect(() => {
    if (prevMutation.current && !submittingMutation) {
      dispatch(journalize(mutation));
      dispatch(fetchDepartments(modulesManager));
    }
  }, [submittingMutation]);
  useEffect(() => { prevMutation.current = submittingMutation; });

  useEffect(() => {
    if (toDelete) {
      dispatch(coreConfirm(
        formatMessage('coordination.settings.departments.deleteTitle'),
        formatMessageWithValues('coordination.settings.departments.deleteMessage', { code: toDelete.code }),
      ));
    }
  }, [toDelete]);
  useEffect(() => {
    if (toDelete && confirmed) {
      dispatch(deleteDepartment(toDelete, formatMessageWithValues('coordination.department.delete.mutationLabel', { code: toDelete.code })));
      setToDelete(null);
    }
    if (confirmed !== null) setToDelete(null);
    return () => { if (confirmed !== null) dispatch(clearConfirm(false)); };
  }, [confirmed]);

  const startEdit = (d) => setEdited({
    id: d.id, code: d.code, name: d.name, description: d.description ?? '', isActive: d.isActive,
  });
  const cancelEdit = () => setEdited({ ...EMPTY });
  const set = (k, v) => setEdited((e) => ({ ...e, [k]: v }));

  const save = () => {
    dispatch(saveDepartment(edited, formatMessageWithValues('coordination.department.mutationLabel', { code: edited.code })));
    setEdited({ ...EMPTY });
  };

  const canSave = !!edited.code && !!edited.name;

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('coordination.settings.page.title')} />

      {/* Departments / Units */}
      <Paper className={classes.paper}>
        <Grid container className={classes.paperHeader} alignItems="center">
          <Grid item xs={12}>
            <Typography>{formatMessage('coordination.settings.departments.title')}</Typography>
          </Grid>
        </Grid>
        <Divider />
        <ProgressOrError progress={fetching} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeader}>{formatMessage('coordination.code')}</TableCell>
              <TableCell className={classes.tableHeader}>{formatMessage('coordination.department.name')}</TableCell>
              <TableCell className={classes.tableHeader}>{formatMessage('coordination.description')}</TableCell>
              <TableCell className={classes.tableHeader} align="center">{formatMessage('coordination.department.active')}</TableCell>
              <TableCell className={classes.tableHeader} align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {(departments || []).map((d) => (
              <TableRow key={d.id} selected={edited.id === d.id}>
                <TableCell>{d.code}</TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.description}</TableCell>
                <TableCell align="center">{d.isActive ? '✓' : '—'}</TableCell>
                <TableCell align="right">
                  {canManage && (
                    <>
                      <Tooltip title={formatMessage('coordination.edit')}>
                        <IconButton size="small" onClick={() => startEdit(d)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title={formatMessage('coordination.deleteButton.tooltip')}>
                        <IconButton size="small" onClick={() => setToDelete(d)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {canManage && (
              <TableRow>
                <TableCell>
                  <TextInput
                    module="coordination"
                    label="coordination.code"
                    value={edited.code}
                    onChange={(v) => set('code', v)}
                  />
                </TableCell>
                <TableCell>
                  <TextInput
                    module="coordination"
                    label="coordination.department.name"
                    value={edited.name}
                    onChange={(v) => set('name', v)}
                  />
                </TableCell>
                <TableCell>
                  <TextInput
                    module="coordination"
                    label="coordination.description"
                    value={edited.description}
                    onChange={(v) => set('description', v)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    color="primary"
                    checked={!!edited.isActive}
                    onChange={(e) => set('isActive', e.target.checked)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={formatMessage(edited.id ? 'coordination.save' : 'coordination.settings.departments.add')}>
                    <span>
                      <IconButton size="small" color="primary" disabled={!canSave} onClick={save}><SaveIcon /></IconButton>
                    </span>
                  </Tooltip>
                  {edited.id && (
                    <Tooltip title={formatMessage('coordination.cancel')}>
                      <IconButton size="small" onClick={cancelEdit}><CloseIcon /></IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Role-based visibility */}
      <Paper className={classes.paper}>
        <Grid container className={classes.paperHeader} alignItems="center">
          <Grid item xs={12}>
            <Typography>{formatMessage('coordination.settings.visibility.title')}</Typography>
          </Grid>
        </Grid>
        <Divider />
        <Typography className={classes.hint}>
          {formatMessage('coordination.settings.visibility.hint')}
        </Typography>
      </Paper>
    </div>
  );
}

export default withTheme(withStyles(styles)(SettingsPage));
