# Список файлов для обновления
$files = @(
    "src\components\doctor\DoctorEMRFormRegister.tsx",
    "src\components\doctor\DoctorPatientList.tsx",
    "src\components\doctor\DoctorRecommendationList.tsx",
    "src\components\nurse\PatientDetails.tsx",
    "src\components\nurse\PatientFormRegister.tsx",
    "src\components\nurse\PatientUpdateForm.tsx",
    "src\components\nurse\PatientList.tsx",
    "src\components\nurse\EMRFormRegister.tsx",
    "src\components\nurse\EMRUpdateForm.tsx",
    "src\components\nurse\VASFormRegister.tsx",
    "src\components\nurse\GenerateRecommendationForm.tsx",
    "src\components\nurse\RecommendationDetails.tsx",
    "src\components\admin\AdminDashboard.tsx",
    "src\components\admin\CreatePerson.tsx",
    "src\components\admin\PersonsList.tsx",
    "src\components\anesthesiologist\AnesthesiologistDashboard.tsx",
    "src\components\person_login\ChangeCredentials.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Проверяем, не добавлено ли уже
        if ($content -notmatch "PageNavigation") {
            Write-Host "Processing: $file"
            
            # Добавляем импорт PageNavigation
            if ($content -match '(import\s+\{[^}]+\}\s+from\s+["\']\.\.\/ui["\'];?)') {
                $importLine = $matches[1]
                if ($importLine -notmatch "PageNavigation") {
                    $newImportLine = $importLine -replace '\}', ', PageNavigation}'
                    $content = $content -replace [regex]::Escape($importLine), $newImportLine
                }
            }
            
            # Добавляем <PageNavigation /> перед последним </div>
            $content = $content -replace '(\s+)(</div>\s+\);\s+\};\s+export default)', "`$1<PageNavigation />`n`$1`$2"
            
            Set-Content $fullPath $content -NoNewline
            Write-Host "Updated: $file" -ForegroundColor Green
        } else {
            Write-Host "Skipped (already has PageNavigation): $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
