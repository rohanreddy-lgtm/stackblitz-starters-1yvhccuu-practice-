const express = require('express');
const { resolve } = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(bodyParser.json());

let blogPosts = [];

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Get all blog posts
app.get('/api/posts', (req, res) => {
  res.json(blogPosts);
});

// Create a new blog post
app.post('/api/posts', (req, res) => {
  const { title, content, author, tags = [], category = "General" } = req.body;

  if (!title || title.length < 5) {
    return res.status(400).json({ error: "Title must be at least 5 characters long and unique." });
  }
  if (!content || content.length < 50) {
    return res.status(400).json({ error: "Content must be at least 50 characters long." });
  }
  if (blogPosts.some(post => post.title === title)) {
    return res.status(400).json({ error: "Title must be unique." });
  }

  const newPost = {
    id: uuidv4(),
    title,
    content,
    author,
    tags,
    category,
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: []
  };

  blogPosts.push(newPost);
  res.status(201).json(newPost);
});

// Like a post
app.post('/api/posts/:id/like', (req, res) => {
  const { username } = req.body;
  const post = blogPosts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  if (!post.likes.includes(username)) {
    post.likes.push(username);
  }
  res.json(post);
});

// Add a comment to a post
app.post('/api/posts/:id/comments', (req, res) => {
  const { username, message } = req.body;
  const post = blogPosts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }
  if (!message) {
    return res.status(400).json({ error: "Comment message is required." });
  }

  const comment = {
    username,
    message,
    commentedAt: new Date()
  };
  post.comments.push(comment);
  post.updatedAt = new Date();
  res.json(post);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});