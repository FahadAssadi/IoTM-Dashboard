using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// Load .env variables from backend project root
Env.Load();  // <-- loads .env file here

// Get Supabase DB connection string from environment variable
var connectionString = Environment.GetEnvironmentVariable("SUPABASE_DB_CONNECTION");

if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("SUPABASE_DB_CONNECTION environment variable not found");
}

// Register EF Core DbContext with Npgsql using Supabase connection string
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.
builder.Services.AddControllers();

// Swagger setup
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Todo API",
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
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Todo API V1");
        options.RoutePrefix = "";
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
