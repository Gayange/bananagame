using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using UserAuthApi.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Fetch and configure JWT settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;  // Set to true for production (use HTTPS)
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,  // Set to true if you want to validate the issuer
            ValidateAudience = false,  // Set to true if you want to validate the audience
            ValidateLifetime = true,  // Validate the expiration of the token
            IssuerSigningKey = new SymmetricSecurityKey(key),  // The symmetric key used for signing the token
            ClockSkew = TimeSpan.Zero  // No tolerance for token expiration
        };
    });

// Fetch and configure MongoDB settings
var mongoDbSettings = builder.Configuration.GetSection("MongoDbSettings");

// Register MongoDB service as a singleton, ensuring it's available throughout the application's lifecycle
builder.Services.AddSingleton<MongoDBService>(sp =>
    new MongoDBService(mongoDbSettings["ConnectionString"], mongoDbSettings["DatabaseName"])
);

// Add other necessary services, like IScoreService, if required
builder.Services.AddScoped<IScoreService, ScoreService>();

// Add Swagger for API documentation
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "UserAuthApi",
        Version = "v1",
        Description = "API for user authentication and score submission."
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "UserAuthApi v1");
        c.RoutePrefix = string.Empty;  // Show Swagger UI at the root URL
    });
}

// Enable authentication and authorization middleware
app.UseRouting();  // Routing middleware must be called before authentication and authorization

app.UseAuthentication();  // Authentication middleware
app.UseAuthorization();   // Authorization middleware

app.UseHttpsRedirection();

// Map controllers to endpoints
app.MapControllers();

app.Run();
