#!/usr/bin/env bash
#
# Install dependencies for dump analyzer
# 
# Usage: ./scripts/install-analyzer.sh
#

set -e

echo "📦 Installing Perplexity Analyzer dependencies..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TOOLS_DIR="$PROJECT_ROOT/tools"

# Create venv if not exists
if [ ! -d "$PROJECT_ROOT/.venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv "$PROJECT_ROOT/.venv"
    source "$PROJECT_ROOT/.venv/bin/activate"
    pip install --upgrade pip setuptools wheel
else
    source "$PROJECT_ROOT/.venv/bin/activate"
fi

# Install requirements
echo "📥 Installing Python dependencies..."
pip install -r "$TOOLS_DIR/requirements.txt"

# Make scripts executable
chmod +x "$PROJECT_ROOT/scripts/perplexity-analyze"
chmod +x "$PROJECT_ROOT/scripts/install-analyzer.sh"

echo "✅ Installation complete!"
echo ""
echo "Usage:"
echo "  ./scripts/perplexity-analyze dump.json --analyze"
echo "  pnpm dump:analyze dump.json --analyze-deps"
echo ""
