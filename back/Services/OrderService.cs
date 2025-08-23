using GpsTest.Models;
using GpsTest.Repositories;

namespace GpsTest.Services;

public interface IOrderService
{
    Order Create(Guid clientId, IEnumerable<Guid> productIds);
    Order? Get(Guid id);
    IEnumerable<Order> GetAll();
    IEnumerable<Order> GetByStatus(OrderStatus status);
    void Pay(Guid id);
    void Cancel(Guid id);
    void Delete(Guid id);
    decimal GetTotal(Guid id, Func<Guid, decimal> priceResolver);
}

public class OrderService : IOrderService
{
    private readonly IOrderRepository _repo;
    private readonly IHistoryService _history;
    public OrderService(IOrderRepository repo, IHistoryService history)
    {
        _repo = repo; _history = history;
    }

    public Order Create(Guid clientId, IEnumerable<Guid> productIds)
    {
        var order = new Order { ClientId = clientId, ProductIds = productIds.ToList() };
        _repo.Add(order);
        _history.Record(order, "Created");
        return order;
    }

    public Order? Get(Guid id) => _repo.Get(id);
    public IEnumerable<Order> GetAll() => _repo.GetAll();
    public IEnumerable<Order> GetByStatus(OrderStatus status) => _repo.GetByStatus(status);

    public void Pay(Guid id)
    {
        var o = _repo.Get(id) ?? throw new KeyNotFoundException("Order not found");
        o.MarkPaid();
        _repo.Update(o);
        _history.Record(o, "StatusChanged:Paid");
    }

    public void Cancel(Guid id)
    {
        var o = _repo.Get(id) ?? throw new KeyNotFoundException("Order not found");
        o.Cancel();
        _repo.Update(o);
        _history.Record(o, "StatusChanged:Canceled");
    }

    public void Delete(Guid id)
    {
        var order = _repo.Get(id);
        if (order != null)
        {
            _repo.Delete(id);
            _history.Record(order, "Deleted");
        }
    }

    public decimal GetTotal(Guid id, Func<Guid, decimal> priceResolver)
    {
        var o = _repo.Get(id) ?? throw new KeyNotFoundException("Order not found");
        return o.ProductIds.Sum(priceResolver);
    }
}