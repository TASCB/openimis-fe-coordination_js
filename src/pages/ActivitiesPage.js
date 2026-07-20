import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {
  Helmet, useTranslations, useModulesManager, useHistory, withTooltip,
} from '@openimis/fe-core';
import ActivitySearcher from '../components/ActivitySearcher';
import {
  MODULE_NAME, RIGHT_ACTIVITY_SEARCH, RIGHT_ACTIVITY_CREATE, COORDINATION_ROUTE_ACTIVITY,
} from '../constants';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function ActivitiesPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const onCreate = () => history.push(`/${modulesManager.getRef(COORDINATION_ROUTE_ACTIVITY)}`);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('coordination.activities.page.title')} />
      {rights.includes(RIGHT_ACTIVITY_SEARCH) && <ActivitySearcher />}
      {rights.includes(RIGHT_ACTIVITY_CREATE) && withTooltip(
        <div className={classes.fab}><Fab color="primary" onClick={onCreate}><AddIcon /></Fab></div>,
        formatMessage('createButton.tooltip'),
      )}
    </div>
  );
}

export default ActivitiesPage;
