Get-ChildItem -Filter *.txt | ForEach-Object {
    $filePath = $_.FullName
    $validLines = @()

    foreach ($line in Get-Content $filePath) {
        if ($line -match '^[A-Za-z0-9!@#\$%\^&\*\(\) ]*$') {
            $validLines += $line
        }
    }

    Set-Content -Path $filePath -Value $validLines
}
