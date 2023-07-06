let form = document.getElementById("form");
let inputTitle = document.getElementById("inputTitle");
let inputContent = document.getElementById("inputContent");
let msg = document.getElementById("msg");
let posts = document.getElementById("posts");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Form submitted");
  formValidation();
});

let data = {};

function formValidation() {
  if (inputContent.value === "") {
    console.log("Failure");
    msg.innerHTML = "Post content cannot be blank";
  } else {
    console.log("Success");
    console.log("Data pushed to data object");
    msg.innerHTML = "";
    createPost();
  }
}

function createPost() {
  console.log("createPost called from main.js");
  const data = {
    title: inputTitle.value,
    content: inputContent.value,
  };
  console.log("Data in main.js createPost function:", data);

  return fetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      inputTitle.value = "";
      inputContent.value = "";
      renderPost(data);
      getPosts();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function renderPost(post) {
  console.log("renderPost called from main.js");
  posts.innerHTML += `
        <div id="${post.id}">
            <h4>${post.title}</h4>
            <p>${post.content}</p>
            <span class="options">
                <a href="#" onClick="updatePost(this)">📝</a>
                <a href="#" onClick="deletePost(this)">🗑️</a>       
            </span>
        </div>
    `;
}

function renderPosts(postsData) {
  console.log("renderPosts called from main.js");
  postsData.forEach((postData) => {
    renderPost(postData);
  });
}

function getPosts() {
  console.log("getPosts called from main.js");
  return fetch("/posts", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((fetchedPosts) => {
      console.log("Success:", fetchedPosts);
      posts.innerHTML = "";
      renderPosts(fetchedPosts);
      // return fetchedPosts;
    });
}

getPosts();

// async function controlFlow() {
//   let fetchedData = await getPosts();
//   console.log("fetchedData:", fetchedData);
//   renderPosts(fetchedData);
// }
// controlFlow();

function updatePost() {
  console.log("updatePost called from main.js");
}

function deletePost() {
  console.log("deletePost called from main.js");
}

// let listOfPosts = [
//   {
//     id: "3e39471-d408-4b7c-a63b-5f639c47dfcb",
//     title: "Post 1",
//     content: "This is the first post",
//   },
//   {
//     id: "3e39471-d408-4b7c-a63b-5f639c47dfcc",
//     title: "Post 2",
//     content: "This is the second post",
//   },
//   {
//     id: "3e39471-d408-4b7c-a63b-5f639c47dfcd",
//     title: "Post 3",
//     content: "This is the third post",
//   },
// ];
