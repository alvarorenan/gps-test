using Microsoft.AspNetCore.Mvc;
using GpsTest.Services;
using GpsTest.DTOs;
using GpsTest.Models;

namespace GpsTest.Controllers;

[ApiController]
[Route("[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IProductService _productService;

    public OrdersController(IOrderService orderService, IProductService productService)
    {
        _orderService = orderService;
        _productService = productService;
    }

    [HttpPost]
    public ActionResult<OrderResponse> Create([FromBody] CreateOrderRequest request)
    {
        if (!request.ProductIds.Any())
            return BadRequest("Products required");

        var order = _orderService.Create(request.ClientId, request.ProductIds);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, 
            new OrderResponse(order.Id, order.ClientId, order.ProductIds, order.CreatedAt, order.Status));
    }

    [HttpGet]
    public ActionResult<IEnumerable<OrderResponse>> GetAll()
    {
        var orders = _orderService.GetAll();
        return Ok(orders.Select(o => 
            new OrderResponse(o.Id, o.ClientId, o.ProductIds, o.CreatedAt, o.Status)));
    }

    [HttpGet("{id:guid}")]
    public ActionResult<OrderResponse> GetById(Guid id)
    {
        var order = _orderService.Get(id);
        if (order == null)
            return NotFound();

        return Ok(new OrderResponse(order.Id, order.ClientId, order.ProductIds, order.CreatedAt, order.Status));
    }

    [HttpGet("status/{status}")]
    public ActionResult<IEnumerable<OrderResponse>> GetByStatus(string status)
    {
        if (!Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            return BadRequest("Invalid status");

        var orders = _orderService.GetByStatus(orderStatus);
        return Ok(orders.Select(o => 
            new OrderResponse(o.Id, o.ClientId, o.ProductIds, o.CreatedAt, o.Status)));
    }

    [HttpPost("{id:guid}/pay")]
    public ActionResult Pay(Guid id)
    {
        try 
        { 
            _orderService.Pay(id); 
            return Ok(); 
        }
        catch (KeyNotFoundException) 
        { 
            return NotFound(); 
        }
        catch (InvalidOperationException ex) 
        { 
            return BadRequest(ex.Message); 
        }
    }

    [HttpPost("{id:guid}/cancel")]
    public ActionResult Cancel(Guid id)
    {
        try 
        { 
            _orderService.Cancel(id); 
            return Ok(); 
        }
        catch (KeyNotFoundException) 
        { 
            return NotFound(); 
        }
        catch (InvalidOperationException ex) 
        { 
            return BadRequest(ex.Message); 
        }
    }

    [HttpGet("{id:guid}/total")]
    public ActionResult<decimal> GetTotal(Guid id)
    {
        try
        {
            decimal PriceResolver(Guid productId) => _productService.Get(productId)?.Price ?? 0m;
            var total = _orderService.GetTotal(id, PriceResolver);
            return Ok(total);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public ActionResult Delete(Guid id)
    {
        var order = _orderService.Get(id);
        if (order == null)
            return NotFound();

        _orderService.Delete(id);
        return NoContent();
    }
}
