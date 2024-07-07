// Firebase initialization should be in a separate script, e.g., firebase-init.js
// Initialize Firebase (make sure this matches your Firebase configuration)
var firebaseConfig = {
    apiKey: "AIzaSyAse483WtEgu5ODHwmJT_QwHzPBeN-tCMs",
    authDomain: "aust-overflow.firebaseapp.com",
    databaseURL: "https://aust-overflow-default-rtdb.firebaseio.com",
    projectId: "aust-overflow",
    storageBucket: "aust-overflow.appspot.com",
    messagingSenderId: "597727996516",
    appId: "1:597727996516:web:b61deb25e126e0ecd4cd71"
};
// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

function searchPosts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const postsRef = firebase.database().ref('posts');
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';

    postsRef.once('value').then((snapshot) => {
        const posts = snapshot.val();
        let resultsFound = false;

        if (posts) {
            Object.keys(posts).forEach(postId => {
                const post = posts[postId];
                const title = post.Title ? post.Title.toLowerCase() : '';
                const taglines = post.taglines ? post.taglines.toLowerCase() : '';
                const titleMatch = title.includes(searchInput);
                const taglinesMatch = taglines.includes(searchInput);
                if (titleMatch || taglinesMatch) {
                    resultsFound = true;
                    const postElement = document.createElement('div');
                    postElement.classList.add('content-box');
                    postElement.innerHTML = `
                        <h5>${post.Title}</h5>
                        <p><small>${post.taglines}</small></p>
                        <a href="/Question/PostDetails/${postId}" class="btn btn-primary">View Post</a>
                    `;
                    searchResultsContainer.appendChild(postElement);
                }
            });
        }

        if (!resultsFound) {
            searchResultsContainer.innerHTML = '<p class="text-muted">No results found</p>';
        }
    }).catch((error) => {
        console.error("Error searching posts:", error);
        searchResultsContainer.innerHTML = '<p class="text-danger">Error searching posts</p>';
    });
}
