using GpsTest.Models;
using GpsTest.Repositories;

namespace GpsTest.Services;

public interface IProductService
{
    Product Create(string name, decimal price);
    Product? Get(Guid id);
    IEnumerable<Product> GetAll();
}

public class ProductService : IProductService
{
    private readonly IRepository<Product> _repo;
    private readonly IHistoryService _history;
    public ProductService(IRepository<Product> repo, IHistoryService history)
    {
        _repo = repo; _history = history;
    }

    public Product Create(string name, decimal price)
    {
        var p = new Product { Name = name, Price = price };
        _repo.Add(p);
        _history.Record(p, "Created");
        return p;
    }

    public Product? Get(Guid id) => _repo.Get(id);
    public IEnumerable<Product> GetAll() => _repo.GetAll();
}