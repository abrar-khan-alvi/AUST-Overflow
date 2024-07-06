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

function loadPostDetails(postId) {
    const postRef = firebase.database().ref('posts/' + postId);

    postRef.once('value').then((snapshot) => {
        const post = snapshot.val();
        if (post) {
            document.getElementById('postTitle').innerText = post.Title;
            document.getElementById('postContent').innerHTML = post.content;

            // Create tags HTML
            const tagsHtml = post.taglines.split(',').map(tag =>
                `<span class="badge badge-primary mr-1">${tag.trim()}</span>`
            ).join('');
            document.getElementById('postTags').innerHTML = tagsHtml;

            // Display image if available
            if (post.imageUrl) {
                document.getElementById('postImage').innerHTML = `<img src="${post.imageUrl}" class="img-fluid" alt="Post image">`;
            }

            // Load answers and comments
            loadAnswers(postId);
        } else {
            alert('Post not found');
            window.location.href = '/';
        }
    }).catch((error) => {
        console.error("Error loading post details:", error);
        alert('Error loading post details');
    });

    // Handle new answer submission
    document.getElementById('answerForm').addEventListener('submit', function (event) {
        event.preventDefault();
        postAnswer(postId);
    });
}

function loadAnswers(postId) {
    const answersRef = firebase.database().ref('posts/' + postId + '/answers');

    answersRef.once('value').then((snapshot) => {
        const answers = snapshot.val();
        const answersContainer = document.getElementById('answersContainer');
        answersContainer.innerHTML = '';

        if (answers) {
            Object.keys(answers).forEach(answerId => {
                const answer = answers[answerId];
                const answerElement = document.createElement('div');
                answerElement.classList.add('answer');
                answerElement.innerHTML = `
                    <div class="answer-content mb-3">${answer.answer}</div>
                    <div class="answer-content mb-3">${answer.userId}</div >
                    <button class="btn btn-link" onclick="showCommentForm('${postId}', '${answerId}')">Add Comment</button>
                    <div class="comments-container" id="commentsContainer-${answerId}"></div>
                    <form class="comment-form" id="commentForm-${answerId}" style="display: none;" onsubmit="postComment(event, '${postId}', '${answerId}')">
                        <div class="form-group">
                            <textarea class="form-control" id="newCommentContent-${answerId}" rows="2" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Post Comment</button>
                    </form>
                `;

                answersContainer.appendChild(answerElement);

                // Load comments for each answer
                loadComments(postId, answerId);
            });
        } else {
            answersContainer.innerHTML = 'No answers yet.';
        }
    }).catch((error) => {
        console.error("Error loading answers:", error);
    });
}

function loadComments(postId, answerId) {
    const commentsRef = firebase.database().ref('posts/' + postId + '/answers/' + answerId + '/comments');

    commentsRef.once('value').then((snapshot) => {
        const comments = snapshot.val();
        const commentsContainer = document.getElementById('commentsContainer-' + answerId);
        commentsContainer.innerHTML = '';

        if (comments) {
            Object.keys(comments).forEach(commentId => {
                const comment = comments[commentId];
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');
                commentElement.innerHTML = `
                <div class="comment-content mb-2">${comment.userId}</div>
                <div class="comment-content mb-2">${comment.content}</div>`;
                commentsContainer.appendChild(commentElement);
            });
        }
    }).catch((error) => {
        console.error("Error loading comments:", error);
    });
}

function showCommentForm(postId, answerId) {
    document.getElementById('commentForm-' + answerId).style.display = 'block';
}

function postAnswer(postId) {
    const newAnswerContent = document.getElementById('newAnswerContent').value;
    const answersRef = firebase.database().ref('posts/' + postId + '/answers');

    const newAnswerRef = answersRef.push();
    newAnswerRef.set({
        answer: newAnswerContent,
        userId: 'user123' // Replace with actual user ID
    }).then(() => {
        document.getElementById('newAnswerContent').value = '';
        loadAnswers(postId);
    }).catch((error) => {
        console.error("Error posting answer:", error);
    });
}

function postComment(event, postId, answerId) {
    event.preventDefault();
    const newCommentContent = document.getElementById('newCommentContent-' + answerId).value;
    const commentsRef = firebase.database().ref('posts/' + postId + '/answers/' + answerId + '/comments');

    const newCommentRef = commentsRef.push();
    newCommentRef.set({
        content: newCommentContent,
        userId: 'user123' // Replace with actual user ID
    }).then(() => {
        document.getElementById('newCommentContent-' + answerId).value = '';
        loadComments(postId, answerId);
    }).catch((error) => {
        console.error("Error posting comment:", error);
    });
}
