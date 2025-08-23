using GpsTest.Models;
using GpsTest.Repositories;

namespace GpsTest.Services;

public interface IProductService
{
    Product Create(string name, decimal price);
    Product? Get(Guid id);
    IEnumerable<Product> GetAll();
    Product? Update(Guid id, string name, decimal price);
    void Delete(Guid id);
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

    public Product? Update(Guid id, string name, decimal price)
    {
        var product = _repo.Get(id);
        if (product == null) return null;

        product.Name = name;
        product.Price = price;
        _repo.Update(product);
        _history.Record(product, "Updated");
        return product;
    }

    public void Delete(Guid id)
    {
        var product = _repo.Get(id);
        if (product != null)
        {
            _repo.Delete(id);
            _history.Record(product, "Deleted");
        }
    }
}