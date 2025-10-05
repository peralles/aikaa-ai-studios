# Company Management API  

## POST /api/companies
Create a new company within tenant

**Request**:
```json
{
  "name": "Acme West Division",
  "type": "subsidiary",
  "parent_company_id": "company-uuid"
}
```

**Response** (201):
```json
{
  "id": "company-uuid",
  "tenant_id": "tenant-uuid",
  "name": "Acme West Division",
  "type": "subsidiary",
  "parent_company_id": "parent-company-uuid",
  "status": "active",
  "created_at": "2025-10-05T12:00:00Z"
}
```

**Errors**:
- 400: Invalid input (circular hierarchy)  
- 403: Insufficient permissions

## GET /api/companies/:id
Get company details

**Response** (200):
```json
{  
  "id": "company-uuid",
  "tenant_id": "tenant-uuid",
  "name": "Acme West Division",
  "type": "subsidiary",
  "parent_company_id": "parent-company-uuid",
  "status": "active", 
  "created_at": "2025-10-05T12:00:00Z",
  "users_count": 25,
  "studios_count": 4,
  "parent_company": {
    "id": "parent-company-uuid",
    "name": "Acme HQ"
  }
}
```

## PUT /api/companies/:id  
Update company details

**Request**:
```json
{
  "name": "Acme West Coast",
  "status": "active"
}
```

**Response** (200):
```json
{
  "id": "company-uuid", 
  "name": "Acme West Coast",
  "status": "active",
  "updated_at": "2025-10-05T12:30:00Z"
}
```

## GET /api/companies/:id/users
List users with access to company

**Response** (200):
```json
{
  "users": [
    {
      "id": "user-uuid",
      "email": "john@acme.com",
      "first_name": "John",
      "last_name": "Doe", 
      "role": "admin",
      "granted_at": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

## POST /api/companies/:id/users  
Grant user access to company

**Request**:
```json
{
  "user_id": "user-uuid",
  "role": "user"
}
```

**Response** (201):
```json
{
  "user_id": "user-uuid",
  "company_id": "company-uuid", 
  "role": "user",
  "granted_at": "2025-10-05T12:00:00Z",
  "granted_by": "admin-user-uuid"
}
```

## DELETE /api/companies/:id/users/:user_id
Revoke user access to company

**Response** (200):
```json
{
  "message": "Access revoked",
  "revoked_at": "2025-10-05T12:30:00Z"
}
```