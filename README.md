# Crypto Analytics Dashboard

A full-stack web application for tracking and analyzing cryptocurrency data in real-time.

## Features

- Real-time cryptocurrency price tracking
- Historical price data visualization
- Market cap and volume analytics
- Portfolio tracking and management
- Price alerts and notifications
- Responsive design for desktop and mobile
- Interactive charts and graphs
- API integration with major crypto exchanges

## Tech Stack

### Frontend
- React.js
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls
- SWR for data fetching
- Zustand for state management

### Backend
- FastAPI (Python)
- MongoDB Atlas for database
- Motor for async MongoDB operations
- JWT for authentication
- Python-dotenv for environment management

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB Atlas account
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crypto-analytics-dashboard
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On Unix or MacOS
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
MONGO_URL=your_mongodb_atlas_connection_string
DB_NAME=crypto_analytics
```

5. Start the backend server:
```bash
python server.py
```

The backend server will run on http://localhost:8000

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Cryptocurrency Data
- GET `/api/crypto/prices` - Get current prices
- GET `/api/crypto/history` - Get historical data
- GET `/api/crypto/market-cap` - Get market cap data

### Portfolio
- GET `/api/portfolio` - Get user portfolio
- POST `/api/portfolio` - Add to portfolio
- PUT `/api/portfolio` - Update portfolio
- DELETE `/api/portfolio` - Remove from portfolio

## Environment Variables

### Backend (.env)
```
MONGO_URL=your_mongodb_atlas_connection_string
DB_NAME=crypto_analytics
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, email [kalpsenghani0601@gmail.com] or open an issue in the repository.
