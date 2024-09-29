using Microsoft.AspNetCore.Mvc;

namespace PeerLandingFE.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
