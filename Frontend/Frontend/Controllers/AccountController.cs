using Firebase.Auth;
using Firebase.Database;
using Firebase.Database.Query;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Frontend.Models;
using System.Linq;

namespace Frontend.Controllers
{
    public class AccountController : Controller
    {
        private static string DatabaseUrl = "https://aust-overflow-default-rtdb.firebaseio.com";
        private static string ApiKey = "AIzaSyAse483WtEgu5ODHwmJT_QwHzPBeN-tCMs";

        public ActionResult SignUp()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> SignUp(SignUpModel model)
        {
            if (ModelState.IsValid)
            {
                if (model.Password != model.ConfirmPassword)
                {
                    ModelState.AddModelError(string.Empty, "Passwords do not match.");
                    return View(model);
                }

                try
                {
                    var auth = new FirebaseAuthProvider(new FirebaseConfig(ApiKey));
                    var firebaseAuthLink = await auth.CreateUserWithEmailAndPasswordAsync(model.Email, model.Password, model.Username, true);

                    var firebaseClient = new FirebaseClient(DatabaseUrl, new FirebaseOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(firebaseAuthLink.FirebaseToken)
                    });

                    var user = new
                    {
                        model.Username,
                        model.Name,
                        model.Department,
                        model.Email,
                        Avatar = "",
                        Reputation = 0,
                        QuestionsAsked = "",
                        AnswersProvided = "",
                        CommentsMade = ""
                    };

                    await firebaseClient
                        .Child("users")
                        .Child(firebaseAuthLink.User.LocalId)
                        .PutAsync(user);

                    ModelState.AddModelError(string.Empty, "Please verify your email before logging in.");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError(string.Empty, ex.Message);
                }
            }

            return View(model);
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult Login(string returnUrl)
        {
            if (Request.IsAuthenticated)
            {
                return RedirectToLocal(returnUrl);
            }

            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Login(LoginViewModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var auth = new FirebaseAuthProvider(new FirebaseConfig(ApiKey));
                    var authLink = await auth.SignInWithEmailAndPasswordAsync(model.Email, model.Password);
                    string token = authLink.FirebaseToken;
                    var user = authLink.User;

                    if (!string.IsNullOrEmpty(token))
                    {
                        // Sign in the user
                        SignInUser(user.Email, token, false);

                        // Retrieve user details from Firebase
                        var userId = user.LocalId;
                        var userName = user.DisplayName; // Assuming the user's display name is set

                        // Store user details in session
                        Session["Email"] = model.Email;
                        Session["Password"] = model.Password;
                        Session["UserId"] = userId;
                        Session["UserName"] = userName;

                        return RedirectToAction("UserProfile", "Account");
                    }
                    else
                    {
                        ModelState.AddModelError(string.Empty, "Invalid username or password.");
                    }
                }
                catch (Exception ex)
                {
                    if (ex.Message.Contains("INVALID_PASSWORD") || ex.Message.Contains("EMAIL_NOT_FOUND"))
                    {
                        ModelState.AddModelError(string.Empty, "User not found. Please register.");
                    }
                    else
                    {
                        ModelState.AddModelError(string.Empty, ex.Message);
                    }
                }
            }

            return View(model);
        }


        private void SignInUser(string email, string token, bool isPersistent)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Authentication, token)
            };
            var claimIdentities = new ClaimsIdentity(claims, DefaultAuthenticationTypes.ApplicationCookie);
            var ctx = Request.GetOwinContext();
            var authenticationManager = ctx.Authentication;
            authenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = isPersistent }, claimIdentities);
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }

            return RedirectToAction("LogOff", "Account");
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult LogOff()
        {
            var ctx = Request.GetOwinContext();
            var authenticationManager = ctx.Authentication;
            authenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);

            // Clear the session
            Session.Clear();
            Session.Abandon();

            return RedirectToAction("Login", "Account");
        }

        public async Task<ActionResult> UserProfile()
        {
            // Check if the session email is null
            if (Session["Email"] == null)
            {
                // Redirect to login if the session email is null
                return RedirectToAction("Login", "Account");
            }

            var email = Session["Email"].ToString();
            var token = ((ClaimsIdentity)User.Identity).FindFirst(ClaimTypes.Authentication).Value;

            var firebaseClient = new FirebaseClient(DatabaseUrl, new FirebaseOptions
            {
                AuthTokenAsyncFactory = () => Task.FromResult(token)
            });

            // Retrieve all users and filter by email
            var users = await firebaseClient
                .Child("users")
                .OnceAsync<UserProfileModel>();

            var userData = users.FirstOrDefault(u => u.Object.Email == email)?.Object;

            if (userData == null)
            {
                return RedirectToAction("Login", "Account");
            }

            return View(userData);
        }
    }
}
