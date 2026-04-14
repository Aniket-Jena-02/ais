## 2024-04-06 - Missing ARIA Labels on Hover Toolbars
**Learning:** In the `ais-site` components, particularly `MessageItem.tsx`, hover-based toolbars with icon-only actions (like "Reply", "Add Reaction", "More Options") frequently lack `aria-label` and `aria-expanded` attributes, making them inaccessible to screen readers.
**Action:** When adding or reviewing icon-only buttons, especially in dynamic or hover-revealed toolbars, always verify that an appropriate `aria-label` is present and that stateful menus (like popovers or dropdowns) use `aria-expanded`.
