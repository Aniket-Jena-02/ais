## 2026-04-04 - [Added ARIA Labels to Message Item Actions]
**Learning:** Hover-based toolbars with icon-only actions are a common pattern in this application (e.g., `MessageItem.tsx`). These frequently lack `aria-label` attributes, creating a significant accessibility gap for screen reader users trying to interact with messages.
**Action:** Always verify that icon-only buttons in interactive components have descriptive `aria-label` or `title` attributes (preferably both for cross-compatibility) to ensure full accessibility.
