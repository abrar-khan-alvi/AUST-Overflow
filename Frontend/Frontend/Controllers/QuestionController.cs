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


        public ActionResult RecentPosts()

        {
            return View();
        }
        public ActionResult EditPost(string id)

        {
            ViewBag.PostId = id;
            return View();
        }
    }
}
