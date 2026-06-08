# AgroSmart: PostgreSQL Database Architecture 🗄️

This directory contains the structural definitions and setup guides for the **AgroSmart** full-stack ecosystem. The platform uses **PostgreSQL** with **Sequelize ORM** for high-performance, relational data management.

### 🏛️ Data Schema Snapshot (v1.2)
- **Users**: Authentication and secure profile data (Bcrypt + JWT).
- **Farms**: Multi-land plot management with 1-to-Many relationship (User -> Farms).
- **Reminders**: Time-series agriculture tasks and alerts.

### 🛠️ Local Setup Instructions
1. **Ensure PostgreSQL is running**:
   - `pg_isready` (Terminal check)
2. **Create the local database**:
   - `psql -U postgres -c "CREATE DATABASE agrosmart;"`
3. **Configure the Environment**:
   - Update `agrosmart-backend/.env` with your credentials:
     ```env
     DB_NAME=agrosmart
     DB_USER=your_username
     DB_PASS=your_password
     DB_HOST=localhost
     DB_PORT=5432
     ```
4. **Syncing Models**:
   - The backend is configured with `{ alter: true }`, meaning the database will automatically update its schema to match the `src/models/*.js` files whenever you restart the server.

### 🛡️ Reliability Features
- **UUIDs**: All primary keys (ID) use `UUIDV4` for global uniqueness and security.
- **Relational Integrity**: Foreign keys (`userId`) ensure that farm plots and reminders are strictly linked to their owners.
- **Data Safety**: All sensitive fields (Passwords) are hashed via `beforeCreate` hooks.
