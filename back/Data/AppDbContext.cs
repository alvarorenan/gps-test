using System.Text.Json;
using GpsTest.Models;
using GpsTest.Models.History;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace GpsTest.Data;

public class AppDbContext : DbContext
{
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<GenericHistory> History => Set<GenericHistory>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Value converter for List<Guid> -> JSON string
        var listGuidConverter = new ValueConverter<List<Guid>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<List<Guid>>(v, (JsonSerializerOptions?)null) ?? new List<Guid>());

        // Client configuration
        modelBuilder.Entity<Client>(e =>
        {
            e.HasIndex(c => c.Cpf).IsUnique();
            e.Property(c => c.Cpf).HasMaxLength(11).IsRequired();
            e.Property(c => c.Name).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.ProductIds)
             .HasConversion(listGuidConverter)
             .HasColumnType("jsonb");
            e.Property(o => o.Status).HasConversion<int>();
        });

        modelBuilder.Entity<GenericHistory>(e =>
        {
            e.Property(h => h.EntityType).HasMaxLength(100);
            e.Property(h => h.Action).HasMaxLength(100);
        });
    }
}