const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(404).json({message: "Username and password are required"});
  }

  if (users.some(user => user.username === username)) {
    return res.status(404).json({message: "User already exists!"});
  }

  users.push({username, password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = Object.keys(books)
    .filter(isbn => books[isbn].author === author)
    .reduce((acc, isbn) => {
      acc[isbn] = books[isbn];
      return acc;
    }, {});

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({message: "No books found for the given author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingBooks = Object.keys(books)
    .filter(isbn => books[isbn].title === title)
    .reduce((acc, isbn) => {
      acc[isbn] = books[isbn];
      return acc;
    }, {});

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({message: "No books found for the given title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }
});

module.exports.general = public_users;

// -----------------------------------------------------------------------
// Client-side helper functions (Tasks 10-13)
// These use Axios with Promise callbacks / async-await to call the
// endpoints defined above.
// -----------------------------------------------------------------------
const axios = require('axios');
const BASE_URL = "http://localhost:5000";

// Task 10: Get the book list available in the shop (using Promise callbacks)
function getAllBooks() {
  axios.get(`${BASE_URL}/`)
    .then(response => {
      console.log("All books:", response.data);
    })
    .catch(error => {
      console.error("Error fetching all books:", error.message);
    });
}

// Task 11: Get book details based on ISBN (using Promise callbacks)
function getBookByISBN(isbn) {
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => {
      console.log(`Book details for ISBN ${isbn}:`, response.data);
    })
    .catch(error => {
      console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
    });
}

// Task 12: Get book details based on author (using async/await)
async function getBookByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by ${author}:`, response.data);
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error.message);
  }
}

// Task 13: Get book details based on title (using async/await)
async function getBookByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(`Books with title ${title}:`, response.data);
  } catch (error) {
    console.error(`Error fetching books with title ${title}:`, error.message);
  }
}

module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBookByAuthor = getBookByAuthor;
module.exports.getBookByTitle = getBookByTitle;
