#!/bin/bash
echo "Starting AgroSmart AI Server..."
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
if [ -f "venv/bin/python" ]; then
    ./venv/bin/python api/app.py
else
    python api/app.py
fi
