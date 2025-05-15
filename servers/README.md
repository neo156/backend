# QuizFlip - Backend API

This is the backend API for the QuizFlip application, a flashcard and quiz app built with MongoDB, Express, and Node.js.

## Setup

1. Navigate to the server directory

```
cd server
```

2. Install dependencies

```
npm install
```

3. Create a `.env` file with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Run the server

```
npm run server
```

## Available API Endpoints

### Authentication

- `POST /api/users` - Register a new user
- `POST /api/auth` - Login a user
- `GET /api/auth` - Get logged in user

### Categories

- `GET /api/categories` - Get all user's categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Flashcards

- `GET /api/flashcards` - Get all user's flashcards
- `GET /api/flashcards/category/:categoryId` - Get flashcards by category
- `POST /api/flashcards` - Create a new flashcard
- `PUT /api/flashcards/:id` - Update a flashcard
- `DELETE /api/flashcards/:id` - Delete a flashcard

### Quizzes

- `GET /api/quizzes` - Get all user's quizzes
- `GET /api/quizzes/:id` - Get a specific quiz
- `GET /api/quizzes/category/:categoryId` - Get quizzes by category
- `POST /api/quizzes` - Create a new quiz
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Delete a quiz
