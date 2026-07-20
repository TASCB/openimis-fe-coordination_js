export const MODULE_NAME = 'coordination';

export const RIGHT_ACTIVITY_SEARCH = 251101;
export const RIGHT_ACTIVITY_CREATE = 251102;
export const RIGHT_ACTIVITY_UPDATE = 251103;
export const RIGHT_ACTIVITY_DELETE = 251104;
// one approve right per approval level
export const RIGHT_ACTIVITY_MANAGER_APPROVE = 251110;
export const RIGHT_ACTIVITY_OFFICER_APPROVE = 251111;
export const RIGHT_ACTIVITY_DEPT_APPROVE = 251112;
export const RIGHT_DEPARTMENT_SEARCH = 251201;
export const RIGHT_DEPARTMENT_MANAGE = 251202;
export const RIGHT_DASHBOARD_VIEW = 251601;
export const RIGHT_COORDINATION_ADMIN = 251901;

export const COORDINATION_ROUTE_ACTIVITIES = 'coordination.route.activities';
export const COORDINATION_ROUTE_ACTIVITY = 'coordination.route.activity';
export const COORDINATION_ROUTE_CALENDAR = 'coordination.route.calendar';
export const COORDINATION_ROUTE_UNIFIED = 'coordination.route.unified';
export const COORDINATION_ROUTE_SETTINGS = 'coordination.route.settings';

export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const CONTAINS_LOOKUP = 'Icontains';
export const EMPTY_STRING = '';
export const PICKER_LIMIT = 50;

export const ACTIVITY_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  MANAGER_APPROVED: 'MANAGER_APPROVED',
  OFFICER_APPROVED: 'OFFICER_APPROVED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};
export const ACTIVITY_STATUS_LIST = Object.values(ACTIVITY_STATUS);

export const STATUS_COLORS = {
  DRAFT: '#9e9e9e',
  SUBMITTED: '#1976d2',
  MANAGER_APPROVED: '#0288d1',
  OFFICER_APPROVED: '#7b1fa2',
  APPROVED: '#2e7d32',
  REJECTED: '#d32f2f',
  CANCELLED: '#c62828',
};

export const UNIFIED_SOURCES = ['COORDINATION', 'TRAINING', 'COMMUNICATIONS'];
export const SOURCE_COLORS = {
  COORDINATION: '#2e7d32',
  TRAINING: '#1976d2',
  COMMUNICATIONS: '#ed6c02',
};

export const STATUS_ACTIONS = {
  DRAFT: [
    { action: 'submit', right: RIGHT_ACTIVITY_UPDATE },
    { action: 'cancel', right: RIGHT_ACTIVITY_UPDATE },
  ],
  SUBMITTED: [
    { action: 'managerApprove', right: RIGHT_ACTIVITY_MANAGER_APPROVE },
    { action: 'reject', right: RIGHT_ACTIVITY_MANAGER_APPROVE },
  ],
  MANAGER_APPROVED: [
    { action: 'officerApprove', right: RIGHT_ACTIVITY_OFFICER_APPROVE },
    { action: 'reject', right: RIGHT_ACTIVITY_OFFICER_APPROVE },
  ],
  OFFICER_APPROVED: [
    { action: 'deptApprove', right: RIGHT_ACTIVITY_DEPT_APPROVE },
    { action: 'reject', right: RIGHT_ACTIVITY_DEPT_APPROVE },
  ],
  APPROVED: [
    { action: 'cancel', right: RIGHT_ACTIVITY_UPDATE },
  ],
  REJECTED: [
    { action: 'revise', right: RIGHT_ACTIVITY_UPDATE },
  ],
  CANCELLED: [],
};
