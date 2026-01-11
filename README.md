# Novel Website

This is a full-stack web application designed for authors to upload and manage their written works, and for readers to discover and read novels online. The platform provides user authentication, chapter management, and a responsive user interface.

## Features

**Backend (API)**
*   User authentication (registration, login, logout) with JWT.
*   Secure password handling with `bcryptjs`.
*   CRUD operations for works (novels) and chapters.
*   File upload functionality for chapter content (if applicable, details to be confirmed).
*   API rate limiting for security.
*   Database integration with MongoDB using Mongoose.
*   Type-safe development with TypeScript.

**Frontend (Client)**
*   Responsive user interface built with React.
*   Modern and intuitive design using Material UI.
*   Client-side routing with React Router DOM.
*   User authentication flows.
*   Pages for displaying works, reading chapters, and managing author content.
*   API integration using Axios.
*   Type-safe development with TypeScript.

## Technologies Used

### Backend
*   **Node.js**: Runtime environment for executing JavaScript and TypeScript (via transpilation) on the server.
*   **Express.js**: Web application framework.
*   **TypeScript**: Statically typed superset of JavaScript.
*   **MongoDB**: NoSQL database.
*   **Mongoose**: MongoDB object data modeling (ODM).
*   **bcryptjs**: Password hashing library.
*   **jsonwebtoken**: JSON Web Token implementation for authentication.
*   **multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.
*   **express-rate-limit**: Basic rate-limiting middleware.
*   **dotenv**: Loads environment variables from a `.env` file.
*   **nodemon**: Utility that monitors for changes in your source and automatically restarts your server.
*   **tsx**: Seamlessly runs TypeScript files directly in Node.js.

### Frontend
*   **React**: JavaScript library for building user interfaces.
*   **Material UI**: React components for faster and easier web development.
*   **Axios**: Promise-based HTTP client.
*   **React Router DOM**: Declarative routing for React.
*   **TypeScript**: Statically typed superset of JavaScript.
*   **Vite**: Next Generation Frontend Tooling.
*   **ESLint**: Pluggable JavaScript linter.

## Setup and Installation

### Prerequisites
*   Node.js (LTS version recommended)
*   npm or yarn
*   MongoDB instance (local or cloud-hosted)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/novel-website.git
cd novel-website
```

### 2. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
# or
yarn install
```

Create a `.env` file in the `backend` directory with the following content:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
Replace `your_mongodb_connection_string` with your MongoDB connection string (e.g., `mongodb://localhost:27017/novel-website`) and `your_jwt_secret` with a strong, random string.

### 3. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
# or
yarn install
```

Create a `.env` file in the `frontend` directory with the following content:
```
VITE_API_BASE_URL=http://localhost:5000/api
```
Adjust the `VITE_API_BASE_URL` if your backend runs on a different port or host.

## Running the Application

### 1. Start the Backend

Navigate back to the `backend` directory:
```bash
cd backend
```

Start the backend server in development mode:
```bash
npm run dev
```
The backend API will be available at `http://localhost:5000/api` (or your configured port).

To build and start the backend in production mode:
```bash
npm run build
npm start
```

### 2. Start the Frontend

Navigate to the `frontend` directory:
```bash
cd ../frontend
```

Start the frontend development server:
```bash
npm run dev
```
The frontend application will typically open in your browser at `http://localhost:5173` (or another available port).

## Available Scripts

### Backend (`backend/package.json`)
*   `npm run build`: Compiles TypeScript to JavaScript.
*   `npm start`: Starts the compiled Node.js server.
*   `npm run dev`: Starts the Node.js server with `nodemon` for development (auto-restarts on file changes).
*   `npm run seed`: (If applicable) Runs database seeding scripts.

### Frontend (`frontend/package.json`)
*   `npm run dev`: Starts the Vite development server.
*   `npm run build`: Builds the project for production.
*   `npm run lint`: Lints the project files.
*   `npm run preview`: Serves the production build locally.

## Contributing
Contributions are welcome! Please feel free to open issues or submit pull requests.

## License
[Specify your license here, e.g., MIT, Apache 2.0, etc.]
