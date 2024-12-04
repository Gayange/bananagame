using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UserAuthApi.Models;

namespace UserAuthApi.Services
{
    public class MongoDBService
    {
        private readonly IMongoCollection<User> _userCollection;
        private readonly IMongoCollection<Score> _scoreCollection;

        // Constructor to initialize the MongoDB client and database
        public MongoDBService(string connectionString, string databaseName)
        {
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new ArgumentNullException(nameof(connectionString), "MongoDB connection string is missing.");
            }

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            _userCollection = database.GetCollection<User>("Users");
            _scoreCollection = database.GetCollection<Score>("Scores");
        }

        // User Methods

        // Method to get the User collection
        public IMongoCollection<User> GetUserCollection()
        {
            return _userCollection;
        }

        // Method to get a user by name
        public async Task<User> GetUserByNameAsync(string name)
        {
            var filter = Builders<User>.Filter.Eq("Name", name);
            return await _userCollection.Find(filter).FirstOrDefaultAsync();
        }

        // Method to get a user by ID
        public async Task<User> GetUserByIdAsync(string userId)
        {
            var filter = Builders<User>.Filter.Eq("_id", ObjectId.Parse(userId));
            return await _userCollection.Find(filter).FirstOrDefaultAsync();
        }

        // Method to add a new user
        public async Task AddUserAsync(User user)
        {
            await _userCollection.InsertOneAsync(user);  // MongoDB will auto-generate the _id
        }

        // Method to update user details
        public async Task UpdateUserAsync(User updatedUser)
        {
            var filter = Builders<User>.Filter.Eq("_id", updatedUser.Id);
            await _userCollection.ReplaceOneAsync(filter, updatedUser);
        }

        // Method to delete a user by ID
        public async Task DeleteUserAsync(string userId)
        {
            var filter = Builders<User>.Filter.Eq("_id", ObjectId.Parse(userId));
            await _userCollection.DeleteOneAsync(filter);
        }

        // Score Methods

        // Method to get the Score collection
        public IMongoCollection<Score> GetScoreCollection()
        {
            return _scoreCollection;
        }

        // Method to get the highest score for a given user
        public async Task<int?> GetHighestScoreAsync(string username)
        {
            try
            {
                var highestScore = await _scoreCollection
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

        // Method to submit a new score if it is the highest score or the first submission for the day
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

                // Perform the upsert operation
                await _scoreCollection.ReplaceOneAsync(filter, score, options);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error submitting score", ex);
            }
        }

        // Method to retrieve the top N scores for the leaderboard
        public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(int top)
        {
            try
            {
                // Fetch the top N scores, sorted by points (descending), then by date
                var leaderboard = await _scoreCollection
                    .Find(Builders<Score>.Filter.Empty)
                    .SortByDescending(s => s.Points)
                    .ThenBy(s => s.Date)
                    .Limit(top)
                    .ToListAsync();

                // Return the leaderboard as a list of LeaderboardEntry objects
                return leaderboard.ConvertAll(score => new LeaderboardEntry
                {
                    Username = score.Username,
                    Points = score.Points,
                    Date = score.Date
                });
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error fetching leaderboard", ex);
            }
        }
    }
}
