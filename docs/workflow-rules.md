# Workflow Rules

These rules govern how CollabBoard is built. They prevent scope creep, ensure quality, and maintain a consistent review process.

---

## Phased Development

1. **One phase at a time.** Never build features from a future phase.
2. **Review gates.** After each phase, development stops until the reviewer says:  
   `"PHASE X APPROVED, proceed to Phase Y"`
3. **No feature creep.** If it's not in the current phase scope, it doesn't get built.
4. **Design first.** Every phase starts with architecture/design review before implementation.
5. **Verification.** Every phase includes a checklist that must pass before marking complete.

---

## Review Gate Process

```
┌─────────────────────────────────┐
│  1. Acknowledge phase scope     │
│  2. Present architecture plan   │
│  3. Wait for APPROVAL           │
│  4. Implement                   │
│  5. Run verification checklist  │
│  6. Present for review          │
│  7. Wait for PHASE APPROVED     │
│  8. → Next phase                │
└─────────────────────────────────┘
```

---

## Quality Standards

| Area | Standard |
|------|----------|
| Colors | All components use design tokens — no hardcoded hex values |
| Spacing | 4px grid only — no arbitrary `w-[123px]` values |
| Icons | Lucide React only — no other icon libraries or emojis |
| Loading | Skeleton screens — never spinners for content loading |
| Animations | Framer Motion — subtle, 200ms, no scale on buttons |
| Accessibility | Keyboard navigation, ARIA labels, focus-visible rings |
| Responsiveness | Mobile-first; sidebar collapses on mobile |
| TypeScript | Strict mode enabled, no `any` types |
| API | Consistent response format: `{ success, data?, error? }` |

---

## Do / Don't

| Don't | Do |
|-------|-----|
| Build everything at once | One phase at a time |
| Skip the design review | Show architecture before code |
| Accept "it works on my machine" | Run verification checklist |
| Add bonus features | Reject scope creep |
| Ignore design inconsistencies | Fix Phase 0 before moving on |
| Rush deployment | Spend proper time on Phase 7 testing |
| Use hardcoded colors | Use design tokens |
| Use spinners | Use skeleton loading |
| Use arbitrary Tailwind values | Use the 4px grid system |
