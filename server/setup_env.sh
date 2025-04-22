#!/bin/bash

# Clear any existing virtual environment
rm -rf .venv

# Create virtual environment
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# Upgrade pip and install packages
pip install --upgrade pip
pip install --no-cache-dir -r requirements.txt

echo "✅ Virtual environment set up and Django installed!"