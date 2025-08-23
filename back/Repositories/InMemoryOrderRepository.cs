using GpsTest.Models;

namespace GpsTest.Repositories;

public class InMemoryOrderRepository : InMemoryRepository<Order>, IOrderRepository
{
    public IEnumerable<Order> GetByStatus(OrderStatus status) => _store.Values.Where(o => o.Status == status);
}