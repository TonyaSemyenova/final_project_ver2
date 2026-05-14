#!/bin/bash

echo "========================================"
echo "  Помощник по подбору мебели"
echo "========================================"
echo ""

echo "[1/3] Проверка зависимостей..."
if ! pip show flask > /dev/null 2>&1; then
    echo "Установка зависимостей..."
    pip install -r requirements.txt
fi

echo ""
echo "[2/3] Загрузка тестовых данных..."
if [ ! -f furniture.db ]; then
    python scripts/load_csv_data.py divany_example.csv
fi

echo ""
echo "[3/3] Запуск серверов..."
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

# Запуск backend в фоне
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Ждем запуска backend
sleep 3

# Запуск frontend
cd frontend
if [ ! -d node_modules ]; then
    echo "Установка npm зависимостей..."
    npm install
fi
npm start

# При завершении останавливаем backend
kill $BACKEND_PID
