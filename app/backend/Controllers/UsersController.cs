<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
using IoTM.Data;
using IoTM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
<<<<<<< Updated upstream
=======
using System.ComponentModel.DataAnnotations;
>>>>>>> Stashed changes

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
<<<<<<< Updated upstream

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
=======
        private readonly ILogger<UsersController> _logger;

        public UsersController(ApplicationDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
>>>>>>> Stashed changes
        }

        // GET: /api/users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
<<<<<<< Updated upstream
            // Only fetch data from the 'users' table
            var users = await _context.Users
                .AsNoTracking() // optional, improves performance for read-only queries
=======
            var users = await _context.Users
                .AsNoTracking()
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
        // Update your GetUserProfile method to include the avatar URL
        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetUserProfile(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.MedicalConditions)
                    .Include(u => u.FamilyHistories)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserId == id);

                if (user == null)
                {
                    return NotFound(new UserProfileResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var response = new UserProfileResponse
                {
                    Success = true,
                    Message = "User profile retrieved successfully",
                    User = new UserProfileData
                    {
                        UserId = user.UserId,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        DateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd"),
                        Sex = user.Sex?.ToString(),
                        PhoneNumber = user.PhoneNumber,
                        CountryCode = user.CountryCode,
                        Timezone = user.Timezone,
                        AvatarUrl = user.AvatarUrl // Add this line
                    },
                    MedicalConditions = user.MedicalConditions?.Select(mc => mc.ConditionName).ToList() ?? new List<string>(),
                    FamilyHistory = user.FamilyHistories?.Select(fh => fh.ConditionName).ToList() ?? new List<string>()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserProfile endpoint for userId: {UserId}", id);
                return StatusCode(500, new UserProfileResponse
                {
                    Success = false,
                    Message = "Internal server error occurred while fetching user profile"
                });
            }
        }

// Add these methods to your UsersController class

        // POST: api/users/{id}/avatar - Upload avatar image
        [HttpPost("{id}/avatar")]
        public async Task<IActionResult> UploadAvatar(Guid id, IFormFile avatar)
        {
            try
            {
                _logger.LogInformation("Avatar upload called for userId: {UserId}", id);

                // Validate user exists
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null)
                {
                    _logger.LogWarning("User not found for userId: {UserId}", id);
                    return NotFound(new { Success = false, Message = "User not found" });
                }

                // Validate file
                if (avatar == null || avatar.Length == 0)
                {
                    return BadRequest(new { Success = false, Message = "No file uploaded" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(avatar.ContentType.ToLower()))
                {
                    return BadRequest(new { Success = false, Message = "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." });
                }

                // Validate file size (max 5MB)
                if (avatar.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { Success = false, Message = "File size too large. Maximum size is 5MB." });
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                    _logger.LogInformation("Created uploads directory: {Path}", uploadsPath);
                }

                // Generate unique filename
                var fileExtension = Path.GetExtension(avatar.FileName).ToLower();
                var fileName = $"{id}_{DateTime.UtcNow.Ticks}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Delete old avatar file if exists
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    var oldFileName = Path.GetFileName(user.AvatarUrl);
                    var oldFilePath = Path.Combine(uploadsPath, oldFileName);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                        _logger.LogInformation("Deleted old avatar file: {Path}", oldFilePath);
                    }
                }

                // Save new file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await avatar.CopyToAsync(stream);
                }

                // Update user record
                var avatarUrl = $"/uploads/avatars/{fileName}";
                user.AvatarUrl = avatarUrl;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Avatar uploaded successfully for userId: {UserId}, URL: {AvatarUrl}", id, avatarUrl);

                return Ok(new { 
                    Success = true, 
                    Message = "Avatar uploaded successfully", 
                    AvatarUrl = avatarUrl 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading avatar for userId: {UserId}", id);
                return StatusCode(500, new { Success = false, Message = $"Error uploading avatar: {ex.Message}" });
            }
        }

        // DELETE: api/users/{id}/avatar - Remove avatar
        [HttpDelete("{id}/avatar")]
        public async Task<IActionResult> DeleteAvatar(Guid id)
        {
            try
            {
                _logger.LogInformation("Avatar deletion called for userId: {UserId}", id);

                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (user == null)
                {
                    return NotFound(new { Success = false, Message = "User not found" });
                }

                if (string.IsNullOrEmpty(user.AvatarUrl))
                {
                    return BadRequest(new { Success = false, Message = "User has no avatar to delete" });
                }

                // Delete file
                var fileName = Path.GetFileName(user.AvatarUrl);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars", fileName);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    _logger.LogInformation("Deleted avatar file: {Path}", filePath);
                }

                // Update user record
                user.AvatarUrl = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Avatar deleted successfully for userId: {UserId}", id);

                return Ok(new { Success = true, Message = "Avatar deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting avatar for userId: {UserId}", id);
                return StatusCode(500, new { Success = false, Message = $"Error deleting avatar: {ex.Message}" });
            }
        }

>>>>>>> Stashed changes
        // PATCH: api/users/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchUser(Guid id, [FromBody] User patchData)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Only update fields that are provided (not null)
            if (!string.IsNullOrEmpty(patchData.FirstName))
                user.FirstName = patchData.FirstName;

            if (!string.IsNullOrEmpty(patchData.LastName))
                user.LastName = patchData.LastName;

            if (!string.IsNullOrEmpty(patchData.PhoneNumber))
                user.PhoneNumber = patchData.PhoneNumber;

<<<<<<< Updated upstream
            // Save changes
=======
            user.UpdatedAt = DateTime.UtcNow;

>>>>>>> Stashed changes
            await _context.SaveChangesAsync();

            return Ok(user);
        }
<<<<<<< Updated upstream
    }
}

=======

        // Replace your UpdateUserProfile method with this corrected version
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateUserProfile(Guid id, [FromBody] UpdateUserProfileRequest request)
        {
            try
            {
                _logger.LogInformation("UpdateUserProfile called for userId: {UserId}", id);
                _logger.LogInformation("Request data: FirstName={FirstName}, LastName={LastName}, DateOfBirth={DateOfBirth}, Sex={Sex}, PhoneNumber={PhoneNumber}", 
                    request.FirstName, request.LastName, request.DateOfBirth, request.Sex, request.PhoneNumber);
                
                if (request.MedicalConditions != null)
                    _logger.LogInformation("Medical conditions count: {Count}", request.MedicalConditions.Count);
                
                if (request.FamilyHistory != null)
                    _logger.LogInformation("Family history count: {Count}", request.FamilyHistory.Count);

                // Step 1: Find the user WITHOUT Include to avoid tracking issues
                _logger.LogInformation("Finding user with ID (basic query): {UserId}", id);
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == id);

                if (user == null)
                {
                    _logger.LogWarning("User not found for userId: {UserId}", id);
                    return NotFound(new { Success = false, Message = "User not found" });
                }

                _logger.LogInformation("User found: {FirstName} {LastName}", user.FirstName, user.LastName);

                // Step 2: Update basic user info
                _logger.LogInformation("Starting basic user info update");
                
                if (!string.IsNullOrEmpty(request.FirstName))
                {
                    _logger.LogInformation("Updating FirstName from '{Old}' to '{New}'", user.FirstName, request.FirstName);
                    user.FirstName = request.FirstName;
                }
                
                if (!string.IsNullOrEmpty(request.LastName))
                {
                    _logger.LogInformation("Updating LastName from '{Old}' to '{New}'", user.LastName, request.LastName);
                    user.LastName = request.LastName;
                }

                if (!string.IsNullOrEmpty(request.DateOfBirth))
                {
                    _logger.LogInformation("Attempting to parse DateOfBirth: {DateOfBirth}", request.DateOfBirth);
                    if (DateOnly.TryParse(request.DateOfBirth, out var dateOfBirth))
                    {
                        user.DateOfBirth = dateOfBirth;
                        _logger.LogInformation("Successfully updated DateOfBirth to: {DateOfBirth}", dateOfBirth);
                    }
                    else
                    {
                        _logger.LogError("Failed to parse DateOfBirth: {DateOfBirth}", request.DateOfBirth);
                        return BadRequest(new { Success = false, Message = $"Invalid date format: {request.DateOfBirth}" });
                    }
                }

                if (!string.IsNullOrEmpty(request.Sex))
                {
                    _logger.LogInformation("Attempting to parse Sex: {Sex}", request.Sex);
                    if (Enum.TryParse<Sex>(request.Sex, true, out var sex))
                    {
                        user.Sex = sex;
                        _logger.LogInformation("Successfully updated Sex to: {Sex}", sex);
                    }
                    else
                    {
                        _logger.LogError("Failed to parse Sex: {Sex}", request.Sex);
                        return BadRequest(new { Success = false, Message = $"Invalid sex value: {request.Sex}" });
                    }
                }

                if (!string.IsNullOrEmpty(request.PhoneNumber))
                {
                    _logger.LogInformation("Updating PhoneNumber to: {PhoneNumber}", request.PhoneNumber);
                    user.PhoneNumber = request.PhoneNumber;
                }

                if (!string.IsNullOrEmpty(request.CountryCode))
                {
                    _logger.LogInformation("Updating CountryCode to: {CountryCode}", request.CountryCode);
                    user.CountryCode = request.CountryCode;
                }

                if (!string.IsNullOrEmpty(request.Timezone))
                {
                    _logger.LogInformation("Updating Timezone to: {Timezone}", request.Timezone);
                    user.Timezone = request.Timezone;
                }

                // Save basic user info first
                user.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("Saving basic user info changes");
                
                try
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Basic user info saved successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to save basic user info");
                    return StatusCode(500, new { Success = false, Message = $"Failed to save basic user info: {ex.Message}" });
                }

                // Step 3: Handle medical conditions with separate operations
                if (request.MedicalConditions != null)
                {
                    _logger.LogInformation("Processing medical conditions. Count: {Count}", request.MedicalConditions.Count);
                    
                    try
                    {
                        // Remove existing conditions using a separate query
                        _logger.LogInformation("Removing existing medical conditions for user");
                        var existingConditions = await _context.MedicalConditions
                            .Where(mc => mc.UserId == id)
                            .ToListAsync();
                        
                        if (existingConditions.Any())
                        {
                            _logger.LogInformation("Found {Count} existing medical conditions to remove", existingConditions.Count);
                            _context.MedicalConditions.RemoveRange(existingConditions);
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Existing medical conditions removed");
                        }

                        // Add new conditions using direct context operations
                        _logger.LogInformation("Adding new medical conditions");
                        foreach (var conditionName in request.MedicalConditions)
                        {
                            _logger.LogInformation("Adding medical condition: {ConditionName}", conditionName);
                            
                            var newCondition = new MedicalCondition
                            {
                                ConditionId = Guid.NewGuid(),
                                UserId = id,
                                ConditionName = conditionName,
                                Severity = Severity.unknown,
                                Status = ConditionStatus.active,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            
                            // Add directly to context, not to navigation property
                            _context.MedicalConditions.Add(newCondition);
                        }
                        
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Medical conditions saved successfully");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing medical conditions");
                        return StatusCode(500, new { Success = false, Message = $"Error saving medical conditions: {ex.Message}" });
                    }
                }

                // Step 4: Handle family history with separate operations
                if (request.FamilyHistory != null)
                {
                    _logger.LogInformation("Processing family history. Count: {Count}", request.FamilyHistory.Count);
                    
                    try
                    {
                        // Remove existing family history using a separate query
                        _logger.LogInformation("Removing existing family history for user");
                        var existingHistory = await _context.FamilyHistories
                            .Where(fh => fh.UserId == id)
                            .ToListAsync();
                        
                        if (existingHistory.Any())
                        {
                            _logger.LogInformation("Found {Count} existing family history records to remove", existingHistory.Count);
                            _context.FamilyHistories.RemoveRange(existingHistory);
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Existing family history removed");
                        }

                        // Add new family history using direct context operations
                        _logger.LogInformation("Adding new family history records");
                        foreach (var conditionName in request.FamilyHistory)
                        {
                            _logger.LogInformation("Adding family history: {ConditionName}", conditionName);
                            
                            var newHistory = new FamilyHistory
                            {
                                HistoryId = Guid.NewGuid(),
                                UserId = id,
                                Relationship = Relationship.other, // Default to 'other' since we don't collect specific relationship
                                ConditionName = conditionName,
                                CreatedAt = DateTime.UtcNow
                            };
                            
                            // Add directly to context, not to navigation property
                            _context.FamilyHistories.Add(newHistory);
                        }
                        
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Family history saved successfully");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing family history");
                        return StatusCode(500, new { Success = false, Message = $"Error saving family history: {ex.Message}" });
                    }
                }

                _logger.LogInformation("UpdateUserProfile completed successfully for userId: {UserId}", id);
                return Ok(new { Success = true, Message = "User profile updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in UpdateUserProfile for userId: {UserId}", id);
                return StatusCode(500, new { Success = false, Message = $"Internal server error: {ex.Message}" });
            }
        }
        // GET: api/users/medical-conditions/available
        [HttpGet("medical-conditions/available")]
        public ActionResult<List<string>> GetAvailableMedicalConditions()
        {
            var conditions = new List<string>
            {
                "Hypertension (High Blood Pressure)",
                "Diabetes",
                "Asthma",
                "Heart Disease",
                "Arthritis",
                "Cancer",
                "Depression/Anxiety",
                "Thyroid Disorder",
                "Migraine",
                "Other"
            };

            return Ok(conditions);
        }

        // GET: api/users/family-history/available
        [HttpGet("family-history/available")]
        public ActionResult<List<string>> GetAvailableFamilyConditions()
        {
            var conditions = new List<string>
            {
                "Hypertension (High Blood Pressure)",
                "Diabetes",
                "Heart Disease",
                "Stroke",
                "Cancer",
                "Alzheimer's/Dementia",
                "Mental Health Disorders",
                "Thyroid Disorders",
                "Autoimmune Disorders",
                "Other"
            };

            return Ok(conditions);
        }
    }

    // Response and request models
    public class UserProfileResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public UserProfileData? User { get; set; }
        public List<string> MedicalConditions { get; set; } = new();
        public List<string> FamilyHistory { get; set; } = new();
    }

    public class UserProfileData
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? DateOfBirth { get; set; } // String for frontend compatibility
        public string? Sex { get; set; }
        public string? PhoneNumber { get; set; }
        public string? CountryCode { get; set; }
        public string? City { get; set; }
        public string? Timezone { get; set; }
        public string? AvatarUrl { get; set; } // Add this line
    }

    public class UpdateUserProfileRequest
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        public string? DateOfBirth { get; set; } // Accept as string from frontend
        
        public string? Sex { get; set; }
        
        [StringLength(20)]
        public string? PhoneNumber { get; set; }
        
        [StringLength(3)]
        public string? CountryCode { get; set; }

        [StringLength(100)]
        public string? City { get; set; }
        
        [StringLength(50)]
        public string? Timezone { get; set; }

        public List<string>? MedicalConditions { get; set; }
        
        public List<string>? FamilyHistory { get; set; }
    }
}
>>>>>>> Stashed changes
