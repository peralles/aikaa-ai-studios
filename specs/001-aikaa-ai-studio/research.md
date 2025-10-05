# Research: Aikaa AI Studio Multi-Tenant Platform

## Multi-Tenant Architecture with Supabase

### Decision: Row Level Security (RLS) for Tenant Isolation
**Rationale**: Supabase's PostgreSQL RLS provides secure, database-level tenant isolation without application-layer complexity. Each tenant gets a unique identifier that filters all queries automatically.

**Alternatives considered**:
- Separate databases per tenant (too complex for 1000+ tenants)
- Application-layer filtering (security risk, performance overhead)
- Schema-based isolation (PostgreSQL limitations)

### Decision: Supabase Realtime for Notifications
**Rationale**: Built-in realtime subscriptions provide efficient notification delivery without additional infrastructure. Aligns with "basic notifications only" requirement.

**Alternatives considered**:
- WebSockets with custom server (unnecessary complexity)
- Polling-based updates (poor performance at scale)
- Server-sent events (limited browser support)

## State Management Architecture

### Decision: TanStack Query + React Context
**Rationale**: TanStack Query handles server state with intelligent caching, while React Context manages auth/tenant context. Avoids over-engineering with Redux.

**Alternatives considered**:
- Redux Toolkit (overkill for this use case)
- Zustand (good but TanStack Query already handles most needs)
- Pure React state (insufficient for complex server state)

### Decision: Optimistic Updates for Card Operations
**Rationale**: Card drag-and-drop requires immediate UI feedback for good UX. TanStack Query's optimistic updates provide this with automatic rollback on failure.

## Component Architecture

### Decision: shadcn/ui + Radix UI Foundation
**Rationale**: Provides accessible, customizable components that align with constitutional UI/UX consistency requirements. Tailwind integration supports performance goals.

**Alternatives considered**:
- Material-UI (heavier bundle, different design language)
- Ant Design (opinionated styling, harder customization)
- Custom components (reinventing the wheel, accessibility concerns)

### Decision: Compound Component Pattern for Studios
**Rationale**: Kanban boards have complex interaction patterns. Compound components provide flexibility while maintaining consistent API.

**Example**:
```typescript
<Studio>
  <Studio.Header />
  <Studio.Columns>
    <Studio.Column status="todo">
      <Studio.Cards />
    </Studio.Column>
  </Studio.Columns>
</Studio>
```

## Performance Optimization

### Decision: Vite + Code Splitting by Route
**Rationale**: Vite's fast HMR supports development velocity. Route-based splitting ensures initial bundle stays small for enterprise users with limited bandwidth.

**Implementation**:
- Lazy loading for admin pages (used by fewer users)
- Preloading for dashboard components (most common workflows)
- Dynamic imports for tenant-specific features

### Decision: Virtual Scrolling for Large Card Lists
**Rationale**: With 100K+ cards, traditional rendering would cause performance issues. React-window provides efficient virtualization.

**Alternatives considered**:
- Pagination (poor UX for Kanban boards)
- Infinite scrolling (memory leaks with large datasets)
- Server-side filtering (still need client-side performance)

## Authentication & Authorization

### Decision: Supabase Auth with Custom Claims
**Rationale**: Built-in auth handles complexity while custom claims in JWT provide tenant/role information for RLS policies.

**JWT Structure**:
```json
{
  "sub": "user-id",
  "tenant_id": "tenant-123",
  "role": "admin|user",
  "companies": ["company-1", "company-2"]
}
```

### Decision: Hierarchical Role System
**Rationale**: Platform Admin > Tenant Admin > Company Admin > User hierarchy supports enterprise requirements while keeping permission model simple.

## Data Modeling Strategy

### Decision: JSONB for Card Configurations
**Rationale**: Cards need flexible schema (Lead vs Task vs Opportunity). JSONB provides structure with query performance while avoiding complex EAV patterns.

**Schema example**:
```sql
cards(
  id uuid,
  tenant_id uuid,
  studio_id uuid,
  card_type text, -- 'lead', 'task', 'opportunity'
  config jsonb,   -- flexible schema
  status text,
  created_at timestamp
)
```

### Decision: Audit Trail via Triggers
**Rationale**: PostgreSQL triggers provide automatic audit logging without application complexity. Essential for enterprise compliance.

## Testing Strategy

### Decision: Integration-First Testing
**Rationale**: Multi-tenant systems have complex interactions. Integration tests catch tenant isolation bugs that unit tests miss.

**Test pyramid**:
- Few E2E tests for critical workflows (login, create tenant, move cards)
- Many integration tests for tenant/role scenarios
- Unit tests only for complex business logic

### Decision: Test Tenant Pattern
**Rationale**: Each test gets isolated tenant to prevent cross-contamination. Supabase's database reset makes this feasible.

## Deployment & Operations

### Decision: Supabase Hosted + Vercel Frontend
**Rationale**: Managed services reduce operational complexity. Vercel's edge deployment provides global performance for international tenants.

**Alternatives considered**:
- Self-hosted PostgreSQL (operational overhead)
- AWS/GCP custom deployment (unnecessary complexity)
- Single-region deployment (poor performance for global users)

### Decision: Feature Flags via Supabase Functions
**Rationale**: Edge functions provide server-side feature flag evaluation without additional services. Critical for rolling out features to enterprise clients safely.

## Security Considerations

### Decision: API Keys in Environment Variables Only
**Rationale**: No hardcoded secrets. Supabase RLS provides defense-in-depth even if client-side code is compromised.

### Decision: Tenant Data Encryption at Rest
**Rationale**: Enterprise clients require data encryption. Supabase provides this by default, meeting constitutional security standards.

## Monitoring & Observability

### Decision: Supabase Analytics + Vercel Analytics
**Rationale**: Built-in monitoring reduces operational overhead while providing essential metrics for performance tracking.

**Key metrics**:
- Response times (constitutional <200ms requirement)
- Error rates by tenant
- User engagement by feature
- Database query performance

## Scalability Planning

### Decision: Horizontal Scaling via Supabase Pro
**Rationale**: Supabase handles database scaling automatically. React SPA scales via CDN distribution.

**Scaling triggers**:
- >80% CPU on database tier
- >100ms p95 response times
- >1000 concurrent connections

This research provides the foundation for Phase 1 design and implementation decisions.