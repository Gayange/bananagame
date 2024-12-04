using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using UserAuthApi.Services;

namespace UserAuthApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

public void ConfigureServices(IServiceCollection services)
{
    // Configure MongoDB settings and client
    services.Configure<MongoDBSettings>(Configuration.GetSection("MongoDBSettings"));

    // Register MongoDBService with necessary parameters
    services.AddSingleton<MongoDBService>(provider =>
    {
        var settings = Configuration.GetSection("MongoDBSettings").Get<MongoDBSettings>();
        return new MongoDBService(settings.ConnectionString, settings.DatabaseName);
    });

    // Register ScoreService with Scoped lifetime
    services.AddScoped<IScoreService, ScoreService>();

    // Enable CORS
    services.AddCors(options =>
    {
        options.AddPolicy("AllowAllOrigins", builder =>
        {
            builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        });
    });

    // Add controllers
    services.AddControllers();

    // Add Swagger services for API documentation
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "UserAuth API",
            Version = "v1",
            Description = "API for User Authentication"
        });
    });
}


        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Enable CORS for all origins
            app.UseCors("AllowAllOrigins");

            // Enable Swagger only in Development environment
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "UserAuth API V1");
                    c.RoutePrefix = ""; // Makes Swagger UI accessible at the root
                });
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
