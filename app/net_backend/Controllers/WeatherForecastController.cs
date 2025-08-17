using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly TodoContext _context;
    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(TodoContext context, ILogger<WeatherForecastController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET /weatherforecast
    [HttpGet]
    public async Task<IEnumerable<WeatherForecast>> Get()
    {
        return await _context.WeatherForecasts.ToListAsync();
    }

    // POST /weatherforecast
    [HttpPost]
    public async Task<ActionResult<WeatherForecast>> Post(WeatherForecast forecast)
    {
        _context.WeatherForecasts.Add(forecast);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { date_time = forecast.date_time }, forecast);
    }

}
