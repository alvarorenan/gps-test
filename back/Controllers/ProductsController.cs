using Microsoft.AspNetCore.Mvc;
using GpsTest.Services;
using GpsTest.DTOs;

namespace GpsTest.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpPost]
    public ActionResult<ProductResponse> Create([FromBody] CreateProductRequest request)
    {
        var product = _productService.Create(request.Name, request.Price);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, 
            new ProductResponse(product.Id, product.Name, product.Price));
    }

    [HttpGet]
    public ActionResult<IEnumerable<ProductResponse>> GetAll()
    {
        var products = _productService.GetAll();
        return Ok(products.Select(p => new ProductResponse(p.Id, p.Name, p.Price)));
    }

    [HttpGet("{id:guid}")]
    public ActionResult<ProductResponse> GetById(Guid id)
    {
        var product = _productService.Get(id);
        if (product == null)
            return NotFound();

        return Ok(new ProductResponse(product.Id, product.Name, product.Price));
    }

    [HttpPut("{id:guid}")]
    public ActionResult<ProductResponse> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var product = _productService.Update(id, request.Name, request.Price);
        if (product == null)
            return NotFound();

        return Ok(new ProductResponse(product.Id, product.Name, product.Price));
    }

    [HttpDelete("{id:guid}")]
    public ActionResult Delete(Guid id)
    {
        var product = _productService.Get(id);
        if (product == null)
            return NotFound();

        _productService.Delete(id);
        return NoContent();
    }
}
