@echo off
setlocal enabledelayedexpansion
REM Bootstrap for @modelcontextprotocol/server-postgres with timestamp fix
REM Fix #38: Discovers npx cache path, sets NODE_PATH, launches ESM wrapper
REM
REM Why this script exists:
REM   ESM module resolution ignores NODE_PATH, so pg-server-wrapper.mjs
REM   cannot directly import "pg" from the npx cache. This CMD script
REM   scans the npx cache directory to find the pg package, then sets
REM   NODE_PATH so CJS createRequire can resolve it in the wrapper.
REM
REM Discovery strategy:
REM   require.resolve('pg') does NOT work from node -e under npx -p,
REM   because -e scripts resolve from CWD, not the npx cache.
REM   Instead we use fs.existsSync to scan npm_config_cache/_npx/
REM   for the directory containing node_modules/pg — this uses only
REM   Node.js built-in modules (fs, path) which are always available.
REM
REM Usage: pg-server-start.cmd <postgresql-connection-url>

REM Step 1: Install package (if needed) and discover node_modules path
REM   - npx -y auto-confirms installation
REM   - 2^>nul suppresses npx stderr (install progress, warnings)
REM   - fs.existsSync scans npx cache dirs for pg package
REM   - process.stdout.write outputs ONLY the path (no trailing newline)
for /f "usebackq tokens=*" %%i in (`npx -y -p @modelcontextprotocol/server-postgres node -e "const fs=require('fs'),path=require('path');const base=path.join(process.env.npm_config_cache,'_npx');const dirs=fs.readdirSync(base);for(const d of dirs){if(fs.existsSync(path.join(base,d,'node_modules','pg'))){process.stdout.write(path.join(base,d,'node_modules'));break}}" 2^>nul`) do set "NODE_PATH=%%i"

if not defined NODE_PATH (
  echo [pg-wrapper] ERROR: Could not discover npx cache path 1>&2
  exit /b 1
)

REM Validate NODE_PATH was not polluted by unexpected npx stdout
if not exist "%NODE_PATH%\pg" (
  echo [pg-wrapper] ERROR: NODE_PATH does not contain pg: %NODE_PATH% 1>&2
  exit /b 1
)

REM Step 2: Launch the ESM wrapper with resolved NODE_PATH
REM   %~dp0 resolves to this script's directory (mj-ops/scripts/)
REM   %* forwards all arguments (connection URL) to the wrapper
node "%~dp0pg-server-wrapper.mjs" %*
