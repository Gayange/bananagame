using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserAuthApi.Services;
using UserAuthApi.Models;
using MongoDB.Bson;
using System;
using System.Threading.Tasks;

namespace UserAuthApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GameController : ControllerBase
    {
        private readonly IScoreService _scoreService;

        public GameController(IScoreService scoreService)
        {
            _scoreService = scoreService;
        }

[HttpPost("submit-score")]
public async Task<IActionResult> SubmitScore([FromBody] ScoreSubmitRequest request)
{
    // Validate input
    if (string.IsNullOrEmpty(request.Username) || request.Points < 0)
    {
        return BadRequest("Invalid input data.");
    }

    // Ensure username from request matches authenticated user
    var username = User.Identity?.Name; // Safely access Name property
    if (username != request.Username)
    {
        return Unauthorized("Username does not match authenticated user.");
    }

    var newScore = new Score
    {
        Id = ObjectId.GenerateNewId(), // Let MongoDB handle the _id
        Username = request.Username,
        Points = request.Points,
        Date = request.Date.Date // Use Date.Date to ensure only the date part is considered
    };

    try
    {
        await _scoreService.SubmitScoreAsync(newScore);
        return Ok("Score submitted successfully.");
    }
    catch (Exception ex)
    {
        // Log the detailed exception message for debugging
        Console.WriteLine($"Error: {ex.Message}");
        return BadRequest($"Error submitting score: {ex.Message}");
    }
}

        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard(int top = 10)
        {
            // Validate input
            if (top <= 0)
            {
                return BadRequest("Invalid number of leaderboard entries.");
            }

            try
            {
                var leaderboard = await _scoreService.GetLeaderboardAsync(top);

                if (leaderboard == null || leaderboard.Count == 0)
                {
                    return NotFound("No scores found.");
                }

                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching leaderboard: {ex.Message}");
            }
        }

        [HttpGet("get-highest-score")]
        public async Task<IActionResult> GetHighestScore()
        {
            var username = User.Identity?.Name; // Safely access Name property

            try
            {
                var highestScore = await _scoreService.GetHighestScoreAsync(username);

                if (highestScore == null)
                {
                    return NotFound("No scores found for the user.");
                }

                return Ok(new { Username = username, HighestScore = highestScore });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving highest score: {ex.Message}");
            }
        }
    }

    // ScoreSubmitRequest class included here
    public class ScoreSubmitRequest
{
    public string Username { get; set; }
    public int Points { get; set; }
    public DateTime Date { get; set; } // Date field
}

}
