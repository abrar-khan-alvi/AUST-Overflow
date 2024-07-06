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

// Function to fetch and display posts
function fetchAndDisplayPosts() {
    const postsRef = firebase.database().ref('posts');
    const feedContainer = document.getElementById('post-feed');

    postsRef.on('value', (snapshot) => {
        feedContainer.innerHTML = ''; // Clear existing content

        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            const postId = childSnapshot.key;

            // Create tags HTML
            const tagsHtml = post.taglines.split(',').map(tag =>
                `<span class="badge badge-primary mr-1">${tag.trim()}</span>`
            ).join('');

            const postElement = document.createElement('div');
            postElement.className = 'col-md-6 mb-4';
            postElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">
                            <a href="/Question/PostDetails/${postId}">${post.Title}</a>
                        </h5>
                        <p class="card-text">
                            ${tagsHtml}
                        </p>
                    </div>
                </div>
            `;

            feedContainer.appendChild(postElement);
        });
    }, (error) => {
        console.error("Error fetching posts: ", error);
    });
}

// Function to view a single post (you can implement this later)
function viewPost(postId) {
    console.log("Viewing post: ", postId);
    // Implement navigation to a detailed post view
}

// Call the function to fetch and display posts when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);