#!/bin/sh

# Remove .DS_Store
find . -name ".DS_Store" -type f -delete

# Remove Python compiled files
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -type f -delete

# Remove IDE files (optional)
rm -rf .idea/

echo "clean up successfull"