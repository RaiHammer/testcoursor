@echo off
cd /d "%~dp0"
python gui_ctk.py
if errorlevel 1 pause
