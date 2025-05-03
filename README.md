# AUST Overflow

AUST Overflow is a question and answer platform built using ASP.NET MVC integrated with Firebase services. This platform enables students and faculty to ask academic questions, provide answers, search for information, and build a knowledge-sharing community.

## Purpose and Scope

AUST Overflow provides an academic environment where users can interact with each other by posting and answering questions, searching for content, and moderating community contributions. The platform supports:

* User Authentication
* Profile Management
* Question Posting and Answering
* Content Moderation
* Searching for Information

## System Architecture

AUST Overflow follows the **Model-View-Controller (MVC)** design pattern, with Firebase providing the backend infrastructure. Firebase services play a key role in user authentication, data storage, and file management.

### Core System Components

* **Authentication System**: Manages user registration, login, and session handling using Firebase Authentication. User profiles are stored in Firebase Realtime Database.

* **Question Management System**: Allows users to post, edit, view, and search questions. All data is stored in Firebase Realtime Database.

### Firebase Integration

Firebase provides the following backend services:

1. **Firebase Authentication**: Handles email/password-based authentication for user login.
2. **Firebase Realtime Database**: A NoSQL database for storing user data, questions, answers, and other platform-related information.
3. **Firebase Storage**: Manages file storage for user-uploaded images.

## Project Structure

The project is organized in a standard ASP.NET MVC structure:

```
Frontend/
├── App_Start/              # Application initialization
│   ├── BundleConfig.cs     # JS and CSS bundles
│   ├── FilterConfig.cs     # Global filters
│   ├── RouteConfig.cs      # URL routing
│   └── StartUp.Auth.cs     # Authentication setup
├── Controllers/            # MVC controllers
│   ├── AccountController.cs
│   ├── HomeController.cs
│   └── QuestionController.cs
├── Models/                 # Data models
│   ├── LoginViewModel.cs
│   ├── SignUpModel.cs
│   └── UserProfileModel.cs
├── Views/                  # UI templates
│   ├── Account/            # User account views
│   ├── Home/               # Home page views
│   ├── Question/           # Question views
│   └── Shared/             # Shared views and layouts
├── Custom_Contents/        # Custom JavaScript and CSS
│   ├── All_question.js
│   ├── Post_Details.js
│   └── Search_Post.js
└── Assets/                 # Static assets (images)
```

### Main UI Components

* **Post Question**: Users can create a new question via the `Post.cshtml` form.
* **List Questions**: Questions are displayed in `AllQuestion.cshtml` and `RecentPosts.cshtml`.
* **View Question**: Detailed view of each question and its answers in `PostDetails.cshtml`.
* **Search Functionality**: Users can search for questions in `SearchPost.cshtml`.
* **Edit Questions**: Users can edit their posted questions via `EditPost.cshtml`.
* **Answer Questions**: Answers and comments can be posted in `PostDetails.cshtml`.

### User Account Life Cycle

* **Registration**: Users can sign up via `SignUp.cshtml`.
* **Authentication**: Users log in through `Login.cshtml`.
* **Profile Management**: Users can view and edit their profile in `UserProfile.cshtml`.
* **Session Management**: Session data is stored server-side.
* **Logout**: Users can log out through the `LogOff` action.

## Conclusion

AUST Overflow is a dynamic platform built using ASP.NET MVC and Firebase to offer a rich set of features such as user authentication, question management, and community engagement. This readme provides an overview of the system’s architecture and key components. For more in-depth details, refer to specific sections of the documentation.

For further details on the **UI structure**, check the **User Interface Structure** documentation. For more on the **authentication system**, see the **Authentication System** documentation.
