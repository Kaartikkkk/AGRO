-- AgroSmart: Master Relational Schema (PostgreSQL)
-- v1.2: Multi-Land Architecture Enabled

-- 1. EXTENSIONS (Ensures UUID support)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Secure Authentication)
CREATE TABLE IF NOT EXISTS "Users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phoneNumber" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. FARMS TABLE (Multi-Plot Land Management)
CREATE TABLE IF NOT EXISTS "Farms" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "farmName" VARCHAR(255) NOT NULL DEFAULT 'My Farm',
    "state" VARCHAR(255),
    "cityVillage" VARCHAR(255),
    "location" VARCHAR(255),
    "acres" FLOAT DEFAULT 0,
    "experienceYears" INTEGER DEFAULT 0,
    "cropType" VARCHAR(255) DEFAULT 'Wheat',
    "soilType" VARCHAR(255) DEFAULT 'Alluvial',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. REMINDERS TABLE (Agricultural Tasks)
CREATE TABLE IF NOT EXISTS "Reminders" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP WITH TIME ZONE,
    "completed" BOOLEAN DEFAULT FALSE,
    "type" VARCHAR(255) DEFAULT 'Task',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES (Optimized for high-speed lookups)
CREATE INDEX IF NOT EXISTS "idx_farms_user" ON "Farms"("userId");
CREATE INDEX IF NOT EXISTS "idx_reminders_user" ON "Reminders"("userId");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "Users"("email");
