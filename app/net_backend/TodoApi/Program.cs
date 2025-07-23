using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<TodoContext>(opt =>
    opt.UseInMemoryDatabase("TodoList"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        // ✅ Use the default path that matches the actual endpoint
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Todo API V1");

        // Optional: make Swagger UI show up at http://localhost:5225/
        options.RoutePrefix = "";
    });
    
    // Original Version
    // app.UseSwaggerUi(options =>
    // {

    //     options.DocumentPath = "/openapi/v1/swagger.json";
    // });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
