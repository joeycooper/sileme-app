# Project Context

This file is a quick handoff note for new sessions or new machines.
It summarizes the current project status and where to continue.

## Current Focus
- Frontend refactor completed for the social module and core pages.
- Code now follows a strict structure: page entry files are thin, logic in hooks,
  UI in sections, common components/hooks extracted.

## Read First (Order)
1) `README.md`
2) `docs/FRONTEND-STRUCTURE.md`
3) `PRD-social.md`
4) `frontend/src/pages/Social.tsx`

## Frontend Structure Summary
- Page entry files are thin; they compose sections and hooks.
- Page-specific hooks live under `frontend/src/pages/<page>/hooks/`.
- UI sections live under `frontend/src/pages/<page>/sections/`.
- Social-specific sub-areas:
  - `pages/social/group/encourage/`
  - `pages/social/group/detail/`
  - `pages/social/group/panel/`
  - `pages/social/sheets/`
  - `pages/social/hooks/`
- Reusable UI and hooks:
  - `frontend/src/components/common/`
  - `frontend/src/hooks/`

## Recent Refactor Highlights
- Social hooks split: friends, groups, notifications, overlay lock, sections props.
- Group actions split into membership/admin/notify hooks.
- Notice UI moved to `components/common/notifications`.
- Group detail blocks and encourage page split into subcomponents.
- Friend/Group section headers and detail actions split into subcomponents.
- Common UI: `SectionHeader`, `NoticeList`, `PermissionToggle`.

## Key Files for Social Module
- `frontend/src/pages/Social.tsx`
- `frontend/src/pages/social/hooks/*`
- `frontend/src/pages/social/sections/*`
- `frontend/src/pages/social/group/*`
- `frontend/src/pages/social/sheets/*`

## How to Continue
- New features: add logic in page hooks, add UI in sections.
- Keep reusing common components/hooks; avoid growing page entry files.
- If a section grows, split into subcomponents under its folder.

## Notes
- PRD is consolidated in `PRD-social.md` (split PRD folder removed).
- README contains current setup, API list, and migration notes.

## PRD Change Log Template
- See `PRD-social.md` > "变更记录 / 待更新"
