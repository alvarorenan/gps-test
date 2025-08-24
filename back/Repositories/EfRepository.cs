using GpsTest.Data;
using GpsTest.Models;
using Microsoft.EntityFrameworkCore;

namespace GpsTest.Repositories;

public class EfRepository<T> : IRepository<T> where T : class, IEntity
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
    public T? Get(Guid id) => _set.Find(id);
    public IEnumerable<T> GetAll() => _set.ToList();
    public (IEnumerable<T> Items, int TotalCount) GetPaged(int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        var query = _set.AsQueryable();
        var total = query.Count();
        var items = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return (items, total);
    }
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