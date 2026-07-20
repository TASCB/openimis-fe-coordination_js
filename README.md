# openIMIS Frontend Coordination module

A Google/Notion-style **calendar** of departmental **activities** with a multi-level
approval workflow and a **unified calendar** that also surfaces Training and
Communications events. Frontend counterpart of `openimis-be-coordination_py`.

## Features

- **Calendar** (month / week / agenda) with status-colour legend, "+N more" day popover
  and a "New activity" action — the shared `ModuleCalendar` used by Training/Communications.
- **Unified Calendar** — cross-module events (Coordination + Training + Communications),
  coloured by source.
- **Activities** searcher (filter, sort, paginate) + detail form.
- **Multi-level approval**: DRAFT → SUBMITTED → MANAGER_APPROVED → OFFICER_APPROVED →
  APPROVED (+ REJECTED / CANCELLED), each hop gated by its own right.
- **Settings** page (department/unit management + role-based visibility).
- Click a calendar day's "New" to create; a day-prefill via `?date=YYYY-MM-DD` seeds the
  new activity's start date.

## Install (assembly)

Add to `openimis-fe_js/openimis.json` `modules`:

```json
{ "name": "CoordinationModule", "npm": "@openimis/fe-coordination@file:../openimis-fe-coordination_js" }
```

Then regenerate + install from the assembly:

```bash
node modules-config.js
yarn install
```

The exported factory `CoordinationModule` must match the `name` in `openimis.json`.

## Rights (block 2511xx — must match the backend)

251101 search · 251102 create · 251103 update · 251104 delete ·
251110 manager approve · 251111 officer approve · 251112 coordination approve ·
251201 department search · 251202 department manage · 251601 calendar/dashboard view ·
251901 settings admin.
