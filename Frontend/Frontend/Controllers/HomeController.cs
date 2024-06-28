using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Controllers
{
    
    public class HomeController : Controller
    {
        private static string Bucket = "https://aust-overflow-default-rtdb.firebaseio.com";
        private static string Apikey = "AIzaSyAse483WtEgu5ODHwmJT_QwHzPBeN-tCMs";
        private static string AuthEmail = "";
        private static string AuthPassword = "";

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}