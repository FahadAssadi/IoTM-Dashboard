using Microsoft.EntityFrameworkCore;
using IoTM.Data; // This is the new namespace for your DbContext
using DotNetEnv;
using IoTM.Config;
using IoTM.Services;

var builder = WebApplication.CreateBuilder(args);

// Load .env variables from backend project root
Env.Load();

// Get Supabase DB connection string from environment variable
var connectionString = Environment.GetEnvironmentVariable("SUPABASE_DB_CONNECTION");

if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("SUPABASE_DB_CONNECTION environment variable not found");
}

// Register EF Core DbContext with Npgsql using Supabase connection string
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Config stuff
builder.Services.Configure<HealthThresholds>(
    builder.Configuration.GetSection("HealthThresholds"));
// Register HealthSegmenter as singleton (safe if thresholds don't change)
builder.Services.AddSingleton<HealthSegmenter>();


// Add services to the container.
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add HttpClient for external API calls
builder.Services.AddHttpClient<IoTM.Services.INewsService, IoTM.Services.NewsService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "IoTM-Dashboard/1.0");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Register custom services
builder.Services.AddScoped<IoTM.Services.INewsService, IoTM.Services.NewsService>();
builder.Services.AddScoped<IoTM.Services.IScreeningGuidelineService, IoTM.Services.ScreeningGuidelineService>();
builder.Services.AddScoped<IoTM.Services.IUserScreeningsService, IoTM.Services.UserScreeningsService>();

// Swagger setup
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "IoT-M Dashboard Backend API",
        Version = "v1"
    });
});

var app = builder.Build();

// HTTP pipeline config
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "IoT-M Dashboard Backend API V1");
        options.RoutePrefix = "";
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();