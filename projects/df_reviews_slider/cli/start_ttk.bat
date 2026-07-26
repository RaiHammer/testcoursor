@echo off
REM Legacy ttk GUI (gui.py)
cd /d "%~dp0"
python gui.py
if errorlevel 1 pause
