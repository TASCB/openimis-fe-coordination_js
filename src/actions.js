import {
  graphql, formatMutation, formatPageQueryWithCount, graphqlWithVariables, formatGQLString, decodeId,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';
import { ACTION_TYPE } from './reducer';
import { toISO } from './utils/dates';

const ACTIVITY_LIST_PROJECTION = () => [
  'id', 'code', 'title', 'status', 'startDatetime', 'endDatetime', 'venue', 'description', 'jsonExt',
  'department { id code name }', 'location { id code name }', 'responsible { id username }',
  'dateCreated', 'dateUpdated', 'userCreated { username }', 'userUpdated { username }', 'version',
];

const DEPARTMENT_PROJECTION = () => ['id', 'code', 'name', 'description', 'isActive'];

const str = (k, v) => (v !== undefined && v !== null && v !== '' ? `${k}: "${formatGQLString(v)}"` : '');
const raw = (k, v) => (v !== undefined && v !== null && v !== '' ? `${k}: ${v}` : '');
const list = (k, v) => (Array.isArray(v) && v.length ? `${k}: [${v.map((x) => `"${x}"`).join(',')}]` : '');

export const decId = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v);
  if (/^\d+$/.test(s)) return s; // plain integer pk (e.g. Location)
  if (/^[0-9a-f-]{36}$/i.test(s)) return s; // plain UUID
  try { return decodeId(s); } catch (e) { return s; }
};

export const encId = (typeName, v) => {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v);
  if (/^[0-9a-f-]{36}$/i.test(s)) return btoa(`${typeName}:${s}`);
  return s;
};

export function fetchActivities(modulesManager, params) {
  const payload = formatPageQueryWithCount('coordinationActivity', params, ACTIVITY_LIST_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_ACTIVITIES);
}

export function fetchActivity(modulesManager, params) {
  const payload = formatPageQueryWithCount('coordinationActivity', params, ACTIVITY_LIST_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_ACTIVITY);
}

export const clearActivity = () => (dispatch) => dispatch({ type: CLEAR(ACTION_TYPE.GET_ACTIVITY) });

function formatActivityGQL(a, includeCode = true) {
  return [
    str('id', a?.id),
    includeCode ? str('code', a?.code) : null,
    str('title', a?.title),
    str('description', a?.description),
    str('departmentId', decId(a?.departmentId ?? a?.department?.id)),
    str('startDatetime', toISO(a?.startDatetime)),
    str('endDatetime', toISO(a?.endDatetime, true)),
    raw('locationId', decId(a?.locationId ?? a?.location?.id)),
    str('venue', a?.venue),
    str('responsibleId', decId(a?.responsibleId ?? a?.responsible?.id)),
    raw('status', a?.status),
  ].filter(Boolean).join('\n');
}

export function createActivity(activity, clientMutationLabel) {
  const mutation = formatMutation('createCoordinationActivity', formatActivityGQL(activity, false), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_ACTIVITY), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function updateActivity(activity, clientMutationLabel) {
  const mutation = formatMutation('updateCoordinationActivity', formatActivityGQL(activity, true), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_ACTIVITY), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function deleteActivity(activity, clientMutationLabel) {
  const mutation = formatMutation('deleteCoordinationActivity', list('ids', [activity.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_ACTIVITY), ERROR(ACTION_TYPE.MUTATION)],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, requestedDateTime: new Date() },
  );
}

export function transitionActivity(action, activity, clientMutationLabel, reason = null) {
  const serviceName = `${action}CoordinationActivity`;
  const input = [str('id', activity.id), str('reason', reason)].filter(Boolean).join('\n');
  const mutation = formatMutation(serviceName, input, clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.TRANSITION_ACTIVITY), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName, requestedDateTime: new Date(),
    },
  );
}

// ── Departments ──
export function fetchDepartments(modulesManager, params = ['first: 100', 'isActive: true']) {
  const payload = formatPageQueryWithCount('coordinationDepartment', params, DEPARTMENT_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_DEPARTMENTS);
}

function formatDepartmentGQL(d) {
  return [
    str('id', d?.id),
    str('code', d?.code),
    str('name', d?.name),
    str('description', d?.description),
    raw('isActive', d?.isActive === undefined ? '' : (d.isActive ? 'true' : 'false')),
  ].filter(Boolean).join('\n');
}

export function saveDepartment(d, clientMutationLabel) {
  const serviceName = d.id ? 'updateCoordinationDepartment' : 'createCoordinationDepartment';
  const mutation = formatMutation(serviceName, formatDepartmentGQL(d), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_DEPARTMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName, requestedDateTime: new Date(),
    },
  );
}

export function deleteDepartment(d, clientMutationLabel) {
  const mutation = formatMutation('deleteCoordinationDepartment', list('ids', [d.id]), clientMutationLabel);
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.MANAGE_DEPARTMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId, clientMutationLabel, serviceName: 'deleteDepartment', requestedDateTime: new Date(),
    },
  );
}

// ── Calendars ──
export function fetchCalendar(variables) {
  return graphqlWithVariables(
    `query ($dateFrom: DateTime!, $dateTo: DateTime!, $status: String, $departmentId: UUID, $locationId: Int) {
      coordinationActivityCalendar(dateFrom: $dateFrom, dateTo: $dateTo, status: $status, departmentId: $departmentId, locationId: $locationId) {
        id code title status startDatetime endDatetime
      }
    }`,
    variables,
    ACTION_TYPE.GET_CALENDAR,
  );
}

export function fetchUnifiedCalendar(variables) {
  return graphqlWithVariables(
    `query ($dateFrom: DateTime!, $dateTo: DateTime!, $status: String, $departmentId: UUID, $sources: [String]) {
      coordinationUnifiedCalendar(dateFrom: $dateFrom, dateTo: $dateTo, status: $status, departmentId: $departmentId, sources: $sources) {
        id code title status startDatetime endDatetime source department
      }
    }`,
    variables,
    ACTION_TYPE.GET_UNIFIED_CALENDAR,
  );
}

export function fetchSummary(variables = {}) {
  return graphqlWithVariables(
    `query ($dateFrom: DateTime, $dateTo: DateTime, $departmentId: UUID) {
      coordinationSummary(dateFrom: $dateFrom, dateTo: $dateTo, departmentId: $departmentId) {
        totalActivities activitiesThisWeek pendingApproval approvedActivities
        byStatus { status count }
      }
    }`,
    variables,
    ACTION_TYPE.GET_SUMMARY,
  );
}
