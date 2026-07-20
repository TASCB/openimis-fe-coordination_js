/* eslint-disable default-param-last */
import {
  dispatchMutationErr,
  dispatchMutationReq,
  dispatchMutationResp,
  formatGraphQLError,
  formatServerError,
  pageInfo,
  parseData,
  decodeId,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

export const ACTION_TYPE = {
  MUTATION: 'COORDINATION_MUTATION',
  SEARCH_ACTIVITIES: 'COORDINATION_ACTIVITIES',
  GET_ACTIVITY: 'COORDINATION_ACTIVITY',
  SEARCH_DEPARTMENTS: 'COORDINATION_DEPARTMENTS',
  GET_CALENDAR: 'COORDINATION_CALENDAR',
  GET_UNIFIED_CALENDAR: 'COORDINATION_UNIFIED_CALENDAR',
  GET_SUMMARY: 'COORDINATION_SUMMARY',
  CREATE_ACTIVITY: 'COORDINATION_CREATE_ACTIVITY',
  UPDATE_ACTIVITY: 'COORDINATION_UPDATE_ACTIVITY',
  DELETE_ACTIVITY: 'COORDINATION_DELETE_ACTIVITY',
  TRANSITION_ACTIVITY: 'COORDINATION_TRANSITION_ACTIVITY',
  MANAGE_DEPARTMENT: 'COORDINATION_MANAGE_DEPARTMENT',
};

export const MUTATION_SERVICE = {
  ACTIVITY: {
    CREATE: 'createCoordinationActivity',
    UPDATE: 'updateCoordinationActivity',
    DELETE: 'deleteCoordinationActivity',
  },
};

const STORE_STATE = {
  submittingMutation: false,
  mutation: {},
  fetchingActivities: false,
  fetchedActivities: false,
  errorActivities: null,
  activities: [],
  activitiesPageInfo: {},
  activitiesTotalCount: 0,
  fetchingActivity: false,
  fetchedActivity: false,
  activity: null,
  errorActivity: null,
  fetchingDepartments: false,
  fetchedDepartments: false,
  departments: [],
  calendar: [],
  fetchingCalendar: false,
  errorCalendar: null,
  unifiedCalendar: [],
  fetchingUnifiedCalendar: false,
  errorUnifiedCalendar: null,
  summary: null,
  fetchingSummary: false,
  errorSummary: null,
};

const mapList = (payload, key) => parseData(payload.data[key])?.map((x) => ({ ...x, id: decodeId(x.id) }));

function reducer(state = STORE_STATE, action) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.SEARCH_ACTIVITIES):
      return {
        ...state, fetchingActivities: true, fetchedActivities: false, activities: [], errorActivities: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_ACTIVITIES):
      return {
        ...state,
        fetchingActivities: false,
        fetchedActivities: true,
        activities: mapList(action.payload, 'coordinationActivity'),
        activitiesPageInfo: pageInfo(action.payload.data.coordinationActivity),
        activitiesTotalCount: action.payload.data.coordinationActivity?.totalCount ?? 0,
        errorActivities: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_ACTIVITIES):
      return { ...state, fetchingActivities: false, errorActivities: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_ACTIVITY):
      return {
        ...state, fetchingActivity: true, fetchedActivity: false, activity: null, errorActivity: null,
      };
    case SUCCESS(ACTION_TYPE.GET_ACTIVITY):
      return {
        ...state,
        fetchingActivity: false,
        fetchedActivity: true,
        activity: mapList(action.payload, 'coordinationActivity')?.[0],
        errorActivity: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_ACTIVITY):
      return { ...state, fetchingActivity: false, errorActivity: formatServerError(action.payload) };
    case CLEAR(ACTION_TYPE.GET_ACTIVITY):
      return {
        ...state, fetchingActivity: false, fetchedActivity: false, activity: null, errorActivity: null,
      };

    case REQUEST(ACTION_TYPE.SEARCH_DEPARTMENTS):
      return { ...state, fetchingDepartments: true, fetchedDepartments: false };
    case SUCCESS(ACTION_TYPE.SEARCH_DEPARTMENTS):
      return {
        ...state,
        fetchingDepartments: false,
        fetchedDepartments: true,
        departments: mapList(action.payload, 'coordinationDepartment'),
      };
    case ERROR(ACTION_TYPE.SEARCH_DEPARTMENTS):
      return { ...state, fetchingDepartments: false };

    case REQUEST(ACTION_TYPE.GET_CALENDAR):
      return { ...state, fetchingCalendar: true, errorCalendar: null };
    case SUCCESS(ACTION_TYPE.GET_CALENDAR):
      return {
        ...state,
        fetchingCalendar: false,
        calendar: (action.payload.data.coordinationActivityCalendar ?? []).map((x) => ({ ...x, id: decodeId(x.id) })),
        errorCalendar: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_CALENDAR):
      return { ...state, fetchingCalendar: false, errorCalendar: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_UNIFIED_CALENDAR):
      return { ...state, fetchingUnifiedCalendar: true, errorUnifiedCalendar: null };
    case SUCCESS(ACTION_TYPE.GET_UNIFIED_CALENDAR):
      return {
        ...state,
        fetchingUnifiedCalendar: false,
        // unified events already carry raw ids and a `source`; keep them as-is.
        unifiedCalendar: action.payload.data.coordinationUnifiedCalendar ?? [],
        errorUnifiedCalendar: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_UNIFIED_CALENDAR):
      return { ...state, fetchingUnifiedCalendar: false, errorUnifiedCalendar: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_SUMMARY):
      return { ...state, fetchingSummary: true, errorSummary: null };
    case SUCCESS(ACTION_TYPE.GET_SUMMARY):
      return {
        ...state,
        fetchingSummary: false,
        summary: action.payload.data.coordinationSummary,
        errorSummary: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_SUMMARY):
      return { ...state, fetchingSummary: false, errorSummary: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_ACTIVITY):
      return dispatchMutationResp(state, MUTATION_SERVICE.ACTIVITY.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_ACTIVITY):
      return dispatchMutationResp(state, MUTATION_SERVICE.ACTIVITY.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_ACTIVITY):
      return dispatchMutationResp(state, MUTATION_SERVICE.ACTIVITY.DELETE, action);
    case SUCCESS(ACTION_TYPE.TRANSITION_ACTIVITY):
      return dispatchMutationResp(state, action.meta?.serviceName ?? 'transition', action);
    case SUCCESS(ACTION_TYPE.MANAGE_DEPARTMENT):
      return dispatchMutationResp(state, action.meta?.serviceName ?? 'department', action);
    default:
      return state;
  }
}

export default reducer;
