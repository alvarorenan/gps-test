using System;
using GpsTest.Models;
using GpsTest.Repositories;
using GpsTest.Services;
using Xunit;

namespace GpsTest.Tests;

public class OrderServiceTests
{
    private static (OrderService svc, InMemoryOrderRepository orderRepo, ProductService productSvc) Build()
    {
        var history = new HistoryService();
        var orderRepo = new InMemoryOrderRepository();
        var productRepo = new InMemoryRepository<Product>();
        var productSvc = new ProductService(productRepo, history);
        var svc = new OrderService(orderRepo, history);
        return (svc, orderRepo, productSvc);
    }

    [Fact]
    public void Create_And_Total()
    {
        var (svc, _, productSvc) = Build();
        var p1 = productSvc.Create("A", 10);
        var p2 = productSvc.Create("B", 5);
        var order = svc.Create(Guid.NewGuid(), new[] { p1.Id, p2.Id });
        var total = svc.GetTotal(order.Id, id => productSvc.Get(id)!.Price);
        Assert.Equal(15, total);
    }

    [Fact]
    public void Pay_Order()
    {
        var (svc, _, productSvc) = Build();
        var p = productSvc.Create("A", 10);
        var order = svc.Create(Guid.NewGuid(), new[] { p.Id });
        svc.Pay(order.Id);
        Assert.Equal(OrderStatus.Paid, svc.Get(order.Id)!.Status);
    }

    [Fact]
    public void Cancel_Order_Before_Pay()
    {
        var (svc, _, productSvc) = Build();
        var p = productSvc.Create("A", 10);
        var order = svc.Create(Guid.NewGuid(), new[] { p.Id });
        svc.Cancel(order.Id);
        Assert.Equal(OrderStatus.Canceled, svc.Get(order.Id)!.Status);
    }
}