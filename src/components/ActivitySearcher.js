import React, { useRef, useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import {
  IconButton, Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';

import { useIntl } from 'react-intl';
import {
  Searcher, useHistory, useModulesManager, useTranslations, journalize, coreConfirm, clearConfirm,
  formatDateFromISO,
} from '@openimis/fe-core';
import { fetchActivities, deleteActivity } from '../actions';
import {
  MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, RIGHT_ACTIVITY_SEARCH, RIGHT_ACTIVITY_DELETE,
  COORDINATION_ROUTE_ACTIVITY, ACTIVITY_STATUS,
} from '../constants';
import ActivityFilter from './ActivityFilter';
import StatusChip from './StatusChip';

const useStyles = makeStyles(() => ({
  searcher: {
    '& table': { tableLayout: 'fixed' },
    '& table th': { whiteSpace: 'nowrap' },
    '& table th:nth-child(9), & table td:nth-child(9)': { width: 56 },
    '& table th:nth-child(10), & table td:nth-child(10)': { width: 56 },
    '& table th:last-child, & table td:last-child': { width: 32 },
  },
}));

function ActivitySearcher({
  fetchActivities, deleteActivity, journalize, coreConfirm, clearConfirm, confirmed,
  fetchingActivities, fetchedActivities, errorActivities, activities,
  activitiesPageInfo, activitiesTotalCount, submittingMutation, mutation,
}) {
  const history = useHistory();
  const intl = useIntl();
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const [toDelete, setToDelete] = useState(null);
  const [queryParams, setQueryParams] = useState([]);
  const prevSubmittingRef = useRef();

  const openActivity = (a) => rights.includes(RIGHT_ACTIVITY_SEARCH) && history.push(
    `/${modulesManager.getRef(COORDINATION_ROUTE_ACTIVITY)}/${a?.id}`,
  );

  useEffect(() => {
    if (toDelete) {
      coreConfirm(
        formatMessage('coordination.deleteDialog.title'),
        formatMessageWithValues('coordination.deleteDialog.message', { code: toDelete.code }),
      );
    }
  }, [toDelete]);

  useEffect(() => {
    if (toDelete && confirmed) {
      deleteActivity(toDelete, formatMessageWithValues('coordination.delete.mutationLabel', { code: toDelete.code }));
      setToDelete(null);
    }
    if (confirmed !== null) setToDelete(null);
    return () => confirmed !== null && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation) {
      journalize(mutation);
      fetchActivities(modulesManager, queryParams);
    }
  }, [submittingMutation]);
  useEffect(() => { prevSubmittingRef.current = submittingMutation; });

  const headers = () => {
    const h = [
      'coordination.code', 'coordination.title', 'coordination.department', 'coordination.status',
      'coordination.startDatetime', 'coordination.endDatetime', 'coordination.location',
      'coordination.responsible',
    ];
    h.push('emptyLabel');
    if (rights.includes(RIGHT_ACTIVITY_DELETE)) h.push('emptyLabel'); 
    h.push('emptyLabel'); 
    return h;
  };
  const sorts = () => {
    const s = [
      ['code', true], ['title', true], null, ['status', true],
      ['startDatetime', true], ['endDatetime', true], null, null,
    ];
    s.push(null); 
    if (rights.includes(RIGHT_ACTIVITY_DELETE)) s.push(null); 
    s.push(null); 
    return s;
  };

  const fetch = (params) => { setQueryParams(params); return fetchActivities(modulesManager, params); };

  const itemFormatters = () => {
    const f = [
      (a) => a?.code,
      (a) => a?.title,
      (a) => a?.department?.name ?? '',
      (a) => <StatusChip status={a?.status} />,
      (a) => (a?.startDatetime ? formatDateFromISO(modulesManager, intl, a.startDatetime) : ''),
      (a) => (a?.endDatetime ? formatDateFromISO(modulesManager, intl, a.endDatetime) : ''),
      (a) => a?.location?.name ?? '',
      (a) => a?.responsible?.username ?? '',
    ];
    f.push((a) => (
      <Tooltip title={formatMessage('coordination.viewDetailsButton.tooltip')}>
        <IconButton onClick={() => openActivity(a)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ));
    if (rights.includes(RIGHT_ACTIVITY_DELETE)) {
      f.push((a) => (![ACTIVITY_STATUS.APPROVED, ACTIVITY_STATUS.CANCELLED].includes(a?.status) ? (
        <Tooltip title={formatMessage('coordination.deleteButton.tooltip')}>
          <IconButton onClick={() => setToDelete(a)}><DeleteIcon /></IconButton>
        </Tooltip>
      ) : null));
    }
    f.push(() => ''); 
    return f;
  };

  const filterPane = ({ filters, onChangeFilters }) => (
    <ActivityFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <div className={classes.searcher}>
      <Searcher
        module="coordination"
        FilterPane={filterPane}
        fetch={fetch}
        items={activities}
        itemsPageInfo={activitiesPageInfo}
        fetchedItems={fetchedActivities}
        fetchingItems={fetchingActivities}
        errorItems={errorActivities}
        tableTitle={formatMessageWithValues('coordination.searcherResultsTitle', { activitiesTotalCount })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        rowIdentifier={(a) => a.id}
        onDoubleClick={openActivity}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  fetchingActivities: state.coordination.fetchingActivities,
  fetchedActivities: state.coordination.fetchedActivities,
  errorActivities: state.coordination.errorActivities,
  activities: state.coordination.activities,
  activitiesPageInfo: state.coordination.activitiesPageInfo,
  activitiesTotalCount: state.coordination.activitiesTotalCount,
  submittingMutation: state.coordination.submittingMutation,
  mutation: state.coordination.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchActivities, deleteActivity, journalize, coreConfirm, clearConfirm,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySearcher);
