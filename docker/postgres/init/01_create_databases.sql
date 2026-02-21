-- =================================================
-- DUOCAFE - Inicializacion PostgreSQL
-- Crea las 3 bases de datos y usuarios de app
-- Se ejecuta automaticamente al crear el contenedor
-- =================================================

-- Bases de datos por ambiente
CREATE DATABASE duocafe_dev;
CREATE DATABASE duocafe_testing;
CREATE DATABASE duocafe_production;

-- Usuario de aplicacion por ambiente (permisos limitados)
CREATE ROLE duocafe_dev_user     LOGIN PASSWORD 'PLACEHOLDER_DEV_PASS';
CREATE ROLE duocafe_testing_user LOGIN PASSWORD 'PLACEHOLDER_TESTING_PASS';
CREATE ROLE duocafe_prod_user    LOGIN PASSWORD 'PLACEHOLDER_PROD_PASS';

-- Supabase requiere schema auth en cada DB
\c duocafe_dev
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT ALL ON SCHEMA auth, storage, public, extensions TO duocafe_dev_user;
GRANT ALL ON SCHEMA auth, storage, public, extensions TO postgres;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"  WITH SCHEMA extensions;

\c duocafe_testing
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT ALL ON SCHEMA auth, storage, public, extensions TO duocafe_testing_user;
GRANT ALL ON SCHEMA auth, storage, public, extensions TO postgres;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"  WITH SCHEMA extensions;

\c duocafe_production
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT ALL ON SCHEMA auth, storage, public, extensions TO duocafe_prod_user;
GRANT ALL ON SCHEMA auth, storage, public, extensions TO postgres;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"  WITH SCHEMA extensions;
