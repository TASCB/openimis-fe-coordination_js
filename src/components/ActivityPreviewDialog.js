import React from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import EventNoteOutlined from '@material-ui/icons/EventNoteOutlined';
import EventOutlined from '@material-ui/icons/EventOutlined';
import MeetingRoomOutlined from '@material-ui/icons/MeetingRoomOutlined';
import PublicOutlined from '@material-ui/icons/PublicOutlined';
import PersonOutline from '@material-ui/icons/PersonOutline';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useModulesManager, useTranslations, formatDateFromISO } from '@openimis/fe-core';
import {
  PreviewDialog, PreviewSection, PreviewText, usePreviewStyles, PREVIEW_INK, PREVIEW_MUTED,
} from '@openimis/fe-tasaf_common';
import { MODULE_NAME } from '../constants';

// graphene JSONString arrives as a string.
const jsonExt = (a) => {
  if (!a?.jsonExt) return {};
  if (typeof a.jsonExt === 'object') return a.jsonExt;
  try { return JSON.parse(a.jsonExt) || {}; } catch (e) { return {}; }
};

const useStyles = makeStyles((theme) => {
  const teal = theme.palette.primary.main;
  return {
    tile: {
      width: 46, height: 46, borderRadius: 12, background: teal, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    facts: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
    fact: {
      display: 'flex', gap: 10, alignItems: 'flex-start',
      '& > svg': { fontSize: 18, color: teal, marginTop: 2, flex: '0 0 auto' },
    },
    factValue: { fontSize: 14, color: PREVIEW_INK, fontWeight: 600, wordBreak: 'break-word' },
    factSub: { fontSize: 12, color: PREVIEW_MUTED, marginTop: 1 },
    none: { color: '#9aa8a0', fontSize: 14 },
    reason: {
      padding: '12px 16px', borderLeft: '3px solid #c0392b', background: '#fdf3f2',
      borderRadius: '0 10px 10px 0', color: PREVIEW_INK, fontSize: 14.5, lineHeight: 1.6,
    },
  };
});

function Fact({ classes, icon, value, sub }) {
  if (!value) return null;
  return (
    <div className={classes.fact}>
      {icon}
      <div style={{ minWidth: 0 }}>
        <div className={classes.factValue}>{value}</div>
        {sub && <div className={classes.factSub}>{sub}</div>}
      </div>
    </div>
  );
}

function ActivityPreviewDialog({ activity, onClose, onOpen }) {
  const p = usePreviewStyles();
  const classes = useStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const a = activity || {};
  const ext = jsonExt(a);
  const fmtDate = (v) => (v ? formatDateFromISO(modulesManager, intl, v) : null);

  let days = null;
  if (a.startDatetime && a.endDatetime) {
    const d = Math.round((new Date(a.endDatetime) - new Date(a.startDatetime)) / 86400000) + 1;
    if (d > 0) days = `${d} ${formatMessage(d === 1 ? 'coordination.day' : 'coordination.days')}`;
  }
  const when = a.startDatetime ? `${fmtDate(a.startDatetime)} → ${fmtDate(a.endDatetime) || '—'}` : null;

  const aside = (
    <>
      <div className={classes.tile}><EventNoteOutlined /></div>
      <h2 className={p.heading}>{a.title}</h2>
      {a.code && <span className={p.code}>{a.code}</span>}
      <div className={p.tags}>
        {a.status && <span className={p.statusTag}>{formatMessage(`coordination.status.${a.status}`)}</span>}
        {a.department?.name && <span className={p.tag}>{a.department.name}</span>}
      </div>
      <div className={classes.facts}>
        <Fact classes={classes} icon={<EventOutlined />} value={when} sub={days} />
        <Fact classes={classes} icon={<MeetingRoomOutlined />} value={a.venue} />
        <Fact classes={classes} icon={<PublicOutlined />} value={a.location?.name} />
        <Fact
          classes={classes}
          icon={<PersonOutline />}
          value={a.responsible?.username}
          sub={a.responsible?.username ? formatMessage('coordination.responsible') : null}
        />
      </div>
    </>
  );

  const meta = (
    <>
      {a.userCreated?.username && (
        <span>
          {`${formatMessage('coordination.createdBy')} ${a.userCreated.username}`}
          {a.dateCreated ? ` · ${fmtDate(a.dateCreated)}` : ''}
        </span>
      )}
      {a.userUpdated?.username && (
        <span>
          {`${formatMessage('coordination.updatedBy')} ${a.userUpdated.username}`}
          {a.dateUpdated ? ` · ${fmtDate(a.dateUpdated)}` : ''}
        </span>
      )}
      {a.version != null && <span>{`${formatMessage('coordination.version')} ${a.version}`}</span>}
    </>
  );

  return (
    <PreviewDialog
      open={!!activity}
      onClose={onClose}
      title={formatMessage('coordination.previewTitle')}
      closeLabel={formatMessage('coordination.close')}
      aside={aside}
      meta={meta}
      actions={(
        <>
          <Button onClick={onClose} color="primary">{formatMessage('coordination.close')}</Button>
          {onOpen && (
            <Button onClick={() => onOpen(a)} color="primary" variant="contained" disableElevation startIcon={<OpenInNewIcon />}>
              {formatMessage('coordination.open')}
            </Button>
          )}
        </>
      )}
    >
      {ext.reject_reason && (
        <PreviewSection label={formatMessage('coordination.rejectReason')}>
          <div className={classes.reason}>{ext.reject_reason}</div>
        </PreviewSection>
      )}
      <PreviewSection label={formatMessage('coordination.description')}>
        {a.description
          ? <PreviewText moreLabel={formatMessage('coordination.readMore')} lessLabel={formatMessage('coordination.readLess')}>{a.description}</PreviewText>
          : <div className={classes.none}>{formatMessage('coordination.noDescription')}</div>}
      </PreviewSection>
    </PreviewDialog>
  );
}

export default ActivityPreviewDialog;
