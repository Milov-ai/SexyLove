# Resize all identity icons to 48x48 for notifications
Add-Type -AssemblyName System.Drawing

$identities = @(
    "azulinaa",
    "dramaa",
    "hohoho",
    "kisskiss",
    "muaah",
    "naaam",
    "oops",
    "pide_un_deseo",
    "plop",
    "shhh",
    "tamuu",
    "toxica",
    "uuuf",
    "wow",
    "xoxo"
)

$srcFolder = "android\app\src\main\res\drawable"
$dstFolder = "android\app\src\main\res\drawable-mdpi"

# Ensure destination folder exists
if (-not (Test-Path $dstFolder)) {
    New-Item -ItemType Directory -Path $dstFolder -Force
}

foreach ($identity in $identities) {
    $srcPath = "$srcFolder\ic_launcher_$identity.png"
    $dstPath = "$dstFolder\ic_notif_$identity.png"
    
    if (Test-Path $srcPath) {
        try {
            $src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath).Path)
            $dst = New-Object System.Drawing.Bitmap 48, 48
            
            $g = [System.Drawing.Graphics]::FromImage($dst)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($src, 0, 0, 48, 48)
            
            $fullDstPath = Join-Path (Get-Location) $dstPath
            $dst.Save($fullDstPath, [System.Drawing.Imaging.ImageFormat]::Png)
            
            $g.Dispose()
            $src.Dispose()
            $dst.Dispose()
            
            Write-Host "Created: ic_notif_$identity.png"
        } catch {
            Write-Host "Error processing $identity : $_"
        }
    } else {
        Write-Host "Not found: $srcPath"
    }
}

Write-Host "`nAll notification icons created in $dstFolder"
