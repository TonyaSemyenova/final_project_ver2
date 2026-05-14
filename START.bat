@echo off
echo ========================================
echo   Помощник по подбору мебели
echo ========================================
echo.

echo [1/3] Проверка зависимостей...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Установка зависимостей...
    pip install -r requirements.txt
)

echo.
echo [2/3] Загрузка тестовых данных...
if not exist furniture.db (
    python scripts\load_csv_data.py divany_example.csv
)

echo.
echo [3/3] Запуск сервера...
echo.
echo Backend запускается на http://localhost:5000
echo Frontend откроется автоматически на http://localhost:3000
echo.
echo Для остановки нажмите Ctrl+C
echo.

start cmd /k "cd backend && python app.py"
timeout /t 3 >nul
cd frontend
if not exist node_modules (
    echo Установка npm зависимостей...
    call npm install
)
call npm start
