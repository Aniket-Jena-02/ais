## 2024-03-30 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found a widespread pattern of icon-only buttons missing `aria-label` attributes across this app, making them inaccessible to screen readers and lacking tooltips for users. This specifically appeared in `MessageInput.tsx`, but likely occurs in other places too given its recurrence.
**Action:** When adding or reviewing new interactive elements (especially `lucide-react` icons wrapped in buttons), always ensure an `aria-label` is applied if the button does not contain visible descriptive text.
