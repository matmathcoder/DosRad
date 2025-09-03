#!/bin/bash

# Mercurad Backend Setup Script

echo "🚀 Setting up Mercurad Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists."
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations users
python manage.py makemigrations projects
python manage.py migrate

# Create superuser if requested
read -p "🤔 Do you want to create a superuser? (y/n): " create_superuser
if [[ $create_superuser =~ ^[Yy]$ ]]; then
    echo "👤 Creating superuser..."
    python manage.py createsuperuser
fi

echo "✅ Setup complete!"
echo ""
echo "🎉 To start the development server:"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "🌐 The API will be available at: http://localhost:8000/api/"
echo "📖 Check the README.md for detailed usage instructions."
