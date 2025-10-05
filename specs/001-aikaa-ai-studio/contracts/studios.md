# Studio Management API

## POST /api/companies/:company_id/studios
Create a new Studio (Kanban board)

**Request**:
```json
{
  "name": "Sales Pipeline",
  "description": "Track sales opportunities from lead to close",
  "card_type": "opportunity",
  "column_config": {
    "columns": [
      {"id": "prospect", "name": "Prospect", "order": 1},
      {"id": "qualified", "name": "Qualified", "order": 2}, 
      {"id": "proposal", "name": "Proposal", "order": 3},
      {"id": "closed", "name": "Closed", "order": 4}
    ]
  }
}
```

**Response** (201):
```json
{
  "id": "studio-uuid",
  "company_id": "company-uuid",
  "name": "Sales Pipeline",
  "description": "Track sales opportunities from lead to close",
  "card_type": "opportunity",
  "status": "active",
  "column_config": {
    "columns": [
      {"id": "prospect", "name": "Prospect", "order": 1},
      {"id": "qualified", "name": "Qualified", "order": 2},
      {"id": "proposal", "name": "Proposal", "order": 3}, 
      {"id": "closed", "name": "Closed", "order": 4}
    ]
  },
  "created_by": "user-uuid",
  "created_at": "2025-10-05T12:00:00Z"
}
```

**Errors**:
- 400: Invalid input (duplicate column names, invalid card type)
- 403: Insufficient permissions (not company admin/user)

## GET /api/companies/:company_id/studios
List studios in company

**Query Parameters**:
- `status` (optional): active, archived
- `card_type` (optional): lead, opportunity, customer, sale, task

**Response** (200):
```json
{
  "studios": [
    {
      "id": "studio-uuid",
      "name": "Sales Pipeline", 
      "card_type": "opportunity",
      "status": "active",
      "cards_count": 25,
      "created_at": "2025-10-05T12:00:00Z"
    }
  ],
  "total": 1
}
```

## GET /api/studios/:id
Get studio details with cards

**Response** (200):
```json
{
  "id": "studio-uuid",
  "company_id": "company-uuid", 
  "name": "Sales Pipeline",
  "description": "Track sales opportunities from lead to close",
  "card_type": "opportunity",
  "status": "active",
  "column_config": {
    "columns": [
      {"id": "prospect", "name": "Prospect", "order": 1},
      {"id": "qualified", "name": "Qualified", "order": 2},
      {"id": "proposal", "name": "Proposal", "order": 3},
      {"id": "closed", "name": "Closed", "order": 4}
    ]
  },
  "cards": [
    {
      "id": "card-uuid",
      "title": "Acme Corp Deal",
      "status": "qualified", 
      "priority": "high",
      "assigned_to": {
        "id": "user-uuid",
        "name": "John Doe"
      },
      "config": {
        "value": 50000,
        "probability": 75,
        "close_date": "2025-11-15"
      },
      "created_at": "2025-10-01T10:00:00Z"
    }
  ],
  "created_by": "user-uuid",
  "created_at": "2025-10-05T12:00:00Z"
}
```

## PUT /api/studios/:id
Update studio configuration

**Request**:
```json
{
  "name": "Sales Pipeline V2",
  "description": "Updated sales process",
  "column_config": {
    "columns": [
      {"id": "prospect", "name": "Prospect", "order": 1},
      {"id": "qualified", "name": "Qualified Lead", "order": 2},
      {"id": "demo", "name": "Demo Scheduled", "order": 3},
      {"id": "proposal", "name": "Proposal", "order": 4},
      {"id": "closed", "name": "Closed", "order": 5}
    ]
  }
}
```

**Response** (200):
```json
{
  "id": "studio-uuid",
  "name": "Sales Pipeline V2", 
  "description": "Updated sales process",
  "column_config": {
    "columns": [
      {"id": "prospect", "name": "Prospect", "order": 1},
      {"id": "qualified", "name": "Qualified Lead", "order": 2},
      {"id": "demo", "name": "Demo Scheduled", "order": 3},
      {"id": "proposal", "name": "Proposal", "order": 4},
      {"id": "closed", "name": "Closed", "order": 5}
    ]
  },
  "updated_at": "2025-10-05T12:30:00Z"
}
```

**Errors**:
- 400: Invalid column configuration
- 403: Insufficient permissions
- 409: Cannot change card_type (immutable after creation)