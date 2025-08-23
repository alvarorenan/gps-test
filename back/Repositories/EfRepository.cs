using GpsTest.Data;
using Microsoft.EntityFrameworkCore;

namespace GpsTest.Repositories;

public class EfRepository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _ctx;
    protected readonly DbSet<T> _set;
    public EfRepository(AppDbContext ctx)
    {
        _ctx = ctx; _set = ctx.Set<T>();
    }
    public T Add(T entity)
    {
        _set.Add(entity);
        _ctx.SaveChanges();
        return entity;
    }
    public T? Get(Guid id)
    {
        var prop = typeof(T).GetProperty("Id");
        return _set.AsEnumerable().FirstOrDefault(e => (Guid)(prop?.GetValue(e) ?? Guid.Empty) == id);
    }
    public IEnumerable<T> GetAll() => _set.ToList();
    public void Update(T entity)
    {
        _set.Update(entity);
        _ctx.SaveChanges();
    }
    public void Delete(Guid id)
    {
        var entity = Get(id);
        if (entity != null)
        {
            _set.Remove(entity);
            _ctx.SaveChanges();
        }
    }
}