import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Helmet, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import ModuleCalendar from '../components/ModuleCalendar';
import {
  MODULE_NAME, SOURCE_COLORS, UNIFIED_SOURCES, COORDINATION_ROUTE_ACTIVITY,
} from '../constants';
import { fetchUnifiedCalendar } from '../actions';
import { toISO } from '../utils/dates';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function UnifiedCalendarPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rawEvents = useSelector((s) => s.coordination.unifiedCalendar);
  const fetching = useSelector((s) => s.coordination.fetchingUnifiedCalendar);
  const error = useSelector((s) => s.coordination.errorUnifiedCalendar);

  const events = useMemo(
    () => (rawEvents || []).map((e) => ({ ...e, origStatus: e.status, status: e.source })),
    [rawEvents],
  );

  const openEvent = (e) => {
    if (e.source === 'COORDINATION') {
      history.push(`/${modulesManager.getRef(COORDINATION_ROUTE_ACTIVITY)}/${e.id}`);
      return;
    }
 
    const refKey = e.source === 'TRAINING' ? 'training.route.training' : 'communications.route.activity';
    try {
      const ref = modulesManager.getRef(refKey);
      if (ref) history.push(`/${ref}/${e.id}`);
    } catch (err) { /* module not loaded — no-op */ }
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('coordination.unified.page.title')} />
      <ModuleCalendar
        moduleName={MODULE_NAME}
        events={events}
        fetching={fetching}
        error={error}
        onFetchRange={(from, to) => dispatch(fetchUnifiedCalendar({ dateFrom: toISO(from), dateTo: toISO(to, true) }))}
        statusColors={SOURCE_COLORS}
        statusList={UNIFIED_SOURCES}
        onOpenEvent={openEvent}
        onCreate={null}
        title={formatMessage('coordination.unified.page.title')}
        subtitle={formatMessage('coordination.unified.subtitle')}
      />
    </div>
  );
}

export default UnifiedCalendarPage;
