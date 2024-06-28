using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Frontend.App_Start.StartUp))]
namespace Frontend.App_Start
{
    public partial class StartUp
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}