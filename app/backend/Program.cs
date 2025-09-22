using Microsoft.EntityFrameworkCore;
using IoTM.Data;
using DotNetEnv;
using IoTM.Config;
using IoTM.Services.HealthConnect;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;  

var builder = WebApplication.CreateBuilder(args);

// Load .env variables from backend project root
Env.Load();

// Get Supabase DB connection string from environment variable
var connectionString = Environment.GetEnvironmentVariable("SUPABASE_DB_CONNECTION")
    ?? throw new InvalidOperationException("SUPABASE_DB_CONNECTION is missing.");
var supabaseUrlString = Environment.GetEnvironmentVariable("SUPABASE_URL")
    ?? throw new InvalidOperationException("SUPABASE_URL is missing.");
var supabaseJwtSecret = Environment.GetEnvironmentVariable("SUPABASE_JWT_SECRET")
    ?? throw new InvalidOperationException("SUPABASE_JWT_SECRET is missing.");

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
// builder.Services.AddSingleton<HealthSegmenter>();
builder.Services.AddSingleton<BPMService>();

// Authentication and Authorisation
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(supabaseJwtSecret))
        };
    });
builder.Services.AddAuthorization();


// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer(options =>
// {
//     // Supabase JWT Authority URL (replace with your project ref in appsettings.json or env)
//     options.Authority = supabaseUrlString;
//     options.TokenValidationParameters = new TokenValidationParameters
//     {
//         ValidateIssuer = false,
//         ValidateAudience = false,
//         ValidateLifetime = true,
//         ValidateIssuerSigningKey = true
//     };
// });
// builder.Services.AddAuthorization();


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

app.UseAuthentication(); // MUST go before UseAuthorization
app.UseAuthorization();

app.UseAuthorization();

// Static files configuration - SIMPLIFIED VERSION
app.UseStaticFiles();

app.MapControllers();

app.Run();