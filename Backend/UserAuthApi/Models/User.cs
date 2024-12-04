using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace UserAuthApi.Models
{
    public class User
    {
        [BsonId]  // This will ensure MongoDB auto-generates the _id field
        public ObjectId Id { get; set; } // MongoDB will automatically generate this

        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
    }
}
