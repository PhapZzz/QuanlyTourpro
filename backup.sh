#!/bin/bash
# ==============================================
# TourPro Database Backup & Restore Script
# ==============================================

DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="tourpro_db"
DB_USER="root"
DB_PASS="your_password"
BACKUP_DIR="/var/backups/tourpro"
LOG_FILE="/var/log/tourpro_backup.log"
S3_BUCKET="s3://your-bucket/tourpro-backups"   # optional: AWS S3

# ---- Create backup directory ----
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/tourpro_${TIMESTAMP}.sql.gz"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

# ===================== BACKUP =====================
backup() {
    log "Starting backup: $BACKUP_FILE"
    mysqldump \
        -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        "$DB_NAME" | gzip > "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
        log "Backup successful. Size: $SIZE"

        # Upload to S3 (optional)
        if command -v aws &>/dev/null; then
            aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/" && log "Uploaded to S3"
        fi

        # Keep only last 30 days
        find "$BACKUP_DIR" -name "tourpro_*.sql.gz" -mtime +30 -delete
        log "Old backups cleaned (>30 days)"
    else
        log "ERROR: Backup failed!"
        exit 1
    fi
}

# ===================== RESTORE =====================
restore() {
    if [ -z "$1" ]; then
        echo "Usage: $0 restore <backup_file.sql.gz>"
        exit 1
    fi

    RESTORE_FILE="$1"
    log "Starting restore from: $RESTORE_FILE"

    # Confirm
    read -p "WARNING: This will overwrite $DB_NAME. Continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then log "Restore cancelled"; exit 0; fi

    gunzip < "$RESTORE_FILE" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME"
    if [ $? -eq 0 ]; then log "Restore successful from $RESTORE_FILE"
    else log "ERROR: Restore failed!"; exit 1; fi
}

# ===================== LIST =====================
list_backups() {
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/tourpro_*.sql.gz 2>/dev/null || echo "No backups found"
}

case "$1" in
    backup)  backup ;;
    restore) restore "$2" ;;
    list)    list_backups ;;
    *)       echo "Usage: $0 {backup|restore <file>|list}" ;;
esac
