Add-Type -AssemblyName System.Drawing

function Crop-Transparent-Logo($inputPath, $outputPath) {
    Write-Output "Cropping: $inputPath -> $outputPath"
    $orig = [System.Drawing.Bitmap]::FromFile($inputPath)
    $w = $orig.Width
    $h = $orig.Height

    $minX = $w; $minY = $h; $maxX = 0; $maxY = 0
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $orig.GetPixel($x, $y)
            if ($c.A -gt 20) {
                # Check if it's not a near-white background artifact
                if ($c.R -lt 250 -or $c.G -lt 250 -or $c.B -lt 250) {
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }
    }

    Write-Output "Found content bounds: minX=$minX, minY=$minY, maxX=$maxX, maxY=$maxY"
    if ($maxX -le $minX -or $maxY -le $minY) {
        Write-Output "No content found, skipping crop."
        $orig.Dispose()
        return
    }

    $pad = 2
    $cropX = [Math]::Max(0, $minX - $pad)
    $cropY = [Math]::Max(0, $minY - $pad)
    $cropW = [Math]::Min($w - $cropX, ($maxX - $minX) + 1 + ($pad * 2))
    $cropH = [Math]::Min($h - $cropY, ($maxY - $minY) + 1 + ($pad * 2))

    Write-Output "Cropped to size: $cropW x $cropH (from $w x $h)"

    $cropped = new-object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($cropped)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $destRect = new-object System.Drawing.Rectangle 0, 0, $cropW, $cropH
    $srcRect = new-object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
    $g.DrawImage($orig, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $orig.Dispose()

    if (Test-Path $outputPath) { Remove-Item $outputPath -Force }
    $cropped.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "Saved tightly cropped transparent image: $outputPath"
}

# Process 3rd image for favicon
Crop-Transparent-Logo "C:\Users\Shudeep\.gemini\antigravity-ide\brain\529633df-ecd3-4de0-8a5c-372d4740d331\.user_uploaded\media_1788457873516.png" "c:\Users\Shudeep\Desktop\Wealthra - Copy\public\favicon.png"

# Process 4th image for brand logo
Crop-Transparent-Logo "C:\Users\Shudeep\.gemini\antigravity-ide\brain\529633df-ecd3-4de0-8a5c-372d4740d331\.user_uploaded\media_1788457930389.png" "c:\Users\Shudeep\Desktop\Wealthra - Copy\public\wealthra_logo.png"
Copy-Item "c:\Users\Shudeep\Desktop\Wealthra - Copy\public\wealthra_logo.png" "c:\Users\Shudeep\Desktop\Wealthra - Copy\src\assets\wealthra_logo.png" -Force
