/* eslint-disable import/prefer-default-export */
import React from 'react';
import {
  Event, CalendarToday, DateRange, Settings,
} from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';

import messages_en from './translations/en.json';
import reducer from './reducer';
import {
  RIGHT_ACTIVITY_SEARCH, RIGHT_DASHBOARD_VIEW, RIGHT_COORDINATION_ADMIN,
  COORDINATION_ROUTE_ACTIVITIES, COORDINATION_ROUTE_ACTIVITY, COORDINATION_ROUTE_CALENDAR,
  COORDINATION_ROUTE_UNIFIED, COORDINATION_ROUTE_SETTINGS,
} from './constants';

import ActivitiesPage from './pages/ActivitiesPage';
import ActivityPage from './pages/ActivityPage';
import CalendarPage from './pages/CalendarPage';
import UnifiedCalendarPage from './pages/UnifiedCalendarPage';
import SettingsPage from './pages/SettingsPage';
import DepartmentPicker from './pickers/DepartmentPicker';
import ResponsiblePicker from './pickers/ResponsiblePicker';
import { ActivityStatusPicker } from './pickers/ConstantPickers';

const ROUTE_ACTIVITIES = 'coordination/activities';
const ROUTE_ACTIVITY = 'coordination/activities/activity';
const ROUTE_CALENDAR = 'coordination/calendar';
const ROUTE_UNIFIED = 'coordination/unified-calendar';
const ROUTE_SETTINGS = 'coordination/settings';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'coordination', reducer }],
  refs: [
    { key: COORDINATION_ROUTE_ACTIVITIES, ref: ROUTE_ACTIVITIES },
    { key: COORDINATION_ROUTE_ACTIVITY, ref: ROUTE_ACTIVITY },
    { key: COORDINATION_ROUTE_CALENDAR, ref: ROUTE_CALENDAR },
    { key: COORDINATION_ROUTE_UNIFIED, ref: ROUTE_UNIFIED },
    { key: COORDINATION_ROUTE_SETTINGS, ref: ROUTE_SETTINGS },
    { key: 'coordination.DepartmentPicker', ref: DepartmentPicker },
    { key: 'coordination.ResponsiblePicker', ref: ResponsiblePicker },
    { key: 'coordination.ActivityStatusPicker', ref: ActivityStatusPicker },
  ],
  'core.Router': [
    { path: ROUTE_ACTIVITIES, component: ActivitiesPage },
    { path: `${ROUTE_ACTIVITY}/:activity_uuid?`, component: ActivityPage },
    { path: ROUTE_CALENDAR, component: CalendarPage },
    { path: ROUTE_UNIFIED, component: UnifiedCalendarPage },
    { path: ROUTE_SETTINGS, component: SettingsPage },
  ],
  'coordination.MainMenu': [
    {
      text: <FormattedMessage module="coordination" id="menu.calendar" />,
      icon: <CalendarToday />,
      route: `/${ROUTE_CALENDAR}`,
      filter: (rights) => rights.includes(RIGHT_DASHBOARD_VIEW),
      id: 'coordination.calendar',
    },
    {
      text: <FormattedMessage module="coordination" id="menu.unified" />,
      icon: <DateRange />,
      route: `/${ROUTE_UNIFIED}`,
      filter: (rights) => rights.includes(RIGHT_DASHBOARD_VIEW),
      id: 'coordination.unified',
    },
    {
      text: <FormattedMessage module="coordination" id="menu.activities" />,
      icon: <Event />,
      route: `/${ROUTE_ACTIVITIES}`,
      filter: (rights) => rights.includes(RIGHT_ACTIVITY_SEARCH),
      id: 'coordination.activities',
    },
    {
      text: <FormattedMessage module="coordination" id="menu.settings" />,
      icon: <Settings />,
      route: `/${ROUTE_SETTINGS}`,
      filter: (rights) => rights.includes(RIGHT_COORDINATION_ADMIN),
      id: 'coordination.settings',
    },
  ],
};

export const CoordinationModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
