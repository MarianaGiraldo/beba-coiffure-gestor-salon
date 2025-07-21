# Database Connection Monitoring Guide

## Overview
This guide explains how to monitor and track database connections in the salon management system. The system now includes comprehensive logging for all database operations and connection management.

## Features Implemented

### 1. Connection Tracking
- **Per-user connections**: Each user gets their own MySQL connection with appropriate role-based permissions
- **Connection duration tracking**: Track how long each connection has been active
- **Operation logging**: Log all database operations with connection type information

### 2. Logging System
The system logs the following information:

#### Connection Events
- User login with connection establishment
- User logout with connection cleanup
- Connection creation and destruction
- Connection pool status

#### Database Operations
- Which connection type is being used (admin vs user-specific)
- Operation details and timing
- User context for each operation

### 3. API Endpoints for Monitoring

#### Get Connection Information
```
GET /api/auth/connections
Authorization: Bearer <jwt_token>
```

This endpoint returns:
- List of active user connections
- Connection durations
- Connection status information

## How to Monitor Connections

### 1. Server Logs
The application logs detailed connection information to the console:

```
[CONNECTION] Connection established for user: user@example.com with role: rol_cliente (Duration: 5m30s)
[CONNECTION] Active connections: 3
[CONNECTION] Connection closed for user: user@example.com (Duration: 15m45s)
[DATABASE] Operation: BuscarClientePorID, Connection: user-specific (user@example.com), Duration: 25ms
```

### 2. API Monitoring
Use the `/api/auth/connections` endpoint to get real-time connection information:

```json
{
  "success": true,
  "data": {
    "active_connections": 3,
    "connections": [
      {
        "user_email": "user@example.com",
        "connection_time": "2024-01-15T10:30:00Z",
        "duration": "15m30s",
        "role": "rol_cliente"
      }
    ]
  }
}
```

## Connection Flow

### User Login Process
1. User submits credentials
2. System validates user against admin connection
3. If valid and not admin, creates user-specific MySQL connection
4. JWT token issued with user context
5. Connection logged and tracked

### User Operations
1. Each request uses the user's specific connection
2. Operations are logged with connection context
3. Role-based access control enforced at MySQL level

### User Logout Process
1. User connection is closed
2. Connection duration is logged
3. User removed from active connections pool

## Security Features

### Role-Based Access Control
- **rol_admin**: Full access to all tables and operations
- **rol_empleado**: Limited access based on employee permissions
- **rol_cliente**: Read-only access to own data

### Connection Security
- Each user connection uses MySQL user with limited permissions
- Admin operations use separate admin connection
- Automatic connection cleanup on logout

## Troubleshooting

### Check Connection Status
1. Look for connection logs in server output
2. Use the `/api/auth/connections` endpoint
3. Check for connection leaks or orphaned connections

### Common Issues
- **Connection not found**: User may need to re-login
- **Permission denied**: Check user role assignments
- **Connection timeout**: Check MySQL connection limits

## Example Usage

### Testing Connection Monitoring
1. Start the server
2. Login with a user account
3. Check server logs for connection establishment
4. Perform some operations
5. Call `/api/auth/connections` to see active connections
6. Logout and verify connection cleanup

### Sample Log Output
```
[AUTH] Login attempt for user: cliente@test.com
[CONNECTION] Creating new connection for user: cliente@test.com with role: rol_cliente
[CONNECTION] Connection established for user: cliente@test.com (Duration: 0s)
[CONNECTION] Active connections: 1
[AUTH] Login successful for user: cliente@test.com
[DATABASE] Operation: BuscarClientePorID, Connection: user-specific (cliente@test.com), Duration: 12ms
[AUTH] Logout request received for user: cliente@test.com
[CONNECTION] Closing connection for user: cliente@test.com
[CONNECTION] Connection closed for user: cliente@test.com (Duration: 5m23s)
[CONNECTION] Active connections: 0
```

This comprehensive logging system allows you to:
- Monitor which connections are active
- Track connection usage patterns
- Debug connection-related issues
- Ensure proper resource cleanup
- Verify role-based access control
