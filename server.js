require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  // Mongoose 6+ no longer requires useNewUrlParser and useUnifiedTopology,
  // but they are safe to omit or leave. Kept minimal here for modern versions.
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Models ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

// --- Routes ---

// 1. Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, username: newUser.username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2. Add a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { userId, title } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newTodo = new Todo({ userId, title });
    await newTodo.save();

    res.status(201).json({
      message: 'Todo added successfully',
      todo: newTodo
    });
  } catch (error) {
    console.error('Add Todo error:', error);
    res.status(500).json({ error: 'Server error while adding todo' });
  }
});

// 3. Get todos for a specific user
app.get('/api/todos/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userTodos = await Todo.find({ userId }).sort({ createdAt: -1 });
    res.json({ todos: userTodos });
  } catch (error) {
    console.error('Fetch Todos error:', error);
    res.status(500).json({ error: 'Server error while fetching todos' });
  }
});

// 4. Update a todo status (Bonus feature)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      id, 
      { completed }, 
      { new: true }
    );
    
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ message: 'Todo updated', todo: updatedTodo });
  } catch (error) {
    console.error('Update Todo error:', error);
    res.status(500).json({ error: 'Server error while updating todo' });
  }
});

// 5. Delete a todo (Bonus feature)
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete Todo error:', error);
    res.status(500).json({ error: 'Server error while deleting todo' });
  }
});

// 6. Get all users (development/testing purposes)
app.get('/api/users', async (req, res) => {
  try {
    // Exclude passwords from response
    const users = await User.find({}, '-password'); 
    res.status(200).json({ users });
  } catch (error) {
    console.error('Fetch Users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// 6.1 Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.status(200).json({ todos });
  } catch (error) {
    console.error('Fetch All Todos error:', error);
    res.status(500).json({ error: 'Server error while fetching all todos' });
  }
});

// 6.2 Get all users and all todos combined
app.get('/api/all-data', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); 
    const todos = await Todo.find({});
    res.status(200).json({ users, todos });
  } catch (error) {
    console.error('Fetch All Data error:', error);
    res.status(500).json({ error: 'Server error while fetching all data' });
  }
});

// 7. Get API info/details
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Todo API',
    version: '1.0.0',
    description: 'A Node.js Express & MongoDB RESTful API for Todo management.',
    endpoints: {
      register: 'POST /api/register',
      addTodo: 'POST /api/todos',
      getTodos: 'GET /api/todos/:userId',
      updateTodo: 'PUT /api/todos/:id',
      deleteTodo: 'DELETE /api/todos/:id',
      getUsers: 'GET /api/users',
      apiInfo: 'GET /api/info'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
