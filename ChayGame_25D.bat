@echo off
title Vo Lam Chibi 2.5D - Khoi Dong Game 2.5D
cd /d "%~dp0"

echo ========================================================
echo   VO LAM CHIBI 2.5D - THU MUC GAME 2.5D DOC LAP
echo ========================================================
echo.
echo Dang khoi dong may chu noi bo cho Game 2.5D...
node server.js
if %errorlevel% neq 0 (
    echo.
    echo [THONG BAO] Khong the chay server Node.js.
    echo Dang mo truc tiep bang trinh duyet...
    start "" "index.html"
)
pause
