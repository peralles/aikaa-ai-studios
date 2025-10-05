# Tenant Management API

## POST /api/tenants
Create a new tenant (Platform Admin only)

**Request**:
```json
{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "subscription_tier": "enterprise"
}
```

**Response** (201):
```json
{
  "id": "tenant-uuid",
  "name": "Acme Corporation", 
  "slug": "acme-corp",
  "subscription_tier": "enterprise",
  "created_at": "2025-10-05T12:00:00Z"
}
```

**Errors**:
- 400: Invalid input (slug already exists)
- 403: Insufficient permissions (not platform admin)

## GET /api/tenants/:id
Get tenant details

**Response** (200):
```json
{
  "id": "tenant-uuid",
  "name": "Acme Corporation",
  "slug": "acme-corp", 
  "subscription_tier": "enterprise",
  "created_at": "2025-10-05T12:00:00Z",
  "companies_count": 5,
  "users_count": 150
}
```

**Errors**:
- 404: Tenant not found
- 403: Access denied

## PUT /api/tenants/:id
Update tenant (Platform Admin or Tenant Admin)

**Request**:
```json
{
  "name": "Acme Corporation Ltd",
  "subscription_tier": "enterprise"
}
```

**Response** (200):
```json
{
  "id": "tenant-uuid",
  "name": "Acme Corporation Ltd",
  "slug": "acme-corp",
  "subscription_tier": "enterprise", 
  "updated_at": "2025-10-05T12:30:00Z"
}
```

## GET /api/tenants/:id/companies
List companies in tenant

**Response** (200):
```json
{
  "companies": [
    {
      "id": "company-uuid",
      "name": "Acme HQ",
      "type": "parent",
      "status": "active",
      "users_count": 50,
      "studios_count": 8
    },
    {
      "id": "company-uuid-2",
      "name": "Acme West",
      "type": "subsidiary", 
      "status": "active",
      "users_count": 25,
      "studios_count": 4
    }
  ],
  "total": 2
}
```