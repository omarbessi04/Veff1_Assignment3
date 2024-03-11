// Constants for API base URL
const API_URL = "http://localhost:3000/api/v1/";

// Here we use let as these variables will be mutated throughout our code
let books = [];
let genres = [];

/*------------------------
BOOK ENDPOINTS
------------------------*/

// GET Books
const getBooks = async () => {
  try {
    const response = await axios.get(API_URL + "books");
    console.log("Successfully fetched books: ", response.data);
    books = response.data;
  } catch (error) {
    console.log("Error when fetching books: ", error);
  }
};

// DELETE Book
const deleteBook = async (bookId) => {
  try {
    await axios.delete(API_URL + `books/${bookId}`);
    // When successful, print a message
    console.log(`Book with id ${bookId} has successfully been deleted`);
    // Refresh the Book List after deletion
    fetchAndPopulateBooks();
  } catch (error) {
    //When unsuccessful, print the error
    showToast(`Error: ${error.response?.data?.message}`, true);
    console.log(error);
  }
};

// POST Book
const addBook = async (bookData) => {
  try {
    const response = await axios.post(API_URL + "books", bookData);
    // When successful, print a message
    console.log(`Book with id ${response.data.id} has successfully been added`);
    fetchAndPopulateBooks();
  } catch (error) {
    //When unsuccessful, print the error
    showToast(`Error: ${error.response?.data?.message}`, true);
    console.log(error);
  }
};

// PATCH Book
const editBook = async (bookData, currentGenreId) => {
  try {
    const response = await axios.patch(
      API_URL + `genres/${currentGenreId}/books/${bookData.id}`,
      bookData
    );
    // When successful, print a message
    console.log(
      `Book with id ${response.data.id} has succesfully been updated`
    );
    // Refresh the Book List after update
    fetchAndPopulateBooks();
  } catch (error) {
    //When unsuccessful, print the error
    showToast(`Error: ${error.response?.data?.message}`, true);
    console.log(error);
  }
};

/*------------------------
GENRE ENDPOINTS
------------------------*/

// GET Genres
const getGenres = async () => {
  try {
    const response = await axios.get(API_URL + "genres");
    //When successful, print the received data
    console.log("Successfully fetched genres: ", response.data);
    genres = response.data;
  } catch (error) {
    //When unsuccessful, print the error.
    console.log("Error when fetching genres: ", error);
  }
};

// POST Genre
const addGenre = async (genreData) => {
  try {
    const response = await axios.post(API_URL + "genres", genreData);
    //When successful, print the received data
    console.log(
      `Genre with id ${response.data.id} has successfully been added`
    );
    fetchAndPopulateGenres();
  } catch (error) {
    //When unsuccessful, print the error.
    showToast(`Error: ${error.response?.data?.message}`, true);
    console.log(error);
  }
};

/*------------------------
SUPPORTIVE FUNCTIONS
------------------------*/

const fetchAndPopulateBooks = async () => {
  await getBooks();
  populateBookCards();
};

const fetchAndPopulateGenres = async () => {
  await getGenres();
  populateGenreOptions();
};

const populateBookCards = () => {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";
  books.forEach((book) => {
    const card = document.createElement("div");
    const genreName =
      genres.find((genre) => genre.id === book.genreId)?.name || "Unknown";
    card.classList.add("bookCard");
    card.innerHTML = `
      <h3>${book.title}</h3>
      <p><b>Author:</b> ${book.author}</p>
      <p><b>Genre:</b> ${genreName}</p>
    `;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("cardButtons");

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "<i class='fa fa-pencil fa-xs edit-icon''></i>";
    editBtn.classList.add("editBtn");
    editBtn.onclick = function () {
      console.log(`Editing book ${book.id}`);
      openEditModal(book);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "<i class='fa fa-trash fa-xs delete-icon'></i>";
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.onclick = function () {
      confirmDelete(book);
    };

    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);

    card.appendChild(buttonContainer);
    bookList.appendChild(card);
  });
};

const populateGenreOptions = () => {
  const genreSelect = document.getElementById("genre");
  genreSelect.innerHTML = ""; // Clear existing options
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.name;
    genreSelect.appendChild(option);
  });
};

const showToast = (message, isError = false) => {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  if (isError) {
    toast.classList.add("toast-error");
  } else {
    toast.classList.remove("toast-error");
  }
  toast.classList.add("show");
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
    if (isError) {
      toast.classList.remove("toast-error");
    }
  }, 5000);
};

/*------------------------
BOOK MODAL FUNCTIONALITY
------------------------*/

// Add/Edit Book Form Submission
document
  .getElementById("addBookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const id = document
      .getElementById("addBookModal")
      .getAttribute("dataBookId");
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const genreId = parseInt(document.getElementById("genre").value);
    const currentGenreId = document
      .getElementById("addBookModal")
      .getAttribute("dataBookGenreId");

    const bookData = { id, title, author, genreId };

    if (id) {
      // Update (PATCH)
      editBook(bookData, currentGenreId);
    } else {
      // Add new (GET)
      addBook(bookData);
    }

    // Fetch new info
    fetchAndPopulateBooks();

    this.reset(); // Reset form fields
    document.getElementById("addBookModal").removeAttribute("dataBookId");
    document.getElementById("addBookModal").removeAttribute("dataBookGenreId");
    document.getElementById("addBookModal").style.display = "none"; // Close modal
  });

const bookModal = document.getElementById("addBookModal");
const bookButton = document.getElementById("newBookButton");
const bookCloseModal = document.getElementsByClassName("closeBookButton")[0];

// When the user clicks the button, open the modal
bookButton.onclick = function () {
  bookModal.style.display = "block";
  openAddModal();
};

// When the user clicks on <span> (x), close the modal
bookCloseModal.onclick = function () {
  bookModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == bookModal) {
    bookModal.style.display = "none";
  }
};

/*------------------------
GENRE MODAL FUNCTIONALITY
------------------------*/

// Add Genre Form Submission
document
  .getElementById("addGenreForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById("genreName").value;

    const genreData = { name };

    addGenre(genreData);

    this.reset(); // Reset form fields

    fetchAndPopulateGenres();

    document.getElementById("addGenreModal").style.display = "none"; // Close modal
  });

const genreModal = document.getElementById("addGenreModal");
const genreButton = document.getElementById("newGenreButton");
const genreCloseModal = document.getElementsByClassName("closeGenreButton")[0];

// When the user clicks the button, open the modal
genreButton.onclick = function () {
  genreModal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
genreCloseModal.onclick = function () {
  genreModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == genreModal) {
    genreModal.style.display = "none";
  }
};

// Function to open the modal in 'Add' mode
const openAddModal = () => {
  document.getElementById("addBookModal").setAttribute("data-mode", "add");
  document.getElementById("addBookForm").reset();
  document.getElementById("modalHeading").textContent = "Add New Book";
  bookModal.style.display = "block";
};

// Function to open the modal in 'Edit' mode
const openEditModal = (book) => {
  document.getElementById("addBookModal").setAttribute("data-mode", "edit");
  document.getElementById("addBookModal").setAttribute("dataBookId", book.id);
  document
    .getElementById("addBookModal")
    .setAttribute("dataBookGenreId", book.genreId);
  document.getElementById("modalHeading").textContent = "Edit Book";
  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("genre").value = book.genreId;
  bookModal.style.display = "block";
};

/*------------------------
DELETION CONFIRMATION MODAL 
------------------------*/
const confirmDelete = (book) => {
  document
    .getElementById("confirmDelete")
    .setAttribute("data-book-id", book.id);
  document.getElementById("bookTitle").textContent = book.title;
  document.getElementById("confirmationModal").style.display = "block";
};

// Close modal when the close button is clicked
document.querySelector(".closeModal").addEventListener("click", function () {
  document.getElementById("confirmationModal").style.display = "none";
});

// Confirm deletion
document.getElementById("confirmDelete").addEventListener("click", function () {
  const bookId = document
    .getElementById("confirmDelete")
    .getAttribute("data-book-id");

  console.log(`Deleting book ${bookId}`);
  deleteBook(bookId);
  document.getElementById("confirmationModal").style.display = "none";
});

// Cancel deletion
document.getElementById("cancelDelete").addEventListener("click", function () {
  console.log("User cancelled deletion");
  document.getElementById("confirmationModal").style.display = "none";
});

// Initialize both Book and Genre data
fetchAndPopulateGenres();
fetchAndPopulateBooks();
