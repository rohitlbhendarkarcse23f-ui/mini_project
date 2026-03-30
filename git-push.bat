@echo off
echo ========================================
echo Pushing to GitHub Repository
echo ========================================
echo.

REM Add all changes
echo Adding all changes...
git add .
echo.

REM Commit with message
echo Committing changes...
git commit -m "Update: Added manual marksheet entry, SGPA calculation, and comprehensive code comments"
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Push completed successfully!
echo ========================================
pause
