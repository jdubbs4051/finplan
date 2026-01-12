@echo off
REM Build script for Docker image (Windows)

echo Building Financial Forecast Docker image...
docker build -t financial-forecast:latest .

if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo To run the container:
    echo   docker-compose up -d
    echo.
    echo Or use Portainer with docker-compose.portainer.yml
) else (
    echo Build failed!
    exit /b 1
)
