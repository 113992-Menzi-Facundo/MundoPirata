#!/bin/bash
# Helper script to import MySQL backup
# This script will be executed automatically on first container startup

set -e

echo "Starting database initialization..."

# If you have a compressed backup (.sql.gz), uncomment the following:
# if [ -f "backup.sql.gz" ]; then
#   echo "Importing compressed backup..."
#   gunzip < backup.sql.gz | mysql -u root -p${MYSQL_ROOT_PASSWORD} mundo_pirata
# fi

# If you have a plain SQL backup, it will be automatically imported
# Just make sure your backup file:
# 1. Uses the correct database name (mundo_pirata)
# 2. Or includes: CREATE DATABASE IF NOT EXISTS mundo_pirata;
# 3. Or includes: USE mundo_pirata;

echo "Database initialization complete!"

