# Mercurad Backend API

A Django REST API backend for the Mercurad 3D scene management system. This backend provides user authentication, project management, and complete scene data persistence.

## Features

### 🔐 Authentication System
- **User Registration**: Email-based registration with password validation
- **User Login**: Token-based authentication
- **Profile Management**: Update user profiles, change passwords
- **Session Management**: Automatic token handling

### 📁 Project Management
- **Project CRUD**: Create, read, update, delete projects
- **Project Sharing**: Public/private project visibility
- **Project Duplication**: Clone existing projects
- **User Isolation**: Users can only access their own projects

### 🎨 Scene Data Storage
- **Complete Scene State**: Save all scene configuration
- **Camera Settings**: Position, rotation, type, FOV, near/far planes
- **Lighting Configuration**: Ambient and directional light settings
- **Grid Settings**: Size, divisions, floor constraints
- **3D Objects**: Geometries with positions, rotations, scales
- **Materials**: Compositions with densities and elements
- **Radiation Spectra**: Line and group spectra with isotopes
- **Volumes**: Complete volume definitions linking geometries, compositions, and spectra
- **Scene History**: Undo/redo functionality with action tracking
- **CSG Operations**: Constructive Solid Geometry operations

## Database Models

### User Management
- `User`: Custom user model with email authentication
- Profile fields: bio, avatar, date of birth, verification status

### Project Structure
- `Project`: Main project container
- `SceneConfiguration`: Camera, lighting, grid settings
- `Geometry`: 3D objects (cubes, spheres, cylinders, cones)
- `Composition`: Material compositions with elements
- `Spectrum`: Radiation spectra (line/group)
- `Volume`: Links geometry, composition, and spectrum
- `SceneHistory`: Undo/redo state snapshots
- `CSGOperation`: Constructive Solid Geometry operations

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /register/` - User registration
- `POST /login/` - User login
- `POST /logout/` - User logout
- `GET /status/` - Check authentication status
- `GET /profile/` - Get user profile
- `PUT /update/` - Update user profile
- `POST /change-password/` - Change password

### Projects (`/api/projects/`)
- `GET /` - List user's projects
- `POST /` - Create new project
- `GET /public/` - List public projects
- `GET /{id}/` - Get project details
- `PUT /{id}/` - Update project
- `DELETE /{id}/` - Delete project
- `POST /{id}/duplicate/` - Duplicate project

### Scene Configuration (`/api/projects/{id}/scene-config/`)
- `GET /` - Get scene configuration
- `PUT /` - Update scene configuration

### Geometries (`/api/projects/{id}/geometries/`)
- `GET /` - List geometries
- `POST /` - Create geometry
- `GET /{id}/` - Get geometry
- `PUT /{id}/` - Update geometry
- `DELETE /{id}/` - Delete geometry

### Compositions (`/api/projects/{id}/compositions/`)
- `GET /` - List compositions
- `POST /` - Create composition
- `GET /{id}/` - Get composition
- `PUT /{id}/` - Update composition
- `DELETE /{id}/` - Delete composition

### Spectra (`/api/projects/{id}/spectra/`)
- `GET /` - List spectra
- `POST /` - Create spectrum
- `GET /{id}/` - Get spectrum
- `PUT /{id}/` - Update spectrum
- `DELETE /{id}/` - Delete spectrum

### Volumes (`/api/projects/{id}/volumes/`)
- `GET /` - List volumes
- `POST /create/` - Create volume with nested data
- `GET /{id}/` - Get volume
- `PUT /{id}/` - Update volume
- `DELETE /{id}/` - Delete volume

### Scene History (`/api/projects/{id}/history/`)
- `GET /` - List scene history

### CSG Operations (`/api/projects/{id}/csg-operations/`)
- `GET /` - List CSG operations
- `POST /` - Create CSG operation

### Complete Scene (`/api/projects/`)
- `POST /save-complete-scene/` - Save complete scene data
- `GET /{id}/load-complete-scene/` - Load complete scene data

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip
- virtualenv (recommended)

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

### Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Usage Examples

### User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### User Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Create Project
```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "A test project for 3D scene management"
  }'
```

### Save Complete Scene
```bash
curl -X POST http://localhost:8000/api/projects/save-complete-scene/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "project": {
      "name": "Complete Scene Project",
      "description": "Project with full scene data"
    },
    "scene_config": {
      "camera_position": {"x": 0, "y": 5, "z": 10},
      "camera_rotation": {"x": 0, "y": 0, "z": 0},
      "camera_type": "perspective",
      "camera_fov": 75.0
    },
    "geometries": [
      {
        "name": "Test Cube",
        "geometry_type": "cube",
        "position": {"x": 0, "y": 0, "z": 0},
        "rotation": {"x": 0, "y": 0, "z": 0},
        "scale": {"x": 1, "y": 1, "z": 1},
        "color": "#888888"
      }
    ],
    "compositions": [],
    "spectra": [],
    "volumes": []
  }'
```

## Frontend Integration

The frontend can use the provided `apiService` to interact with the backend:

```javascript
import apiService from './services/api';

// Login
const loginResponse = await apiService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Save scene
const sceneData = apiService.convertSceneToBackendFormat(frontendSceneData);
const saveResponse = await apiService.saveCompleteScene(sceneData);

// Load scene
const backendData = await apiService.loadCompleteScene(projectId);
const frontendData = apiService.convertBackendToSceneFormat(backendData);
```

## Development

### Running Tests
```bash
python manage.py test
```

### Code Formatting
```bash
pip install black
black .
```

### Database Reset
```bash
python manage.py flush
```

## Production Deployment

1. **Set environment variables**
   ```bash
   export DEBUG=False
   export SECRET_KEY=your-production-secret-key
   export DATABASE_URL=postgresql://user:pass@localhost/dbname
   ```

2. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

3. **Use production server**
   ```bash
   pip install gunicorn
   gunicorn config.wsgi:application
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
