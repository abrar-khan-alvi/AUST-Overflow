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

    // Fetch post data including voting status
    const postRef = firebase.database().ref('posts/' + postId);
    postRef.once('value', (snapshot) => {
        const post = snapshot.val();
        if (post) {
            // Check if user has upvoted or downvoted
            let hasUpvoted = false;
            let hasDownvoted = false;

            if (post.upvote && loggedInUserId) {
                hasUpvoted = Object.values(post.upvote).includes(loggedInUserId);
            }
            if (post.downvote && loggedInUserId) {
                hasDownvoted = Object.values(post.downvote).includes(loggedInUserId);
            }
            console.log(hasUpvoted, hasDownvoted);
            // Update button colors based on voting status
            updateVoteButtons(hasUpvoted, hasDownvoted);
        } else {
            console.error('Post not found');
            alert('Post not found');
            window.location.href = '/';
        }
    }).catch((error) => {
        console.error("Error fetching post data:", error);
        alert('Error fetching post data');
        window.location.href = '/';
    });
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

            // Count upvotes and downvotes
            countVotes(postId, 'upvote', 'upvoteCount');
            countVotes(postId, 'downvote', 'downvoteCount');

            // Create tags HTML
            const tagsHtml = post.taglines ? post.taglines.split(',').map(tag =>
                `<span class="badge badge-primary mr-1">${tag.trim()}</span>`
            ).join('') : '';
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

function countVotes(postId, voteType, elementId) {
    const votesRef = firebase.database().ref('posts/' + postId + '/' + voteType);

    votesRef.on('value', (snapshot) => {
        const votes = snapshot.val();
        const voteCount = votes ? Object.keys(votes).length : 0;
        document.getElementById(elementId).innerText = voteCount;
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
                            <form class="comment-form mt-2" id="commentForm-${answerId}" style="display:none;" onsubmit="postComment(event, '${postId}', '${answerId}')">
                                <div class="form-group">
                                    <textarea class="form-control" id="newCommentContent-${answerId}" rows="2" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-sm btn-primary">Post Comment</button>
                            </form>
                        `;

                            answersContent.appendChild(answerElement);
                            loadComments(postId, answerId);
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching user data:", error);
                    });
            });
        } else {
            answersContent.innerHTML = '<p>No answers yet. Be the first to answer!</p>';
        }
    });
}

function loadComments(postId, answerId) {
    const commentsRef = firebase.database().ref('posts/' + postId + '/answers/' + answerId + '/comments');
    const commentsContainer = document.getElementById('commentsContainer-' + answerId);
    commentsRef.on('value', (snapshot) => {
        const comments = snapshot.val();
        commentsContainer.innerHTML = '';

        if (comments) {
            Object.keys(comments).forEach(commentId => {
                const comment = comments[commentId];
                firebase.database().ref('users/' + comment.userId).once('value')
                    .then((userSnapshot) => {
                        const user = userSnapshot.val();
                        const commentElement = document.createElement('div');
                        commentElement.classList.add('mt-2', 'mb-2');

                        commentElement.innerHTML = `
                        <p class="mb-1"><strong>${user.Username}</strong>: ${comment.content}</p>
                    `;

                        commentsContainer.appendChild(commentElement);
                    })
                    .catch((error) => {
                        console.error("Error fetching user data:", error);
                    });
            });
        }
    });
}

function showCommentForm(postId, answerId) {
    document.getElementById('commentForm-' + answerId).style.display = 'block';
}

function postComment(event, postId, answerId) {
    event.preventDefault();
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

// Function to handle voting
function vote(type) {
    if (loggedInUserId === "null") {
        alert('You must be logged in to vote.');
        return;
    }

    const postRef = firebase.database().ref('posts/' + currentPostId);
    const upvoteRef = postRef.child('upvote');
    const downvoteRef = postRef.child('downvote');

    postRef.once('value', (snapshot) => {
        const post = snapshot.val();
        const userId = loggedInUserId;

        let hasUpvoted = false;
        let hasDownvoted = false;

        // Check if the user has already upvoted or downvoted
        if (post.upvote) {
            hasUpvoted = Object.values(post.upvote).includes(userId);
        }
        if (post.downvote) {
            hasDownvoted = Object.values(post.downvote).includes(userId);
        }

        // Remove the user from upvote and downvote nodes if necessary
        if (hasUpvoted) {
            upvoteRef.orderByValue().equalTo(userId).once('child_added', (snapshot) => {
                snapshot.ref.remove();
            });
        }
        if (hasDownvoted) {
            downvoteRef.orderByValue().equalTo(userId).once('child_added', (snapshot) => {
                snapshot.ref.remove();
            });
        }

        // Add the user to the appropriate vote node
        if (type === 'upvote' && !hasUpvoted) {
            upvoteRef.push(userId);
        } else if (type === 'downvote' && !hasDownvoted) {
            downvoteRef.push(userId);
        }

        // Update button colors based on the user's vote
        updateVoteButtons(type, hasUpvoted, hasDownvoted);
    }).catch((error) => {
        console.error("Error handling vote:", error);
    });
}

// Function to update button colors based on the user's vote
function updateVoteButtons(type, hadUpvoted, hadDownvoted) {
    const upvoteButton = document.getElementById('upvoteButton');
    const downvoteButton = document.getElementById('downvoteButton');

    if (type === 'upvote') {
        if (hadUpvoted) {
            upvoteButton.classList.add('btn-outline-success');
            upvoteButton.classList.remove('btn-success');
        } else {
            upvoteButton.classList.remove('btn-outline-success');
            upvoteButton.classList.add('btn-success');
            downvoteButton.classList.remove('btn-danger');
            downvoteButton.classList.add('btn-outline-danger');
        }
    } else if (type === 'downvote') {
        if (hadDownvoted) {
            downvoteButton.classList.add('btn-outline-danger');
            downvoteButton.classList.remove('btn-danger');
        } else {
            downvoteButton.classList.remove('btn-outline-danger');
            downvoteButton.classList.add('btn-danger');
            upvoteButton.classList.remove('btn-success');
            upvoteButton.classList.add('btn-outline-success');
        }
    }
}


