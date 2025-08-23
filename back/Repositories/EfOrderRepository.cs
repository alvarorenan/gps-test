using GpsTest.Data;
using GpsTest.Models;
using Microsoft.EntityFrameworkCore;

namespace GpsTest.Repositories;

public class EfOrderRepository : EfRepository<Order>, IOrderRepository
{
    public EfOrderRepository(AppDbContext ctx) : base(ctx) { }

    public IEnumerable<Order> GetByStatus(OrderStatus status)
        => _ctx.Orders.Where(o => o.Status == status).ToList();
}