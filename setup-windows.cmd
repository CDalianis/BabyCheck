@echo off
REM BabyCheck - Windows setup helper (run from project root in CMD)

if not exist .env (
  copy .env.example .env
  echo Created .env
) else (
  echo .env already exists
)

if not exist apps\api\.env (
  copy apps\api\.env.example apps\api\.env
  echo Created apps\api\.env
) else (
  echo apps\api\.env already exists
)

echo.
echo Next steps:
echo   1. Install PostgreSQL OR Docker Desktop (see README)
echo   2. npm run db:migrate
echo   3. npm run dev
echo.
