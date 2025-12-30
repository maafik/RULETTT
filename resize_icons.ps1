Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$inputPath,
        [string]$outputPath,
        [int]$width,
        [int]$height
    )
    
    try {
        $originalImage = [System.Drawing.Image]::FromFile($inputPath)
        $bitmap = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($originalImage, 0, 0, $width, $height)
        
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $bitmap.Dispose()
        $originalImage.Dispose()
        
        Write-Host "Created: $outputPath ($width x $height)"
    }
    catch {
        Write-Host "Error resizing image: $_"
    }
}

# Создаем размеры для splash screen
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/splash_mdpi.png" -width 128 -height 128
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/splash_hdpi.png" -width 192 -height 192
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/splash_xhdpi.png" -width 256 -height 256
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/splash_xxhdpi.png" -width 384 -height 384
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/splash_xxxhdpi.png" -width 512 -height 512

# Создаем размеры для launcher иконок
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/ic_launcher_mdpi.png" -width 48 -height 48
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/ic_launcher_hdpi.png" -width 72 -height 72
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/ic_launcher_xhdpi.png" -width 96 -height 96
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/ic_launcher_xxhdpi.png" -width 144 -height 144
Resize-Image -inputPath "temp_icons/MusicBooking_icon.png" -outputPath "temp_icons/ic_launcher_xxxhdpi.png" -width 192 -height 192

Write-Host "All icons resized successfully!"
