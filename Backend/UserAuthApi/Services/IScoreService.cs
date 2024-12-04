using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UserAuthApi.Models;

namespace UserAuthApi.Services
{
    public interface IScoreService
    {
        Task SubmitScoreAsync(Score score);
        Task<List<LeaderboardEntry>> GetLeaderboardAsync(int top);
        Task<int?> GetHighestScoreAsync(string username);
    }
}
