using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UserAuthApi.Models;

namespace UserAuthApi.Services
{
    public class ScoreService : IScoreService
    {
        private readonly MongoDBService _mongoDBService;

        public ScoreService(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }

        // Method to submit a score (integrated with the new approach)
        public async Task SubmitScoreAsync(Score score)
        {
            if (score == null)
            {
                throw new ArgumentNullException(nameof(score), "Score cannot be null.");
            }

            try
            {
                // Ensure we check if the score already exists for the given username and date.
                var filter = Builders<Score>.Filter.Eq(s => s.Username, score.Username) &
                             Builders<Score>.Filter.Eq(s => s.Date, score.Date);

                // Insert or update the score document based on the username and date using upsert
                var options = new ReplaceOptions { IsUpsert = true };

                // Perform the upsert operation without setting _id
                await _mongoDBService.GetScoreCollection().ReplaceOneAsync(filter, score, options);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error submitting score", ex);
            }
        }

        // Method to get the highest score for a given user
        public async Task<int?> GetHighestScoreAsync(string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                throw new ArgumentException("Username cannot be null or empty.", nameof(username));
            }

            try
            {
                var highestScore = await _mongoDBService.GetScoreCollection()
                    .Find(score => score.Username == username)
                    .SortByDescending(score => score.Points)
                    .FirstOrDefaultAsync();

                return highestScore?.Points;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error retrieving highest score", ex);
            }
        }

        // Method to retrieve the leaderboard
        public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(int top)
        {
            if (top <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(top), "Top must be greater than zero.");
            }

            try
            {
                var leaderboard = await _mongoDBService.GetScoreCollection()
                    .Find(Builders<Score>.Filter.Empty)
                    .SortByDescending(s => s.Points)
                    .Limit(top)
                    .ToListAsync();

                return leaderboard.Select(score => new LeaderboardEntry
                {
                    Username = score.Username,
                    Points = score.Points,
                    Date = score.Date
                }).ToList();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error fetching leaderboard", ex);
            }
        }
    }
}
