@echo off
title Work Manager — Alternus
cd /d "%~dp0"

echo Checking dependencies...
pip install -r requirements.txt -q

echo Starting Work Manager...
python src/main.py
pause
