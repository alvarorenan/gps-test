using System.Text.Json;
using GpsTest.Models.History;
using GpsTest.Data;
using Microsoft.EntityFrameworkCore;

namespace GpsTest.Services;

public interface IHistoryService
{
    void Record<T>(T entity, string action) where T : class;
    IEnumerable<GenericHistory> GetAll();
    (IEnumerable<object> Items, int TotalCount) GetPaged(int page, int pageSize);
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
            EntityId = id.ToString(), // Converte Guid para string
            Action = action,
            DataSnapshotJson = JsonSerializer.Serialize(entity)
        };
        _ctx.History.Add(record);
        _ctx.SaveChanges();
    }

    public IEnumerable<GenericHistory> GetAll() => _ctx.History.AsNoTracking().OrderByDescending(h => h.Timestamp).ToList();
    public (IEnumerable<object> Items, int TotalCount) GetPaged(int page, int pageSize)
    {
        if (page < 1) page = 1; if (pageSize < 1) pageSize = 10;
        var query = _ctx.History.AsNoTracking().OrderByDescending(h => h.Timestamp);
        var total = query.Count();
        var items = query.Skip((page-1)*pageSize).Take(pageSize).ToList().Cast<object>();
        return (items, total);
    }
}