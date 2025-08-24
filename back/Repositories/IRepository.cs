namespace GpsTest.Repositories;

public interface IRepository<T>
{
    T Add(T entity);
    T? Get(Guid id);
    IEnumerable<T> GetAll();
    (IEnumerable<T> Items, int TotalCount) GetPaged(int page, int pageSize);
    void Update(T entity);
    void Delete(Guid id);
}