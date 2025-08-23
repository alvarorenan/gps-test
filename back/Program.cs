using GpsTest.DTOs;
using GpsTest.Models;
using GpsTest.Repositories;
using GpsTest.Services;
using GpsTest.Data;
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

builder.Services.AddScoped<IRepository<Client>, EfRepository<Client>>();
builder.Services.AddScoped<IRepository<Product>, EfRepository<Product>>();
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();
builder.Services.AddScoped<IHistoryService, HistoryService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost", "http://localhost:80")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure JSON serialization to use string enums
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
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

app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/clients", (CreateClientRequest req, IClientService svc) =>
{
    var c = svc.Create(req.Name, req.Cpf);
    return Results.Created($"/clients/{c.Id}", new ClientResponse(c.Id, c.Name, c.Cpf));
});

app.MapGet("/clients", (IClientService svc) => svc.GetAll().Select(c => new ClientResponse(c.Id, c.Name, c.Cpf)));

app.MapPost("/products", (CreateProductRequest req, IProductService svc) =>
{
    var p = svc.Create(req.Name, req.Price);
    return Results.Created($"/products/{p.Id}", new ProductResponse(p.Id, p.Name, p.Price));
});

app.MapGet("/products", (IProductService svc) => svc.GetAll().Select(p => new ProductResponse(p.Id, p.Name, p.Price)));

app.MapPost("/orders", (CreateOrderRequest req, IOrderService svc) =>
{
    if (!req.ProductIds.Any()) return Results.BadRequest("Products required");
    var o = svc.Create(req.ClientId, req.ProductIds);
    return Results.Created($"/orders/{o.Id}", new OrderResponse(o.Id, o.ClientId, o.ProductIds, o.CreatedAt, o.Status));
});

app.MapGet("/orders", (IOrderService svc) =>
{
    var orders = svc.GetAll();
    return Results.Ok(orders.Select(o => new OrderResponse(o.Id, o.ClientId, o.ProductIds, o.CreatedAt, o.Status)));
});

app.MapGet("/orders/{id:guid}", (Guid id, IOrderService svc) =>
{
    var o = svc.Get(id);
    return o is null ? Results.NotFound() : Results.Ok(new OrderResponse(o.Id, o.ClientId, o.ProductIds, o.CreatedAt, o.Status));
});

app.MapGet("/orders/status/{status}", (string status, IOrderService svc) =>
{
    if (!Enum.TryParse<OrderStatus>(status, true, out var st)) return Results.BadRequest("Invalid status");
    return Results.Ok(svc.GetByStatus(st).Select(o => new OrderResponse(o.Id, o.ClientId, o.ProductIds, o.CreatedAt, o.Status)));
});

app.MapPost("/orders/{id:guid}/pay", (Guid id, IOrderService svc) =>
{
    try { svc.Pay(id); return Results.Ok(); }
    catch (KeyNotFoundException) { return Results.NotFound(); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
});

app.MapPost("/orders/{id:guid}/cancel", (Guid id, IOrderService svc) =>
{
    try { svc.Cancel(id); return Results.Ok(); }
    catch (KeyNotFoundException) { return Results.NotFound(); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
});

app.MapGet("/orders/{id:guid}/total", (Guid id, IOrderService svc, IProductService productSvc) =>
{
    try
    {
        decimal PriceResolver(Guid pid) => productSvc.Get(pid)?.Price ?? 0m;
        var total = svc.GetTotal(id, PriceResolver);
        return Results.Ok(total);
    }
    catch (KeyNotFoundException) { return Results.NotFound(); }
});

app.MapGet("/history", (IHistoryService svc) =>
{
    var history = svc.GetAll();
    return Results.Ok(history);
});

app.Run();
