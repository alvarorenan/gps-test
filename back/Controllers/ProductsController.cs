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
        try
        {
            var product = _productService.Create(request.Name, request.Price);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, 
                new ProductResponse(product.Id, product.Name, product.Price));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message, type = "validation" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Erro interno do servidor", type = "server_error" });
        }
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
        try
        {
            var product = _productService.Update(id, request.Name, request.Price);
            return Ok(new ProductResponse(product.Id, product.Name, product.Price));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Produto não encontrado", type = "not_found" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message, type = "validation" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Erro interno do servidor", type = "server_error" });
        }
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
