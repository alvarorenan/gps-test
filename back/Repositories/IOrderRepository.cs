using GpsTest.Models;

namespace GpsTest.Repositories;

public interface IOrderRepository : IRepository<Order>
{
    IEnumerable<Order> GetByStatus(OrderStatus status);
}