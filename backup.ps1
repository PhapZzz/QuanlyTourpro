# ==============================================
# TourPro Database Backup & Restore Script
# For Windows PowerShell
# ==============================================

$DB_HOST = "localhost"
$DB_PORT = "3306"
$DB_NAME = "tourpro_db"
$DB_USER = "root"
$DB_PASS = "your_password"  # Thay đổi mật khẩu ở đây

$BACKUP_DIR = "$PSScriptRoot\backups"
$LOG_FILE = "$PSScriptRoot\backup.log"

# Tạo thư mục backup nếu chưa có
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# ===================== BACKUP =====================
function Backup-Database {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$BACKUP_DIR\tourpro_$timestamp.sql"
    
    Write-Log "Starting backup: $backupFile"
    
    # Sử dụng mysqldump
    $mysqldump = "mysqldump"
    
    # Kiểm tra mysqldump có trong PATH không
    $mysqldumpPath = (Get-Command mysqldump -ErrorAction SilentlyContinue).Source
    if (-not $mysqldumpPath) {
        # Thử đường dẫn mặc định XAMPP
        $xamppPath = "C:\xampp\mysql\bin\mysqldump.exe"
        if (Test-Path $xamppPath) {
            $mysqldump = $xamppPath
        } else {
            Write-Log "ERROR: mysqldump not found. Please install MySQL or add to PATH"
            return
        }
    }
    
    # Thực hiện backup
    $process = Start-Process -FilePath $mysqldump -ArgumentList "-h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS --single-transaction --routines --triggers --events $DB_NAME" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$backupFile"
    
    if ($LASTEXITCODE -eq 0) {
        $size = (Get-Item $backupFile).Length / 1MB
        $sizeStr = "{0:N2} MB" -f $size
        Write-Log "Backup successful. Size: $sizeStr"
        
        # Nén file
        Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip" -Force
        Remove-Item $backupFile -Force
        $backupFile = "$backupFile.zip"
        
        # Xóa backup cũ (>30 ngày)
        Get-ChildItem $BACKUP_DIR -Filter "tourpro_*.sql.zip" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force
        Write-Log "Old backups cleaned (>30 days)"
        
        # Ghi vào database
        try {
            $mysql = "mysql"
            $mysqlPath = (Get-Command mysql -ErrorAction SilentlyContinue).Source
            if (-not $mysqlPath) {
                $xamppMysql = "C:\xampp\mysql\bin\mysql.exe"
                if (Test-Path $xamppMysql) {
                    $mysql = $xamppMysql
                }
            }
            
            $query = "INSERT INTO backup_logs (backup_time, backup_type, file_path, file_size, status, notes) VALUES (NOW(), 'MANUAL', '$($backupFile.Name)', '$sizeStr', 'SUCCESS', 'Manual backup via PowerShell')"
            & $mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS -e $query 2>$null
        } catch {
            Write-Log "Warning: Could not update backup_logs table"
        }
    } else {
        Write-Log "ERROR: Backup failed!"
    }
}

# ===================== RESTORE =====================
function Restore-Database {
    param([string]$FilePath)
    
    if (-not $FilePath) {
        Write-Host "Usage: .\backup.ps1 -Restore <backup_file>"
        return
    }
    
    if (-not (Test-Path $FilePath)) {
        Write-Log "ERROR: File not found: $FilePath"
        return
    }
    
    Write-Log "Starting restore from: $FilePath"
    
    # Xác nhận
    $confirm = Read-Host "WARNING: This will overwrite $DB_NAME. Continue? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Log "Restore cancelled"
        return
    }
    
    # Giải nén tạm
    $tempFile = "$env:TEMP\tourpro_restore.sql"
    Expand-Archive -Path $FilePath -DestinationPath $env:TEMP -Force
    
    # Restore
    $mysql = "mysql"
    $mysqlPath = (Get-Command mysql -ErrorAction SilentlyContinue).Source
    if (-not $mysqlPath) {
        $xamppMysql = "C:\xampp\mysql\bin\mysql.exe"
        if (Test-Path $xamppMysql) {
            $mysql = $xamppMysql
        }
    }
    
    & $mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS $DB_NAME < $tempFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Restore successful from $FilePath"
    } else {
        Write-Log "ERROR: Restore failed!"
    }
    
    # Xóa file tạm
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

# ===================== LIST =====================
function List-Backups {
    Write-Host "Available backups:"
    Get-ChildItem $BACKUP_DIR -Filter "tourpro_*.sql.zip" | Sort-Object LastWriteTime -Descending | ForEach-Object {
        $size = $_.Length / 1MB
        Write-Host "  $($_.Name) - $([math]::Round($size, 2)) MB - $($_.LastWriteTime)"
    }
}

# ===================== MAIN =====================
param(
    [string]$Action,
    [string]$File
)

switch ($Action) {
    "backup"  { Backup-Database }
    "restore" { Restore-Database -FilePath $File }
    "list"    { List-Backups }
    default   {
        Write-Host "TourPro Database Backup & Restore"
        Write-Host "=================================="
        Write-Host "Usage:"
        Write-Host "  .\backup.ps1 -Action backup   - Sao lưu CSDL"
        Write-Host "  .\backup.ps1 -Action restore  -File <file>   - Phục hồi CSDL"
        Write-Host "  .\backup.ps1 -Action list     - Liệt kê các bản backup"
    }
}