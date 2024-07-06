using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Models
{
    public class QuestionController : Controller
    {

        public ActionResult Post()
        {
            if (Session["Email"] == null)
            {
                // Redirect to login if the session email is null
                return RedirectToAction("Login", "Account");
            }

            return View();
        }
        public ActionResult AllQuestion()
        {

            return View();
        }
        public ActionResult PostDetails(string id)
        {
            ViewBag.PostId = id;
            return View();
        }
        public ActionResult SearchPost()
        {

            return View();
        }
    }
}
