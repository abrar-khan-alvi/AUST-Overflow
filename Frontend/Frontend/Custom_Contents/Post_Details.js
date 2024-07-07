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
let currentPostId = null;

function initializePostDetails(postId) {
    currentPostId = postId;
    loadPostDetails(postId);

    // Handle new answer submission
    const answerForm = document.getElementById('answerForm');
    if (answerForm) {
        answerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            postAnswer(postId);
        });
    }

    // Add event listeners for voting buttons
    const upvoteButton = document.querySelector('button[onclick="vote(\'upvote\')"]');
    const downvoteButton = document.querySelector('button[onclick="vote(\'downvote\')"]');

    if (upvoteButton) {
        upvoteButton.onclick = () => vote('upvote');
    }
    if (downvoteButton) {
        downvoteButton.onclick = () => vote('downvote');
    }
}

function loadPostDetails(postId) {
    const postRef = firebase.database().ref('posts/' + postId);

    postRef.on('value', (snapshot) => {
        const post = snapshot.val();
        if (post) {
            // Fetch the author's username from the users node
            firebase.database().ref('users/' + post.userId).once('value')
                .then((userSnapshot) => {
                    const user = userSnapshot.val();
                    const authorName = user ? 'Post Author: ' + user.Username : 'Anonymous';
                    document.getElementById('postAuthor').innerText = authorName;
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                    document.getElementById('postAuthor').innerText = 'Anonymous';
                });

            document.getElementById('postTitle').innerText = post.Title;
            document.getElementById('postContent').innerHTML = post.content;
            document.getElementById('upvoteCount').innerText = post.upvote || 0;
            document.getElementById('downvoteCount').innerText = post.downvote || 0;

            // Create tags HTML
            const tagsHtml = post.taglines.split(',').map(tag =>
                `<span class="badge badge-primary mr-1">${tag.trim()}</span>`
            ).join('');
            document.getElementById('postTags').innerHTML = tagsHtml;

            // Display image if available
            if (post.imageUrl) {
                document.getElementById('postImage').innerHTML = `<img src="${post.imageUrl}" class="img-fluid" alt="Post image">`;
            } else {
                document.getElementById('postImage').style.display = 'none';
            }

            // Load answers and comments
            loadAnswers(postId);
        } else {
            alert('Post not found');
            window.location.href = '/';
        }
    });
}

function loadAnswers(postId) {
    const answersRef = firebase.database().ref('posts/' + postId + '/answers');

    answersRef.on('value', (snapshot) => {
        const answers = snapshot.val();
        const answersContainer = document.getElementById('answersContainer');
        answersContainer.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h2 class="mb-4">Answers</h2>
                    <div id="answersContent"></div>
                </div>
            </div>
        `;

        const answersContent = document.getElementById('answersContent');

        if (answers) {
            Object.keys(answers).forEach(answerId => {
                const answer = answers[answerId];
                firebase.database().ref('users/' + answer.userId).once('value')
                    .then((userSnapshot) => {
                        const user = userSnapshot.val();
                        const answerElement = document.createElement('div');
                        answerElement.classList.add('mb-4');
                        let userHtml = '';
                        if (user && user.Username) {
                            userHtml = `<h5 class="mb-1">${user.Username}</h5>`;

                            answerElement.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center">
                                ${userHtml}
                                <a href="#!" onclick="showCommentForm('${postId}', '${answerId}')" class="text-primary">
                                    <i class="fas fa-reply fa-xs"></i> reply
                                </a>
                            </div>
                            <p class="mb-3">${answer.answer}</p>
                            <div id="commentsContainer-${answerId}"></div>
                            <form class="comment-form mt-3" id="commentForm-${answerId}" style="display: none;" onsubmit="postComment(event, '${postId}', '${answerId}')">
                                <div class="form-group">
                                    <textarea class="form-control" id="newCommentContent-${answerId}" rows="2" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary mt-2">Post Comment</button>
                            </form>
                        `;
                        }
                        answersContent.appendChild(answerElement);

                        // Load comments for each answer
                        loadComments(postId, answerId);
                    })
                    .catch((error) => {
                        console.error("Error fetching user data for answer:", error);
                    });
            });
        } else {
            answersContent.innerHTML = '<p>No answers yet.</p>';
        }
    });
}

function loadComments(postId, answerId) {
    const commentsRef = firebase.database().ref('posts/' + postId + '/answers/' + answerId + '/comments');

    commentsRef.on('value', (snapshot) => {
        const comments = snapshot.val();
        const commentsContainer = document.getElementById('commentsContainer-' + answerId);
        commentsContainer.innerHTML = '';

        if (comments) {
            Object.keys(comments).forEach(commentId => {
                const comment = comments[commentId];
                firebase.database().ref('users/' + comment.userId).once('value')
                    .then((userSnapshot) => {
                        const user = userSnapshot.val();
                        const commentElement = document.createElement('div');
                        commentElement.classList.add('ms-4', 'mt-3');
                        let userHtml = '';
                        if (user && user.Username) {
                            userHtml = `<h5 class="mb-1">${user.Username}</h5>`;

                            commentElement.innerHTML = `
                            ${userHtml}
                            <p class="mb-2">${comment.content}</p>
                        `;
                        }
                        commentsContainer.appendChild(commentElement);
                    })
                    .catch((error) => {
                        console.error("Error fetching user data for comment:", error);
                    });
            });
        } else {
            commentsContainer.innerHTML = '<p>No comments yet.</p>';
        }
    });
}

function showCommentForm(postId, answerId) {
    if (loggedInUserId === "null") {
        alert('You must be logged in to post a comment.');
        return;
    }
    const commentForm = document.getElementById('commentForm-' + answerId);
    commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
}

function postAnswer(postId) {
    if (loggedInUserId === "null") {
        alert('You must be logged in to post an answer.');
        return;
    }

    const newAnswerContent = document.getElementById('newAnswerContent').value;
    const answersRef = firebase.database().ref('posts/' + postId + '/answers');

    const newAnswerRef = answersRef.push();
    newAnswerRef.set({
        answer: newAnswerContent,
        userId: loggedInUserId
    }).then(() => {
        document.getElementById('newAnswerContent').value = '';
    }).catch((error) => {
        console.error("Error posting answer:", error);
    });
}

function postComment(event, postId, answerId) {
    event.preventDefault();

    if (loggedInUserId === "null") {
        alert('You must be logged in to post a comment.');
        return;
    }

    const newCommentContent = document.getElementById('newCommentContent-' + answerId).value;
    const commentsRef = firebase.database().ref('posts/' + postId + '/answers/' + answerId + '/comments');

    const newCommentRef = commentsRef.push();
    newCommentRef.set({
        content: newCommentContent,
        userId: loggedInUserId
    }).then(() => {
        document.getElementById('newCommentContent-' + answerId).value = '';
    }).catch((error) => {
        console.error("Error posting comment:", error);
    });
}

function vote(type) {
    if (loggedInUserId === "null") {
        alert('You must be logged in to vote.');
        return;
    }

    const postRef = firebase.database().ref('posts/' + currentPostId);
    postRef.transaction((post) => {
        if (post) {
            if (type === 'upvote') {
                post.upvote = (post.upvote || 0) + 1;
            } else if (type === 'downvote') {
                post.downvote = (post.downvote || 0) + 1;
            }
        }
        return post;
    });
}

