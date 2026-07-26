@echo off
REM DanForge — ежемесячное обновление отзывов для всех клиентов
cd /d "%~dp0"
python get_reviews.py --batch-all -u --no-playwright >> scheduler.log 2>&1
