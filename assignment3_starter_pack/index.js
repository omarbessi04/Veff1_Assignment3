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

let BookIdCounter = 4;
let GenreIdCounter = 5;
const apiPath = "/api/";
const version = "v1/";

//GET all books
app.get(apiPath + version + "books", (req, res) => {
  if (Object.keys(req.query) == false) {
    res.status(200).json(books);
  } else {
    if (Object.keys(req.query) == "filter") {
      const genre_name_to_get = req.query["filter"].toLowerCase();
      let genre_to_get = null;
      let book_list = [];
      genres.forEach((genre) => {
        if (genre["name"].toLowerCase() == genre_name_to_get) {
          genre_to_get = genre;
          console.log(genre_to_get);
        }
      });
      if (genre_to_get == null) {
        return res.status(200).json(book_list);
      }
      books.forEach((book) => {
        if (book["genreId"] == genre_to_get["id"]) {
          book_list.push(book);
        }
      });
      res.status(200).json(book_list);
    } else {
      return res.status(400).json("bad request");
    }
  }
});

//GET specific book
app.get(apiPath + version + "genres/:genreId/books/:bookId", (req, res) => {
  let found_book;

  // Find book within book list
  books.forEach((book) => {
    if (book.id == req.params.bookId) {
      found_book = book;
    }
  });

  res.status(200).json(found_book);
});

//GET all genres
app.get(apiPath + version + "genres", (req, res) => {
  res.status(200).json(genres);
});

//POST book
app.post(apiPath + version + "books", (req, res) => {
  console.log(req);

  const { new_book_id, title, author, genreId } = req.body;
  const genreFound = genres.find((genre) => genre.id === genreId);

  // Test input variables
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof author !== "string" ||
    !author.trim() ||
    typeof genreId !== "number" ||
    !genreId ||
    !genreFound
  ) {
    if (genreId !== 0) {
      return res.status(400).json({ message: "Bad Request, hello" });
    }
  }

  // Create new book
  const newBook = {
    id: BookIdCounter,
    title,
    author,
    genreId,
  };

  //Push book to list
  books.push(newBook);
  BookIdCounter++;

  return res.status(201).json(newBook);
});

//DELETE book w. bookId
app.delete(apiPath + version + `books` + `/:bookId`, (req, res) => {
  let bookID_to_delete = req.params.bookId;
  let deleted_book;
  let found_book = false;
  bookID_to_delete = parseInt(bookID_to_delete);
  if (bookID_to_delete != 0) {
    if (typeof bookID_to_delete != "number") {
      return res.status(400).json({ message: "Bad request" });
    }

    if (bookID_to_delete % 1 !== 0) {
      return res.status(400).json({ message: "Bad request" });
    }

    for (let i = books.length - 1; i >= 0; i--) {
      const book = books[i];
      if (book["id"] == bookID_to_delete) {
        deleted_book = book;
        books.splice(i, 1);
        found_book = true;
        break;
      }
    }
    if (found_book === true) {
      return res.status(200).json(deleted_book);
    } else {
      return res.status(404).json({ message: "book not found" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
});

//DELETE book wo. bookId
app.delete(apiPath + version + `books`, (req, res) => {
  return res.status(405).json({ message: "Method Not Allowed" });
});

// UPDATE book
app.patch(
  apiPath + version + "genres/:currentGenreId/books/:bookId",
  (req, res) => {
    const book_id = parseInt(req.params.bookId);

    console.log(req.params);
    console.log(req.body);
    genreFound = genres.find((genre) => genre.id == req.params.currentGenreId);
    bookFound = books.find((book) => book.id == book_id);

    if (!bookFound) {
      return res
        .status(400)
        .json({ message: "Not able to find book with specified id" });
    }

    if (bookFound.genreId != req.params.currentGenreId) {
      return res
        .status(404)
        .json({ message: "Current genre and genre of book do not match" });
    }

    if (!genreFound) {
      //return res.status(404).json({ message: "Not Found" });
      return res.status(400).json({ message: "Genre does not exits" });
    }

    // If all checks work, update the book
    if (req.body.title) {
      bookFound.title = req.body.title;
    }

    if (req.body.author) {
      bookFound.author = req.body.author;
    }

    if (req.body.genre) {
      bookFound.genreID = Number(req.body.genre);
    }

    return res.status(200).json(bookFound);
  }
);

//POST genre
app.post(apiPath + version + "genres", (req, res) => {
  const { id, name } = req.body;

  // Create new genre
  const newGenre = {
    id: GenreIdCounter,
    name,
  };

  // Check genre name
  if (!name || typeof name != "string") {
    return res.status(400).json({ message: "Invalid name type" });
  }

  // Check if genre exists
  genres.forEach((genre) => {
    if (genre.name.toLowerCase() == name.toLowerCase()) {
      return res.status(400).json({ message: "Genre already exists" });
    }
  });

  //Push genre to list
  genres.push(newGenre);
  GenreIdCounter++;

  return res.status(201).json(newGenre);
});

// DELETE genre
app.delete(apiPath + version + "genres/:genreId", (req, res) => {
  console.log(req.params.genreId);
  let deleted_genre;
  let found_genre = false;
  let genreID_to_delete = req.params.genreId;
  genreID_to_delete = parseInt(genreID_to_delete);

  //check if book exists within genre
  books.forEach((book) => {
    if (book.genreId === genreID_to_delete) {
      return res.status(400).json("Bad Request");
    }
  });

  for (let i = genres.length - 1; i >= 0; i--) {
    const genre = genres[i];
    if (genre["id"] === genreID_to_delete) {
      deleted_genre = genre;
      books.splice(i, 1);
      found_genre = true;
      break;
    }
  }
  if (found_genre == true) {
    return res.status(200).json(deleted_genre);
  } else {
    return res.status(404).json({ message: "Genre not found" });
  }
});

//DELETE book
app.delete(apiPath + version + `genres`, (req, res) => {
  return res.status(405).json({ message: "Method Not Allowed" });
});

/* YOUR CODE ENDS HERE */

/* DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) */
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app; // Export the app
