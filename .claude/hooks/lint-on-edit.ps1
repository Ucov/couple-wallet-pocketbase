# PostToolUse hook: run ESLint on couple-wallet after Edit/Write/MultiEdit.
# Only fires when the edited file is inside the project root AND is JS/TS source.
# Output is wrapped in hookSpecificOutput.additionalContext so Claude sees lint results.

$ErrorActionPreference = 'Continue'

try {
    $raw = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }
    $payload = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$filePath = $payload.tool_input.file_path
if (-not $filePath) { $filePath = $payload.tool_response.filePath }
if (-not $filePath) { exit 0 }

$projectRoot = 'c:\Users\unase\.gemini\antigravity\scratch\couple-wallet'

if (-not $filePath.ToLower().StartsWith($projectRoot.ToLower())) { exit 0 }
if ($filePath -notmatch '\.(ts|tsx|js|jsx|mjs|cjs)$') { exit 0 }

Push-Location $projectRoot
try {
    $lintOutput = & npm run lint --silent 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
} catch {
    $lintOutput = "Hook failed to run npm: $_"
    $exitCode = 1
} finally {
    Pop-Location
}

if ($exitCode -ne 0 -and $lintOutput.Trim().Length -gt 0) {
    $result = @{
        hookSpecificOutput = @{
            hookEventName     = 'PostToolUse'
            additionalContext = "ESLint reported issues after editing $filePath`n$lintOutput"
        }
    }
    $result | ConvertTo-Json -Compress -Depth 5
}

exit 0
