using MongoDB.Bson;  // Ensure this is at the top of your file

public class Score
{
    public ObjectId Id { get; set; }  // MongoDB will handle _id automatically
    public string Username { get; set; }
    public int Points { get; set; }
    public DateTime Date { get; set; }
}
