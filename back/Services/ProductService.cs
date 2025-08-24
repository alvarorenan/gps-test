using GpsTest.Models;
using GpsTest.Repositories;
using GpsTest.Validators;
using GpsTest.DTOs;

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
    private readonly IValidator<ProductValidationDto> _productValidator;
    
    public ProductService(
        IRepository<Product> repo, 
        IHistoryService history,
        IValidator<ProductValidationDto> productValidator)
    {
        _repo = repo; 
        _history = history;
        _productValidator = productValidator;
    }

    public Product Create(string name, decimal price)
    {
        var validationDto = new ProductValidationDto { Name = name, Price = price };
        var validationResult = _productValidator.Validate(validationDto);
        
        if (!validationResult.IsValid)
        {
            throw new ArgumentException($"Dados inválidos: {string.Join(", ", validationResult.Errors)}");
        }

        var p = new Product { Name = name.Trim(), Price = price };
        _repo.Add(p);
        _history.Record(p, "Created");
        return p;
    }

    public Product? Get(Guid id) => _repo.Get(id);
    public IEnumerable<Product> GetAll() => _repo.GetAll();

    public Product? Update(Guid id, string name, decimal price)
    {
        var validationDto = new ProductValidationDto { Name = name, Price = price };
        var validationResult = _productValidator.Validate(validationDto);
        
        if (!validationResult.IsValid)
        {
            throw new ArgumentException($"Dados inválidos: {string.Join(", ", validationResult.Errors)}");
        }

    var product = _repo.Get(id);
    if (product == null) throw new KeyNotFoundException("Produto não encontrado");

        product.Name = name.Trim();
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