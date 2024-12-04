using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserAuthApi.Models;
using UserAuthApi.Services;
using Microsoft.IdentityModel.Tokens;
using System.Threading.Tasks;
using System;

namespace UserAuthApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;
        private readonly IConfiguration _configuration;

        public AuthController(MongoDBService mongoDBService, IConfiguration configuration)
        {
            _mongoDBService = mongoDBService;
            _configuration = configuration;
        }

        // Signup API endpoint
        [HttpPost("signup")]
public async Task<IActionResult> Signup([FromBody] RegisterRequest request)
{
    var existingUser = await _mongoDBService.GetUserByNameAsync(request.Name);
    if (existingUser != null)
    {
        return BadRequest("Name is already in use.");
    }

    var newUser = new User
    {
        Name = request.Name,
        Email = request.Email,
        Password = request.Password,  // Make sure to hash the password
        PhoneNumber = request.PhoneNumber
        // No RefreshToken field here
    };

    await _mongoDBService.AddUserAsync(newUser);

    return Ok("User registered successfully.");
}

        // Login API endpoint
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _mongoDBService.GetUserByNameAsync(request.Name);
            if (user == null || user.Password != request.Password) // You should verify hashed password here
            {
                return Unauthorized("Invalid credentials.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Success = true,
                Message = "Login successful.",
                UserId = user.Id.ToString(),
                UserName = user.Name,
                Token = token
            });
        }

        // Profile Update Endpoint
        [Authorize]
        [HttpPut("User/{userId}/update")]
        public async Task<IActionResult> UpdateProfile(string userId, [FromBody] UpdateProfileRequest request)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required.");
            }

            var user = await _mongoDBService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Update user fields
            user.Name = request.Name;
            user.Email = request.Email;
            user.Password = request.Password;
            user.PhoneNumber = request.PhoneNumber;

            await _mongoDBService.UpdateUserAsync(user);

            return Ok(new { Message = "Profile updated successfully." });
        }

        // Profile Delete Endpoint
        [Authorize]
        [HttpDelete("User/{userId}/delete")]
        public async Task<IActionResult> DeleteProfile(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required.");
            }

            var user = await _mongoDBService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            await _mongoDBService.DeleteUserAsync(userId);

            return Ok(new { Message = "Profile deleted successfully." });
        }

        [Authorize]
[HttpGet("User/{userId}")]
public async Task<IActionResult> GetUserProfile(string userId)
{
    if (string.IsNullOrEmpty(userId))
    {
        return BadRequest("User ID is required.");
    }

    var user = await _mongoDBService.GetUserByIdAsync(userId);
    if (user == null)
    {
        return NotFound("User not found.");
    }

    // Create an anonymous object to return without the RefreshToken
    var userProfile = new
    {
        user.Id,
        user.Name,
        user.Email,
        user.PhoneNumber
    };

    return Ok(userProfile);  // Return the updated profile without the RefreshToken
}

        // Method to generate JWT token
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);
            var claims = new[]
            {
                new Claim("UserId", user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: credentials
            );

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.WriteToken(tokenDescriptor);

            return token;
        }
    }
}
