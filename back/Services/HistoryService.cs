using System.Text.Json;
using GpsTest.Models.History;
using GpsTest.Data;
using Microsoft.EntityFrameworkCore;

namespace GpsTest.Services;

public interface IHistoryService
{
    void Record<T>(T entity, string action) where T : class;
    IEnumerable<GenericHistory> GetAll();
}

public class HistoryService : IHistoryService
{
    private readonly AppDbContext _ctx;
    public HistoryService(AppDbContext ctx) { _ctx = ctx; }

    public void Record<T>(T entity, string action) where T : class
    {
        var idProp = typeof(T).GetProperty("Id");
        var id = idProp != null ? (Guid)(idProp.GetValue(entity) ?? Guid.Empty) : Guid.Empty;
        var record = new GenericHistory
        {
            EntityType = typeof(T).Name,
            EntityId = id,
            Action = action,
            DataSnapshotJson = JsonSerializer.Serialize(entity)
        };
        _ctx.History.Add(record);
        _ctx.SaveChanges();
    }

    public IEnumerable<GenericHistory> GetAll() => _ctx.History.AsNoTracking().OrderByDescending(h => h.Timestamp).ToList();
}