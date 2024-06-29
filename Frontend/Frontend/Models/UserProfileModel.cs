using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Frontend.Models
{
    public class UserProfileModel
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Department { get; set; }
        public string Email { get; set; }
        public string Avatar { get; set; }
        public int Reputation { get; set; }
        public string QuestionsAsked { get; set; }
        public string  AnswersProvided { get; set; }
        public string CommentsMade { get; set; }
    }
}