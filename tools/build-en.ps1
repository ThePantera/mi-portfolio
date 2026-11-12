# Regenera en/index.html (versión en inglés) a partir de index.html.
# Uso, desde la carpeta del proyecto:   powershell -ExecutionPolicy Bypass -File tools\build-en.ps1
# Necesita Microsoft Edge o Google Chrome instalado (se usa en modo headless, sin abrir ventana).
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent

$candidates = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)
$browser = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'No encontré Edge ni Chrome.' }

$url = ([System.Uri](Join-Path $root 'tools\build-en.html')).AbsoluteUri
$tmp = Join-Path $env:TEMP 'build-en-dom.html'
Start-Process -FilePath $browser -Wait -NoNewWindow -RedirectStandardOutput $tmp -ArgumentList @(
  '--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--virtual-time-budget=10000', '--dump-dom', $url
)

$dom = [System.IO.File]::ReadAllText($tmp, [System.Text.Encoding]::UTF8)
Remove-Item $tmp -ErrorAction SilentlyContinue
$m = [regex]::Match($dom, '(?s)<textarea id="o"[^>]*>(.*?)</textarea>')
if (-not $m.Success) { throw 'No se pudo leer la salida del generador.' }
$html = [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value)
if ($html.StartsWith('ERROR')) { throw $html }
if (-not $html.StartsWith('<!DOCTYPE html>')) { throw 'La salida no parece un HTML válido.' }

$outDir = Join-Path $root 'en'
New-Item -ItemType Directory -Force $outDir | Out-Null
$out = Join-Path $outDir 'index.html'
[System.IO.File]::WriteAllText($out, $html, (New-Object System.Text.UTF8Encoding($false)))
"OK: $out ($([math]::Round($html.Length / 1KB)) KB)"
