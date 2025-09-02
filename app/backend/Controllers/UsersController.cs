// using IoTM.Data;
// using IoTM.Models;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace IoTM.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class UsersController : ControllerBase
//     {
//         private readonly ApplicationDbContext _context;

//         public UsersController(ApplicationDbContext context)
//         {
//             _context = context;
//         }

//         // GET: /api/users
//         [HttpGet]
//         public async Task<IActionResult> GetAllUsers()
//         {
//             var users = await _context.Users
//                 .Include(u => u.MedicalProfile)
//                 .Include(u => u.MedicalConditions)
//                 .Include(u => u.FamilyHistories)
//                 .Include(u => u.Medications)
//                 .Include(u => u.Allergies)
//                 .Include(u => u.ConnectedDevices)
//                 .Include(u => u.HealthMetrics)
//                 .Include(u => u.UserScreenings)
//                 .Include(u => u.HealthAlerts)
//                 .ToListAsync();

//             return Ok(users);
//         }

//         // GET: /api/users/{id}
//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetUserById(Guid id)
//         {
//             var user = await _context.Users
//                 .Include(u => u.MedicalProfile)
//                 .Include(u => u.MedicalConditions)
//                 .Include(u => u.FamilyHistories)
//                 .Include(u => u.Medications)
//                 .Include(u => u.Allergies)
//                 .Include(u => u.ConnectedDevices)
//                 .Include(u => u.HealthMetrics)
//                 .Include(u => u.UserScreenings)
//                 .Include(u => u.HealthAlerts)
//                 .FirstOrDefaultAsync(u => u.UserId == id);

//             if (user == null)
//                 return NotFound();

//             return Ok(user);
//         }
//     }
// }

using IoTM.Data;
using IoTM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /api/users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            // Only fetch data from the 'users' table
            var users = await _context.Users
                .AsNoTracking() // optional, improves performance for read-only queries
                .ToListAsync();

            return Ok(users);
        }

        // GET: /api/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound();

            return Ok(user);
        }
    }
}

