Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("C:\Users\Shudeep\.gemini\antigravity-ide\brain\529633df-ecd3-4de0-8a5c-372d4740d331\.user_uploaded\media_1788457930389.png")
$c = $b.GetPixel(0, 0)
Write-Output "Pixel 0,0: R=$($c.R) G=$($c.G) B=$($c.B) A=$($c.A)"
$c2 = $b.GetPixel([int]($b.Width/2), [int]($b.Height/2))
Write-Output "Center Pixel: R=$($c2.R) G=$($c2.G) B=$($c2.B) A=$($c2.A)"
$b.Dispose()
