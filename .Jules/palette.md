## 2024-04-07 - Accessibility in Hover-Based Toolbars
**Learning:** Icon-only buttons in hover-based toolbars (like message actions: reply, react, more options) frequently lack `aria-label` and screen reader accessibility context, and stateful elements need explicit ARIA states.
**Action:** Consistently add `aria-label` to all icon-only buttons. For stateful dropdowns or pickers, add `aria-expanded` and `aria-haspopup`. For togglable states like reactions, use `aria-pressed`.
