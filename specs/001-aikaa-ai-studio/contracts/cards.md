# Card Management API

## POST /api/studios/:studio_id/cards
Create a new card

**Request**:
```json
{
  "title": "New Sales Opportunity",
  "description": "Potential client interested in our services",
  "priority": "high",
  "assigned_to": "user-uuid",
  "due_date": "2025-11-15",
  "config": {
    "client_name": "Tech Startup Inc",
    "value": 75000,
    "probability": 60,
    "close_date": "2025-11-30"
  }
}
```

**Response** (201):
```json
{
  "id": "card-uuid",
  "studio_id": "studio-uuid",
  "title": "New Sales Opportunity", 
  "description": "Potential client interested in our services",
  "card_type": "opportunity",
  "status": "prospect",
  "priority": "high",
  "assigned_to": "user-uuid",
  "created_by": "user-uuid",
  "due_date": "2025-11-15",
  "config": {
    "client_name": "Tech Startup Inc",
    "value": 75000,
    "probability": 60,
    "close_date": "2025-11-30"
  },
  "created_at": "2025-10-05T12:00:00Z"
}
```

**Errors**:
- 400: Invalid input (config doesn't match card type)
- 403: Insufficient permissions  
- 404: Studio not found

## GET /api/cards/:id
Get card details with comments

**Response** (200):
```json
{
  "id": "card-uuid",
  "studio_id": "studio-uuid",
  "title": "New Sales Opportunity",
  "description": "Potential client interested in our services", 
  "card_type": "opportunity",
  "status": "qualified",
  "priority": "high",
  "assigned_to": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@acme.com"
  },
  "created_by": {
    "id": "creator-uuid", 
    "name": "Jane Smith"
  },
  "due_date": "2025-11-15",
  "config": {
    "client_name": "Tech Startup Inc",
    "value": 75000,
    "probability": 75,
    "close_date": "2025-11-30"
  },
  "comments": [
    {
      "id": "comment-uuid",
      "user": {
        "id": "user-uuid",
        "name": "John Doe"  
      },
      "content": "Had a great call with the client today",
      "created_at": "2025-10-04T14:30:00Z"
    }
  ],
  "created_at": "2025-10-05T12:00:00Z",
  "updated_at": "2025-10-05T14:00:00Z"
}
```

## PUT /api/cards/:id
Update card details

**Request**:
```json
{
  "title": "Tech Startup Inc Opportunity",
  "priority": "urgent",
  "assigned_to": "new-user-uuid", 
  "config": {
    "client_name": "Tech Startup Inc",
    "value": 85000,
    "probability": 80,
    "close_date": "2025-11-25"
  }
}
```

**Response** (200):
```json
{
  "id": "card-uuid",
  "title": "Tech Startup Inc Opportunity",
  "priority": "urgent",
  "assigned_to": "new-user-uuid",
  "config": {
    "client_name": "Tech Startup Inc", 
    "value": 85000,
    "probability": 80,
    "close_date": "2025-11-25"
  },
  "updated_at": "2025-10-05T15:00:00Z"
}
```

## PUT /api/cards/:id/status  
Move card to different column

**Request**:
```json
{
  "status": "proposal"
}
```

**Response** (200):
```json
{
  "id": "card-uuid",
  "status": "proposal",
  "updated_at": "2025-10-05T15:30:00Z"
}
```

**Errors**:
- 400: Invalid status (not in studio columns)
- 403: Insufficient permissions

## POST /api/cards/:id/comments
Add comment to card

**Request**:
```json
{
  "content": "Client requested additional features in the proposal"
}
```

**Response** (201):
```json
{
  "id": "comment-uuid",
  "card_id": "card-uuid",
  "user_id": "user-uuid", 
  "content": "Client requested additional features in the proposal",
  "created_at": "2025-10-05T16:00:00Z"
}
```

## PUT /api/comments/:id
Update comment (own comments only)

**Request**:
```json
{
  "content": "Client requested additional premium features in the proposal"
}
```

**Response** (200):
```json
{
  "id": "comment-uuid",
  "content": "Client requested additional premium features in the proposal", 
  "updated_at": "2025-10-05T16:15:00Z",
  "edited_at": "2025-10-05T16:15:00Z"
}
```

**Errors**:
- 403: Can only edit own comments