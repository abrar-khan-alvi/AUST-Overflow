using Firebase.Auth;
using Firebase.Database;
using Firebase.Database.Query;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Frontend.Models;

namespace Frontend.Controllers
{

    public class AccountController : Controller
    {
        private static string DatabaseUrl = "https://aust-overflow-default-rtdb.firebaseio.com"; 
        private static string ApiKey = "AIzaSyAse483WtEgu5ODHwmJT_QwHzPBeN-tCMs";

        // GET: Account
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
                try
                {
                    var auth = new FirebaseAuthProvider(new FirebaseConfig(ApiKey));
                    var firebaseAuthLink = await auth.CreateUserWithEmailAndPasswordAsync(model.Email, model.Password, model.Username, true);

                    var firebaseClient = new FirebaseClient(DatabaseUrl, new FirebaseOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(firebaseAuthLink.FirebaseToken)
                    });

                    await firebaseClient
                        .Child("Users")
                        .Child(firebaseAuthLink.User.LocalId)
                        .PutAsync(new
                        {
                            model.Username,
                            model.Name,
                            model.Department,
                            model.Email
                        });

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
                        SignInUser(user.Email, token, false);
                        return RedirectToLocal(returnUrl);
                    }
                    else
                    {
                        ModelState.AddModelError(string.Empty, "Invalid username or password.");
                    }
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError(string.Empty, ex.Message);
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
            return RedirectToAction("Login", "Account");
        }
    }
}
