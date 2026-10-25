# Application Layer (`src/application`)

## Invariants & Rules
- Defines application use cases, transaction boundaries, and orchestration.
- Defines **ports** (interfaces for repositories, notification services, AI agents, payment processors).
- Depends ONLY on `src/domain`.
- Independent of UI frameworks or infrastructure details.
