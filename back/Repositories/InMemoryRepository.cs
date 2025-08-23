using System.Collections.Concurrent;

namespace GpsTest.Repositories;

public class InMemoryRepository<T> : IRepository<T> where T : class
{
    protected readonly ConcurrentDictionary<Guid, T> _store = new();

    private static Guid GetId(T entity)
    {
        var prop = typeof(T).GetProperty("Id");
        if (prop == null) throw new InvalidOperationException("Entity must have Id property");
        return (Guid)(prop.GetValue(entity) ?? Guid.Empty);
    }

    public T Add(T entity)
    {
        var id = GetId(entity);
        _store[id] = entity;
        return entity;
    }

    public T? Get(Guid id) => _store.TryGetValue(id, out var e) ? e : null;
    public IEnumerable<T> GetAll() => _store.Values;
    public void Update(T entity)
    {
        var id = GetId(entity);
        if (!_store.ContainsKey(id)) throw new KeyNotFoundException();
        _store[id] = entity;
    }

    public void Delete(Guid id)
    {
        _store.TryRemove(id, out _);
    }
}