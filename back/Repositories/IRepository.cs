namespace GpsTest.Repositories;

public interface IRepository<T>
{
    T Add(T entity);
    T? Get(Guid id);
    IEnumerable<T> GetAll();
    void Update(T entity);
    void Delete(Guid id);
}