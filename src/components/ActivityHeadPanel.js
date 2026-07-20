import React from 'react';
import { injectIntl } from 'react-intl';
import { Divider, Grid, Typography } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  FormattedMessage, FormPanel, PublishedComponent, TextInput, withModulesManager,
} from '@openimis/fe-core';
import { ActivityStatusPicker } from '../pickers/ConstantPickers';
import DepartmentPicker from '../pickers/DepartmentPicker';
import ResponsiblePicker from '../pickers/ResponsiblePicker';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: { height: '100%' },
});

class ActivityHeadPanel extends FormPanel {
  render() {
    const {
      edited, classes, readOnly,
    } = this.props;
    const a = { ...edited };
    return (
      <>
        <Grid container className={classes.tableTitle}>
          <Grid item>
            <Typography>
              <FormattedMessage module="coordination" id="coordination.headPanel.title" />
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        <Grid container className={classes.item}>
          {a?.code && (
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module="coordination"
                label="coordination.code"
                readOnly
                value={a.code}
                onChange={(v) => this.updateAttribute('code', v)}
              />
            </Grid>
          )}
          <Grid item xs={a?.code ? 5 : 6} className={classes.item}>
            <TextInput
              module="coordination"
              label="coordination.title"
              required
              readOnly={readOnly}
              value={a?.title}
              onChange={(v) => this.updateAttribute('title', v)}
            />
          </Grid>
          <Grid item xs={a?.code ? 4 : 6} className={classes.item}>
            <DepartmentPicker
              withLabel
              required
              readOnly={readOnly}
              value={a?.department}
              onChange={(v) => this.updateAttributes({ department: v, departmentId: v?.id ?? null })}
            />
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <TextInput
              module="coordination"
              label="coordination.description"
              readOnly={readOnly}
              value={a?.description}
              onChange={(v) => this.updateAttribute('description', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="coordination"
              label="coordination.startDatetime"
              required
              readOnly={readOnly}
              value={a?.startDatetime}
              onChange={(v) => this.updateAttribute('startDatetime', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="coordination"
              label="coordination.endDatetime"
              required
              readOnly={readOnly}
              value={a?.endDatetime}
              onChange={(v) => this.updateAttribute('endDatetime', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="coordination"
              label="coordination.venue"
              readOnly={readOnly}
              value={a?.venue}
              onChange={(v) => this.updateAttribute('venue', v)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <ActivityStatusPicker
              required
              readOnly
              withNull={false}
              label="coordination.status"
              value={a?.status}
              onChange={(v) => this.updateAttribute('status', v)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="location.LocationPicker"
              readOnly={readOnly}
              value={a?.location}
              onChange={(v) => this.updateAttributes({ location: v, locationId: v?.id ?? null })}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <ResponsiblePicker
              withLabel
              readOnly={readOnly}
              value={a?.responsible}
              onChange={(v) => this.updateAttributes({ responsible: v, responsibleId: v?.id ?? null })}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(ActivityHeadPanel))));
