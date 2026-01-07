# Database Initialization

This directory contains SQL scripts and database backups that will be automatically executed when the MySQL container starts for the **first time only**.

## How it works

MySQL Docker containers automatically execute any files in `/docker-entrypoint-initdb.d/` when the data directory is empty (first startup). Files are executed in alphabetical order.

## Supported file formats

- `.sql` - SQL scripts
- `.sh` - Shell scripts
- `.sql.gz` - Compressed SQL files

## Usage

1. **Place your backup file here:**
   - If you have a `.sql` backup file, copy it to this directory
   - If you have a `.sql.gz` compressed backup, place it here as-is
   - Rename it if needed (e.g., `backup.sql`, `init.sql`, `01-backup.sql`)

2. **Important notes:**
   - Scripts run **only on first initialization** (when the database is empty)
   - If you need to re-import, you must remove the Docker volume first:
     ```bash
     docker-compose down -v
     docker-compose up -d
     ```
   - Make sure your SQL file includes `CREATE DATABASE IF NOT EXISTS mundo_pirata;` or `USE mundo_pirata;` if needed
   - Or ensure the database name matches `mundo_pirata` as configured in docker-compose.yml

## Example

If your backup file is named `mundo_pirata_backup.sql`, place it here:

```
database/
  ├── README.md
  └── mundo_pirata_backup.sql
```

The container will automatically import it on first startup.

