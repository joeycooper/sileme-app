# Frontend Structure Guide

This document captures the refactor conventions used in the current frontend. Please follow
these rules for future work so the structure stays consistent and easy to extend.

## Goals
- Small, focused components.
- Clear separation between UI, hooks, and data orchestration.
- Predictable file locations for quick discovery.

## Directory Overview

Frontend pages now follow this pattern:

```
frontend/src/pages/
  Social.tsx
  social/
    hooks/
    sections/
    group/
    sheets/
    notifications/
```

Common reusable UI and hooks:

```
frontend/src/components/common/
frontend/src/hooks/
```

## Core Rules

1) Page entry files are thin
- `Social.tsx`, `Home.tsx`, `History.tsx`, `Profile.tsx` should only compose sections,
  call top-level hooks, and wire props.

2) Keep page logic inside page-specific hooks
- Use `frontend/src/pages/<page>/hooks/` for page-level state and actions.
- Extract reusable logic to `frontend/src/hooks/` only when multiple pages need it.

3) Sections are UI-only
- `sections/` components should accept props and render UI.
- Data fetching, state, and side effects belong to hooks.

4) Sub-sections live under their section folder
- Example:
  - `sections/friend/FriendSection.tsx`
  - `sections/friend/FriendCard.tsx`
  - `sections/group/GroupSection.tsx`
  - `sections/notice/NoticeSection.tsx`

5) Group-related UI is grouped under `group/`
- Encourage page: `pages/social/group/encourage/`
- Detail blocks: `pages/social/group/detail/`
- Panel sheet: `pages/social/group/panel/`

6) Sheets live under `sheets/`
- `AddFriendSheet`, `GroupDetailSheetContainer`, `GroupPanelSheetContainer`, etc.

7) Use shared UI components where possible
- `components/common/SectionHeader`
- `components/common/PermissionToggle`
- `components/common/NoticeList`
- `components/common/notifications/*`

8) Use shared hooks where possible
- `hooks/useNotice`, `hooks/useAsyncList`, `hooks/useFormState`, etc.

## Social Page Example

Top-level composition:

- `Social.tsx` calls:
  - `useFriends`
  - `useGroups`
  - `useNotifications`
  - `useAddFriendSheet`
  - `useSocialSections`
  - `useSocialOverlayLock`

Sections receive prop groups from `useSocialSections`.

## Adding New Features

Use this checklist:

- Add API interactions to `services/api.ts`.
- Add state/actions in a page hook.
- Add UI in a section component.
- If a section grows, split into sub-components under its folder.
- Reuse common components for headers, empty states, toggles, etc.

## Naming Conventions

- Hooks: `useXxx`
- Section components: `XxxSection`
- UI blocks/cards: `XxxCard`, `XxxBlock`, `XxxRow`
- Grouped exports via `index.ts` when a folder has multiple components.

## Notes for New Machines / New Sessions

- Start with `README.md` for project overview.
- Read this file for frontend structure.
- If continuing refactors, stay within existing folder boundaries.
