#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")" || exit 1
python -m pip install -r requirements.txt
python app.py
