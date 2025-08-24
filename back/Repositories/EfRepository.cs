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