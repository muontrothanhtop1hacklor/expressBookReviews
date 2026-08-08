const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(404).json({message: "Username and password are required"});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

  let accessToken = jwt.sign({
    data: username
  }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = {
    accessToken, username
  }

  return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization ? req.session.authorization.username : null;

  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }

  book.reviews[username] = review;

  return res.status(200).json({message: "The review for the book was added/updated successfully", reviews: book.reviews});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization ? req.session.authorization.username : null;

  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({message: "Review deleted successfully", reviews: book.reviews});
  } else {
    return res.status(404).json({message: "No review found for this user to delete"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
