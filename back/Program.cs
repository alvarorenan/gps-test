using GpsTest.DTOs;
using GpsTest.Models;
using GpsTest.Repositories;
using GpsTest.Services;
using GpsTest.Data;
using GpsTest.Validators;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Database (PostgreSQL)
string pgHost = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "postgres";
string pgDb = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "gpstest";
string pgUser = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "gpstest";
string pgPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "gpstest";
var connString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION") ??
                 $"Host={pgHost};Database={pgDb};Username={pgUser};Password={pgPass};";

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connString));

// Repository Layer
builder.Services.AddScoped<IRepository<Client>, EfRepository<Client>>();
builder.Services.AddScoped<IRepository<Product>, EfRepository<Product>>();
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();

// Validators (following SOLID principles)
builder.Services.AddScoped<CpfValidator>();
builder.Services.AddScoped<NameValidator>();
builder.Services.AddScoped<PriceValidator>();

// Client Validator
builder.Services.AddScoped<IValidator<ClientValidationDto>>(provider =>
{
    var nameValidator = provider.GetRequiredService<NameValidator>();
    var cpfValidator = provider.GetRequiredService<CpfValidator>();
    return new ClientValidator(nameValidator, cpfValidator);
});

// Product Validator
builder.Services.AddScoped<IValidator<ProductValidationDto>>(provider =>
{
    var nameValidator = provider.GetRequiredService<NameValidator>();
    var priceValidator = provider.GetRequiredService<PriceValidator>();
    return new ProductValidator(nameValidator, priceValidator);
});

// Service Layer
builder.Services.AddScoped<IHistoryService, HistoryService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Controller Layer
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost", "http://localhost:80", "http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations / create database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // For simplicity; swap to Migrate() when using migrations
}

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GPS Test API v1");
        c.RoutePrefix = string.Empty;
    });
}

// Controller-based routing (instead of minimal APIs)
app.MapControllers();

app.Run();
