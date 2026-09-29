import React, { useEffect, useState, useRef } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';
import {
  Helmet, Form, useTranslations, useModulesManager, useHistory, journalize,
} from '@openimis/fe-core';
import {
  MODULE_NAME, EMPTY_STRING, ACTIVITY_STATUS, STATUS_ACTIONS,
  RIGHT_ACTIVITY_UPDATE, RIGHT_ACTIVITY_CREATE, COORDINATION_ROUTE_ACTIVITY,
} from '../constants';
import {
  fetchActivity, clearActivity, createActivity, updateActivity, transitionActivity, decId,
} from '../actions';
import ActivityHeadPanel from '../components/ActivityHeadPanel';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

// Stepping back or stopping (reject, cancel, revise) is a plain text action; only the
// step forward is filled, matching the approval pages.
const SECONDARY_ACTIONS = ['reject', 'cancel', 'revise'];

function initialFromQuery(search) {
  const base = { status: ACTIVITY_STATUS.DRAFT };
  try {
    const date = new URLSearchParams(search || '').get('date');
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { ...base, startDatetime: date, endDatetime: date };
    }
  } catch (e) { /* ignore */ }
  return base;
}

function ActivityPage({ activityUuid }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const activity = useSelector((s) => s.coordination.activity);
  const mutation = useSelector((s) => s.coordination.mutation);
  const submittingMutation = useSelector((s) => s.coordination.submittingMutation);

  const [edited, setEdited] = useState(() => initialFromQuery(history.location?.search));
  const [resetKey, setResetKey] = useState(0);
  const prev = useRef();

  const isNew = !activityUuid;
  const canEditDetails = (isNew && rights.includes(RIGHT_ACTIVITY_CREATE))
    || (rights.includes(RIGHT_ACTIVITY_UPDATE)
        && [ACTIVITY_STATUS.DRAFT, ACTIVITY_STATUS.REJECTED].includes(edited?.status));

  useEffect(() => {
    if (activityUuid) dispatch(fetchActivity(modulesManager, [`id: "${activityUuid}"`]));
    return () => dispatch(clearActivity());
  }, [activityUuid]);

  useEffect(() => {
    if (activity) {
      setEdited(activity);
      setResetKey((k) => k + 1);
      if (isNew && activity.id) {
        history.replace(`/${modulesManager.getRef(COORDINATION_ROUTE_ACTIVITY)}/${activity.id}`);
      }
    }
  }, [activity]);

  useEffect(() => {
    if (prev.current && !submittingMutation) {
      dispatch(journalize(mutation));
      if (mutation?.clientMutationId) {
        dispatch(fetchActivity(modulesManager, [`clientMutationId: "${mutation.clientMutationId}"`]));
      }
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const titleParams = (a) => ({ code: a?.code ?? EMPTY_STRING });
  const back = () => history.goBack();

  const save = (data) => {
    const label = formatMessageWithValues(
      isNew ? 'coordination.create.mutationLabel' : 'coordination.update.mutationLabel', titleParams(data),
    );
    if (isNew) dispatch(createActivity(data, label));
    else dispatch(updateActivity(data, label));
  };

  const onAction = (action) => dispatch(transitionActivity(
    action, edited, formatMessageWithValues(`coordination.action.${action}.mutationLabel`, titleParams(edited)),
  ));

  const mandatoryFilled = edited?.title && edited?.startDatetime
    && edited?.endDatetime && (edited?.departmentId || edited?.department?.id);
  const canSave = () => canEditDetails && mandatoryFilled;

  const actions = (!isNew ? (STATUS_ACTIONS[edited?.status] || []) : [])
    .filter((a) => rights.includes(a.right))
    .sort((a, b) => Number(!SECONDARY_ACTIONS.includes(a.action)) - Number(!SECONDARY_ACTIONS.includes(b.action)))
    .map((a) => ({
      onlyIfNotDirty: true,
      tooltip: formatMessage(`coordination.action.${a.action}`),
      button: (
        <Button
          variant={SECONDARY_ACTIONS.includes(a.action) ? 'text' : 'contained'}
          color="primary"
          onClick={() => onAction(a.action)}
        >
          {formatMessage(`coordination.action.${a.action}`)}
        </Button>
      ),
    }));

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues('coordination.ActivityPage.title', titleParams(edited))} />
      <Form
        key={resetKey}
        module="coordination"
        title="coordination.ActivityPage.title"
        titleParams={titleParams(edited)}
        edited={edited}
        edited_id={activityUuid}
        reset={resetKey}
        openDirty
        onEditedChanged={setEdited}
        back={back}
        save={save}
        canSave={canSave}
        saveTooltip={formatMessage('coordination.saveButton.tooltip')}
        Panels={[ActivityHeadPanel]}
        actions={actions}
        readOnly={!canEditDetails}
        rights={rights}
      />
    </div>
  );
}


const mapStateToProps = (state, props) => ({
  activityUuid: props.match.params.activity_uuid ? decId(props.match.params.activity_uuid) : undefined,
});
export default connect(mapStateToProps, null)(ActivityPage);
