@echo off
echo ========================================================
echo Building CodeNova AI Backend (Bypassing Maven Plugin)
echo ========================================================
call mvn clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Maven build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo ========================================================
echo Starting CodeNova AI Backend on JVM 25
echo ========================================================
java -jar target/codenova-backend-0.0.1-SNAPSHOT.jar
