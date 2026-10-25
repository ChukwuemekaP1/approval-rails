# UI Layer (`src/ui`)

## Invariants & Rules
- Presentation components, design system tokens, layout shells, and accessible navigation.
- Accessible semantic HTML with high-contrast keyboard focus indicators (`focus-visible:ring-2`).
- Touch-friendly tap targets (minimum 44x44px for mobile interactive targets).
- Responsive: guaranteed zero horizontal overflow at 360px viewport.
- Calls application use cases or backend route handlers; never accesses infrastructure adapters directly.
