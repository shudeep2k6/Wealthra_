Add-Type -AssemblyName System.Drawing

function Process-Logo($inputPath, $outputPath, $tolerance = 240) {
    Write-Output "Processing: $inputPath -> $outputPath"
    $orig = [System.Drawing.Bitmap]::FromFile($inputPath)
    $w = $orig.Width
    $h = $orig.Height

    # 1. Find bounding box of content (non-white pixels)
    $minX = $w; $minY = $h; $maxX = 0; $maxY = 0
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $orig.GetPixel($x, $y)
            if ($c.R -lt $tolerance -or $c.G -lt $tolerance -or $c.B -lt $tolerance) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    # Add small 4px padding
    $pad = 4
    $cropX = [Math]::Max(0, $minX - $pad)
    $cropY = [Math]::Max(0, $minY - $pad)
    $cropW = [Math]::Min($w - $cropX, ($maxX - $minX) + ($pad * 2))
    $cropH = [Math]::Min($h - $cropY, ($maxY - $minY) + ($pad * 2))

    Write-Output "Cropping: X=$cropX, Y=$cropY, W=$cropW, H=$cropH (Original $w x $h)"

    $cropped = new-object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $cropH; $y++) {
        for ($x = 0; $x -lt $cropW; $x++) {
            $origPixel = $orig.GetPixel($cropX + $x, $cropY + $y)
            $r = [int]$origPixel.R
            $g = [int]$origPixel.G
            $b = [int]$origPixel.B
            
            # Check lightness
            $brightness = ($r + $g + $b) / 3.0
            if ($brightness -ge 248) {
                # Pure background -> 100% transparent
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($brightness -ge 220) {
                # Smooth edge anti-aliasing
                $alpha = [int]((248 - $brightness) / (248 - 220) * 255)
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
            } else {
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
            }
        }
    }

    $orig.Dispose()
    if (Test-Path $outputPath) { Remove-Item $outputPath -Force }
    $cropped.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "Successfully saved: $outputPath"
}

# 1. Process 3rd image (W icon) for favicon
$thirdImage = "C:\Users\Shudeep\.gemini\antigravity-ide\brain\529633df-ecd3-4de0-8a5c-372d4740d331\.user_uploaded\media_1788457873516.png"
$faviconOut = "c:\Users\Shudeep\Desktop\Wealthra - Copy\public\favicon.png"
Process-Logo $thirdImage $faviconOut 240

# 2. Process 4th image (Full banner logo) for header/sidebar
$fourthImage = "C:\Users\Shudeep\.gemini\antigravity-ide\brain\529633df-ecd3-4de0-8a5c-372d4740d331\.user_uploaded\media_1788457930389.png"
$logoOut1 = "c:\Users\Shudeep\Desktop\Wealthra - Copy\public\wealthra_logo.png"
$logoOut2 = "c:\Users\Shudeep\Desktop\Wealthra - Copy\src\assets\wealthra_logo.png"
Process-Logo $fourthImage $logoOut1 240
Copy-Item $logoOut1 $logoOut2 -Force
Write-Output "All logos processed with transparent background and cropped to content!"
