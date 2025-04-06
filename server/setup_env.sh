#!/bin/bash

# Create virtual environment
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# Upgrade pip and install packages
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Virtual environment set up and Django installed!"
