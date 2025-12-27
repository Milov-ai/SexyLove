Add-Type -AssemblyName System.Drawing

$srcPath = "android\app\src\main\res\drawable\ic_stat_notification.png"
$dstPath = "android\app\src\main\res\drawable-mdpi\ic_stat_notif_small.png"

$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath).Path)
$dst = New-Object System.Drawing.Bitmap 48, 48

$g = [System.Drawing.Graphics]::FromImage($dst)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, 48, 48)

$dst.Save((Join-Path (Get-Location) $dstPath), [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$src.Dispose()
$dst.Dispose()

Write-Host "Icon resized to 48x48 and saved to $dstPath"
