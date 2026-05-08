# Node.js Express & MongoDB Todo API

This is a RESTful API built with Node.js, Express, and MongoDB (via Mongoose). It provides endpoints for user registration (with password hashing) and full CRUD (Create, Read, Update, Delete) operations for a Todo list.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v14 or higher recommended)
* [npm](https://www.npmjs.com/) (usually comes with Node.js)
* [MongoDB](https://www.mongodb.com/) (either running locally or a cloud instance like MongoDB Atlas)

## Installation & Setup

1. **Install Dependencies**
   Open your terminal in the project directory and run:
   ```bash
   npm install
   ```
   *This installs Express, Mongoose, dotenv, bcryptjs, and cors.*

2. **Configure Environment Variables**
   Ensure you have a `.env` file in the root of your project. If you haven't updated it yet, it should look like this:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/vibecoding_db
   ```
   *Note: If you are using MongoDB Atlas, replace the `MONGODB_URI` value with your Atlas connection string.*

3. **Start the Server**
   Run the following command to start the application:
   ```bash
   node server.js
   ```
   You should see console messages indicating the server is running and connected to MongoDB:
   ```
   Server is running on http://localhost:3000
   Connected to MongoDB
   ```

## API Endpoints

The base URL for all endpoints is `http://localhost:3000` (or whichever port you specified in `.env`).

### Users

#### 1. Register a New User
* **URL:** `/api/register`
* **Method:** `POST`
* **Body (JSON):**
  ```json
  {
    "username": "johndoe",
    "password": "mysecurepassword"
  }
  ```
* **Success Response:** `201 Created`
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "64a7b...",
      "username": "johndoe"
    }
  }
  ```
* **Error Responses:** 
  * `400 Bad Request` (Missing fields)
  * `409 Conflict` (Username already exists)

#### 2. Get All Users (For Testing)
* **URL:** `/api/users`
* **Method:** `GET`
* **Success Response:** `200 OK` (Returns an array of users, excluding passwords)

---

### Todos

#### 1. Add a New Todo
* **URL:** `/api/todos`
* **Method:** `POST`
* **Body (JSON):**
  ```json
  {
    "userId": "64a7b...", // The ObjectId returned from registration
    "title": "Buy groceries"
  }
  ```
* **Success Response:** `201 Created`

#### 2. Get Todos for a Specific User
* **URL:** `/api/todos/:userId`
* **Method:** `GET`
* **Description:** Replace `:userId` in the URL with the actual user's MongoDB `_id`.
* **Success Response:** `200 OK` (Returns an array of todo objects, sorted by newest first)

#### 3. Update a Todo (Toggle Completion)
* **URL:** `/api/todos/:id`
* **Method:** `PUT`
* **Description:** Replace `:id` in the URL with the specific Todo's `_id`.
* **Body (JSON):**
  ```json
  {
    "completed": true
  }
  ```
* **Success Response:** `200 OK`

#### 4. Delete a Todo
* **URL:** `/api/todos/:id`
* **Method:** `DELETE`
* **Description:** Replace `:id` in the URL with the specific Todo's `_id`.
* **Success Response:** `200 OK`
  ```json
  {
    "message": "Todo deleted successfully"
  }
  ```

## Technologies Used
* **Express.js:** Web framework for Node.js.
* **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.
* **Bcrypt.js:** Library to securely hash passwords.
* **Cors:** Middleware to enable Cross-Origin Resource Sharing (useful when connecting your frontend).
* **Dotenv:** Module to load environment variables from a `.env` file.
