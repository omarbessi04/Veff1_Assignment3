//Sample for Assignment 3
const express = require("express");

//Import a body parser module to be able to access the request body as json
const bodyParser = require("body-parser");

//Use cors to avoid issues with testing on localhost
const cors = require("cors");

const app = express();

const port = 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

//Set Cors-related headers to prevent blocking of local requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const genres = [
  { id: 1, name: "Fiction" },
  { id: 2, name: "Non-Fiction" },
  { id: 3, name: "Science Fiction" },
  { id: 4, name: "Fantasy" },
];

const books = [
  { id: 1, title: "Pride and Prejudice", author: "Jane Austin", genreId: 1 },
  {
    id: 2,
    title: "Independent People",
    author: "Halldór Laxnes",
    genreId: 1,
  },
  {
    id: 3,
    title: "Brief Answers to the Big Questions",
    author: "Stephen Hawking",
    genreId: 2,
  },
];

/* YOUR CODE STARTS HERE */
// TODO: Implement all logic from the assignment desription

var BookIdCounter = 4;
var GenreIdCounter = 5;
const apiPath = "/api/";
const version = "v1/";

//GET all books
app.get(apiPath + version + "books", (req, res) =>{
  res
    .status(200)
    .json(books);
});

//GET specific book
app.get(apiPath + version + "books", (req, res) =>{
  res
    .status(200)
    books.forEach( book => {
      if (book.id == req.params.id){
        res.json(book);
      }
    })  
});

//GET all genres
app.get(apiPath + version + "genres", (req, res) =>{
  res
    .status(200)
    .json(genres);
});

//POST book
app.post(apiPath + version + "books", (req, res) =>{
  
  const {title, author, genreId} = req.body;

  // Create new book
  const newBook = {
    id: BookIdCounter,
    title,
    author,
    genreId,
  }
  
  //Push book to list
  books.push(newBook)
  BookIdCounter++

  return res
  .status(200)
  .json({message:"new book recieved and logged"})
});

//DELETE book
app.delete(apiPath + version + "books/:bookId", (req, res) =>{
    let bookID_to_delete = req.params.bookId
    let deleted_book
    bookID_to_delete = parseInt(bookID_to_delete)
    for (let i = books.length-1; i >= 0; i--) {
      const book = books[i];
      if (book["id"] == bookID_to_delete){
        deleted_book = book;
        books.splice(i, 1)
        break
      }
    }
    res
    .status(200)
    .json(deleted_book);
});

app.patch(apiPath + version + "genres/:currentGenreId/books/:bookData", (req, res) =>{
  const book_id = parseInt(req.params.bookData)
  let updated_book

  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    if (book["id"] === book_id){
      updated_book = book
      req.body["id"] = parseInt(req.body["id"])
      books[i] = req.body
      break
    }
  };
  res
  .status(200)
  .json(updated_book)

});

//POST genre
app.post(apiPath + version + "genres", (req, res) =>{
  
  const {id, name} = req.body;

  // Create new book
  const newGenre = {
    id: GenreIdCounter,
    name,
  }
  
  //Push book to list
  genres.push(newGenre)
  GenreIdCounter++

  return res
  .status(200)
  .json({message:"new genre recieved and logged"})
});


// DELETE genre
app.delete(apiPath + version + "books/:genreId", (req, res) =>{
    let deleted_genre;
    let genreID_to_delete = req.params.genreId;
    genreID_to_delete = parseInt(genreID_to_delete);

    //check if book exists within genre
    books.forEach( book => {
      if (book.genreId == genreId){
        res
        .status(404)
        .json("Book exists within genre. Genre will not be deleted");
      }

    for (let i = genres.length-1; i >= 0; i--) {
      const genre = genres[i];
      if (genre["id"] == genreID_to_delete){
        deleted_genre = genre;
        books.splice(i, 1);
        break;
      }
    }
    res
    .status(200)
    .json(deleted_genre);
  });
});
/* YOUR CODE ENDS HERE */

/* DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) */
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app; // Export the app
