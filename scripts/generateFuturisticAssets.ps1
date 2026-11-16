Add-Type -AssemblyName System.Drawing

# -----------------------------------------------------------------------------
# 1. GENERATE FUTURISTIC LOGO / ICON (512x512)
# -----------------------------------------------------------------------------
$iconSize = 512
$iconBmp = New-Object System.Drawing.Bitmap($iconSize, $iconSize)
$g = [System.Drawing.Graphics]::FromImage($iconBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Background dark gradient
$rect = New-Object System.Drawing.Rectangle(0, 0, $iconSize, $iconSize)
$p1 = New-Object System.Drawing.Point(0, 0)
$p2 = New-Object System.Drawing.Point($iconSize, $iconSize)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($p1, $p2, [System.Drawing.Color]::FromArgb(255, 6, 12, 28), [System.Drawing.Color]::FromArgb(255, 2, 4, 10))
$g.FillRectangle($bgBrush, $rect)

# Draw subtle cyber grid
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 0, 240, 255), 1)
for ($i = 0; $i -lt $iconSize; $i += 32) {
    $g.DrawLine($gridPen, $i, 0, $i, $iconSize)
    $g.DrawLine($gridPen, 0, $i, $iconSize, $i)
}

# Outer HUD Corner Brackets
$hudPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 0, 240, 255), 3)
$bLen = 40
# Top-Left
$g.DrawLine($hudPen, 24, 24, 24 + $bLen, 24)
$g.DrawLine($hudPen, 24, 24, 24, 24 + $bLen)
# Top-Right
$g.DrawLine($hudPen, $iconSize - 24, 24, $iconSize - 24 - $bLen, 24)
$g.DrawLine($hudPen, $iconSize - 24, 24, $iconSize - 24, 24 + $bLen)
# Bottom-Left
$g.DrawLine($hudPen, 24, $iconSize - 24, 24 + $bLen, $iconSize - 24)
$g.DrawLine($hudPen, 24, $iconSize - 24, 24, $iconSize - 24 - $bLen)
# Bottom-Right
$g.DrawLine($hudPen, $iconSize - 24, $iconSize - 24, $iconSize - 24 - $bLen, $iconSize - 24)
$g.DrawLine($hudPen, $iconSize - 24, $iconSize - 24, $iconSize - 24, $iconSize - 24 - $bLen)

# Faceted Cyber Shield
[float]$cx = [float]($iconSize / 2)
[float]$cy = [float]($iconSize / 2 - 15)

function Create-ShieldPoints([float]$scale, [float]$offsetY) {
    [System.Drawing.PointF[]]$pts = @(
        (New-Object System.Drawing.PointF($cx, ($cy - (165.0 * $scale) + $offsetY))),
        (New-Object System.Drawing.PointF(($cx + (140.0 * $scale)), ($cy - (115.0 * $scale) + $offsetY))),
        (New-Object System.Drawing.PointF(($cx + (140.0 * $scale)), ($cy + (35.0 * $scale) + $offsetY))),
        (New-Object System.Drawing.PointF($cx, ($cy + (185.0 * $scale) + $offsetY))),
        (New-Object System.Drawing.PointF(($cx - (140.0 * $scale)), ($cy + (35.0 * $scale) + $offsetY))),
        (New-Object System.Drawing.PointF(($cx - (140.0 * $scale)), ($cy - (115.0 * $scale) + $offsetY)))
    )
    return ,$pts
}

# Outer Aura
for ($glow = 5; $glow -ge 1; $glow--) {
    [System.Drawing.PointF[]]$ptsGlow = Create-ShieldPoints (1.0 + $glow * 0.04) 0.0
    $alpha = [int](35 / $glow)
    $glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, 0, 240, 255), ($glow * 6))
    $g.DrawPolygon($glowPen, $ptsGlow)
}

# Main Shield Body
[System.Drawing.PointF[]]$ptsMain = Create-ShieldPoints 1.0 0.0
$sp1 = New-Object System.Drawing.PointF(($cx - 140.0), ($cy - 165.0))
$sp2 = New-Object System.Drawing.PointF(($cx + 140.0), ($cy + 185.0))
$shieldBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($sp1, $sp2, [System.Drawing.Color]::FromArgb(255, 12, 22, 50), [System.Drawing.Color]::FromArgb(255, 5, 8, 22))
$g.FillPolygon($shieldBrush, $ptsMain)

# Inner Shield Body
[System.Drawing.PointF[]]$ptsInner = Create-ShieldPoints 0.88 2.0
$ip1 = New-Object System.Drawing.PointF($cx, ($cy - 145.0))
$ip2 = New-Object System.Drawing.PointF($cx, ($cy + 165.0))
$innerBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($ip1, $ip2, [System.Drawing.Color]::FromArgb(255, 18, 30, 70), [System.Drawing.Color]::FromArgb(255, 8, 14, 34))
$g.FillPolygon($innerBrush, $ptsInner)

# Neon Border Lines
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 240, 255), 4)
$g.DrawPolygon($borderPen, $ptsMain)

$innerBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 160, 0, 255), 2)
$g.DrawPolygon($innerBorderPen, $ptsInner)

# Circuit / Cyber Lines on Shield
$circuitPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 0, 240, 255), 2)
$g.DrawLine($circuitPen, [float]($cx - 80), [float]($cy - 55), [float]($cx - 30), [float]($cy - 55))
$g.DrawLine($circuitPen, [float]($cx - 30), [float]($cy - 55), $cx, [float]($cy - 25))
$g.DrawLine($circuitPen, [float]($cx + 80), [float]($cy - 55), [float]($cx + 30), [float]($cy - 55))
$g.DrawLine($circuitPen, [float]($cx + 30), [float]($cy - 55), $cx, [float]($cy - 25))

$g.DrawLine($circuitPen, [float]($cx - 80), [float]($cy + 55), [float]($cx - 30), [float]($cy + 55))
$g.DrawLine($circuitPen, [float]($cx - 30), [float]($cy + 55), $cx, [float]($cy + 85))
$g.DrawLine($circuitPen, [float]($cx + 80), [float]($cy + 55), [float]($cx + 30), [float]($cy + 55))
$g.DrawLine($circuitPen, [float]($cx + 30), [float]($cy + 55), $cx, [float]($cy + 85))

# Central Holographic Reticle / Radar
$radarPen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 0, 240, 255), 2.5)
$radarPen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 255, 0, 85), 1.8)
$radarPen2.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

$g.DrawEllipse($radarPen1, [float]($cx - 55), [float]($cy - 55), 110.0, 110.0)
$g.DrawEllipse($radarPen2, [float]($cx - 38), [float]($cy - 38), 76.0, 76.0)
$g.DrawEllipse($radarPen1, [float]($cx - 18), [float]($cy - 18), 36.0, 36.0)

# Core Sentinel Glow
$coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 240, 255))
$g.FillEllipse($coreBrush, [float]($cx - 8), [float]($cy - 8), 16.0, 16.0)

$coreWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.FillEllipse($coreWhite, [float]($cx - 3), [float]($cy - 3), 6.0, 6.0)

# Crosshairs
$crossPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 0, 240, 255), 1.8)
$g.DrawLine($crossPen, [float]($cx - 72), $cy, [float]($cx - 20), $cy)
$g.DrawLine($crossPen, [float]($cx + 20), $cy, [float]($cx + 72), $cy)
$g.DrawLine($crossPen, $cx, [float]($cy - 72), $cx, [float]($cy - 20))
$g.DrawLine($crossPen, $cx, [float]($cy + 20), $cx, [float]($cy + 72))

# Bottom labels
$labelFont = New-Object System.Drawing.Font("Arial Black", 14, [System.Drawing.FontStyle]::Bold)
$labelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 240, 255))
$strFormat = New-Object System.Drawing.StringFormat
$strFormat.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("PHANTOMGUARD", $labelFont, $labelBrush, $cx, [float]($iconSize - 60), $strFormat)

$subFont = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 140, 160, 200))
$g.DrawString("// AI HALLUCINATION SENTINEL //", $subFont, $subBrush, $cx, [float]($iconSize - 38), $strFormat)

$iconBmp.Save("assets/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$iconBmp.Dispose()
Write-Output "SUCCESS: Generated assets/icon.png (512x512)"


# -----------------------------------------------------------------------------
# 2. GENERATE FUTURISTIC BANNER (1200x420)
# -----------------------------------------------------------------------------
$bWidth = 1200
$bHeight = 420
$bannerBmp = New-Object System.Drawing.Bitmap($bWidth, $bHeight)
$gb = [System.Drawing.Graphics]::FromImage($bannerBmp)
$gb.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gb.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gb.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Deep Cyber Gradient
$bannerRect = New-Object System.Drawing.Rectangle(0, 0, $bWidth, $bHeight)
$bp1 = New-Object System.Drawing.Point(0, 0)
$bp2 = New-Object System.Drawing.Point($bWidth, $bHeight)
$bgBannerBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bp1,
    $bp2,
    [System.Drawing.Color]::FromArgb(255, 3, 6, 15),
    [System.Drawing.Color]::FromArgb(255, 7, 14, 34)
)
$gb.FillRectangle($bgBannerBrush, $bannerRect)

# Perspective Grid Floor
$pPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 0, 240, 255), 1)
for ($y = 260; $y -lt $bHeight; $y += 24) {
    $gb.DrawLine($pPen, 0, $y, $bWidth, $y)
}
for ($x = 0; $x -lt $bWidth; $x += 60) {
    $gb.DrawLine($pPen, $x, 260, [int]($bWidth / 2 + ($x - $bWidth / 2) * 1.5), $bHeight)
}

# Top Glowing Border
$topGlowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 240, 255), 2.5)
$gb.DrawLine($topGlowPen, 0, 1, $bWidth, 1)

# Tech Accent Corners
$cornerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 0, 240, 255), 3)
$cSize = 40
# TL
$gb.DrawLine($cornerPen, 20, 20, 20 + $cSize, 20)
$gb.DrawLine($cornerPen, 20, 20, 20, 20 + $cSize)
# TR
$gb.DrawLine($cornerPen, $bWidth - 20, 20, $bWidth - 20 - $cSize, 20)
$gb.DrawLine($cornerPen, $bWidth - 20, 20, $bWidth - 20, 20 + $cSize)
# BL
$gb.DrawLine($cornerPen, 20, $bHeight - 20, 20 + $cSize, $bHeight - 20)
$gb.DrawLine($cornerPen, 20, $bHeight - 20, 20, $bHeight - 20 - $cSize)
# BR
$gb.DrawLine($cornerPen, $bWidth - 20, $bHeight - 20, $bWidth - 20 - $cSize, $bHeight - 20)
$gb.DrawLine($cornerPen, $bWidth - 20, $bHeight - 20, $bWidth - 20, $bHeight - 20 - $cSize)

# LEFT SIDE: Giant Holographic Cyber Shield
[float]$scx = 190.0
[float]$scy = 205.0

# Outer radar rings
for ($r = 135; $r -ge 55; $r -= 35) {
    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 0, 240, 255), 1.5)
    $gb.DrawEllipse($ringPen, [float]($scx - $r), [float]($scy - $r), [float]($r * 2), [float]($r * 2))
}

[System.Drawing.PointF[]]$bShieldPts = @(
    (New-Object System.Drawing.PointF($scx, ($scy - 120.0))),
    (New-Object System.Drawing.PointF(($scx + 95.0), ($scy - 85.0))),
    (New-Object System.Drawing.PointF(($scx + 95.0), ($scy + 30.0))),
    (New-Object System.Drawing.PointF($scx, ($scy + 130.0))),
    (New-Object System.Drawing.PointF(($scx - 95.0), ($scy + 30.0))),
    (New-Object System.Drawing.PointF(($scx - 95.0), ($scy - 85.0)))
)

# Glow
for ($gCount = 4; $gCount -ge 1; $gCount--) {
    $gPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb([int](35 / $gCount), 0, 240, 255), ($gCount * 6))
    $gb.DrawPolygon($gPen, $bShieldPts)
}

$bsp1 = New-Object System.Drawing.PointF(($scx - 95.0), ($scy - 120.0))
$bsp2 = New-Object System.Drawing.PointF(($scx + 95.0), ($scy + 130.0))
$bShieldBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bsp1,
    $bsp2,
    [System.Drawing.Color]::FromArgb(255, 14, 25, 55),
    [System.Drawing.Color]::FromArgb(255, 6, 10, 24)
)
$gb.FillPolygon($bShieldBrush, $bShieldPts)

$bBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 240, 255), 3.5)
$gb.DrawPolygon($bBorderPen, $bShieldPts)

# Inner Shield Details
$gb.DrawEllipse($radarPen1, [float]($scx - 40), [float]($scy - 40), 80.0, 80.0)
$gb.DrawEllipse($radarPen2, [float]($scx - 25), [float]($scy - 25), 50.0, 50.0)
$gb.FillEllipse($coreBrush, [float]($scx - 8), [float]($scy - 8), 16.0, 16.0)
$gb.FillEllipse($coreWhite, [float]($scx - 3), [float]($scy - 3), 6.0, 6.0)
$gb.DrawLine($crossPen, [float]($scx - 50), $scy, [float]($scx + 50), $scy)
$gb.DrawLine($crossPen, $scx, [float]($scy - 50), $scx, [float]($scy + 50))

# RIGHT SIDE: Typography & Telemetry HUD
[float]$tx = 350.0

# Telemetry Header Tag
$hudHeaderFont = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Bold)
$hudTagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 0, 240, 255))
$gb.DrawString("// SYSTEM STATUS: ACTIVE TELEMETRY // CYBERNETIC DEFENSE SENTINEL", $hudHeaderFont, $hudTagBrush, $tx, 65.0)

# Giant Title: PHANTOMGUARD
$titleFont = New-Object System.Drawing.Font("Arial Black", 44, [System.Drawing.FontStyle]::Bold)
$tp1 = New-Object System.Drawing.PointF($tx, 85.0)
$tp2 = New-Object System.Drawing.PointF(($tx + 480.0), 85.0)
$titleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $tp1,
    $tp2,
    [System.Drawing.Color]::FromArgb(255, 0, 240, 255),
    [System.Drawing.Color]::FromArgb(255, 170, 60, 255)
)
$gb.DrawString("PHANTOMGUARD", $titleFont, $titleBrush, $tx, 85.0)

# Subtitle
$subTitleFont = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
$subTitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 240, 255))
$gb.DrawString("AI Hallucinated & Malicious Package Sentinel for VS Code", $subTitleFont, $subTitleBrush, $tx, 168.0)

# Body Description
$descFont = New-Object System.Drawing.Font("Segoe UI", 11.5, [System.Drawing.FontStyle]::Regular)
$descBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 160, 185, 220))
$gb.DrawString("Real-time interception of hallucinated dependencies in JavaScript, TypeScript & Python.", $descFont, $descBrush, $tx, 206.0)
$gb.DrawString("Neutralize supply-chain attacks, typosquatting & slopsquatting vectors before execution.", $descFont, $descBrush, $tx, 230.0)

# Futuristic Telemetry Badges
function Draw-CyberBadge($graphics, [float]$bx, [float]$by, $text, $color) {
    $bFont = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
    $bSize = $graphics.MeasureString($text, $bFont)
    $pad = 10.0
    $bw = $bSize.Width + $pad * 2.0
    $bh = 24.0
    
    $bgBrd = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, $color.R, $color.G, $color.B))
    $penBrd = New-Object System.Drawing.Pen($color, 1.2)
    $textBrd = New-Object System.Drawing.SolidBrush($color)
    
    $graphics.FillRectangle($bgBrd, $bx, $by, $bw, $bh)
    $graphics.DrawRectangle($penBrd, $bx, $by, $bw, $bh)
    $graphics.DrawString($text, $bFont, $textBrd, [float]($bx + $pad), [float]($by + 4.0))
    
    return [float]($bw + 10.0)
}

[float]$badgeX = $tx
$badgeX += Draw-CyberBadge $gb $badgeX 278.0 "SHIELD: REAL-TIME ARMED" ([System.Drawing.Color]::FromArgb(255, 0, 255, 102))
$badgeX += Draw-CyberBadge $gb $badgeX 278.0 "NPM & PYPI TELEMETRY" ([System.Drawing.Color]::FromArgb(255, 0, 240, 255))
$badgeX += Draw-CyberBadge $gb $badgeX 278.0 "THREAT MODEL: CWE-1384" ([System.Drawing.Color]::FromArgb(255, 255, 0, 85))
$badgeX += Draw-CyberBadge $gb $badgeX 278.0 "ZERO-LAG LRU CACHE" ([System.Drawing.Color]::FromArgb(255, 255, 170, 0))

# Tech ruler line
$rulePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 0, 240, 255), 1)
$gb.DrawLine($rulePen, $tx, 330.0, [float]($bWidth - 40), 330.0)

$coordFont = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Regular)
$coordBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 100, 130, 160))
$gb.DrawString("PHANTOMGUARD PROTOCOL V1.0 // RECON RADAR: ONLINE // SECURE SUPPLY-CHAIN SENTINEL", $coordFont, $coordBrush, $tx, 342.0)

# Save Banner
$bannerBmp.Save("assets/banner.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gb.Dispose()
$bannerBmp.Dispose()
Write-Output "SUCCESS: Generated assets/banner.png (1200x420)"
