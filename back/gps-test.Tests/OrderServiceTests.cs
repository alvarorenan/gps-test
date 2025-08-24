using System;
using System.Collections.Generic;
using System.Linq;
using Moq;
using Xunit;
using GpsTest.Models;
using GpsTest.Repositories;
using GpsTest.Services;

namespace GpsTest.Tests;

public class OrderServiceTests
{
    private (OrderService service, Mock<IOrderRepository> repoMock, Mock<IHistoryService> historyMock) Build()
    {
        var repo = new Mock<IOrderRepository>(MockBehavior.Strict);
        var history = new Mock<IHistoryService>(MockBehavior.Strict);
        var service = new OrderService(repo.Object, history.Object);
        return (service, repo, history);
    }

    [Fact]
    public void Create_Should_Add_Order_And_Record_History()
    {
        // Arrange
        var (svc, repo, history) = Build();
        Order? captured = null;
        repo.Setup(r => r.Add(It.IsAny<Order>()))
            .Returns<Order>(o => { captured = o; return o; });
        history.Setup(h => h.Record(It.IsAny<Order>(), "Created"));

        var clientId = Guid.NewGuid();
        var products = new[] { Guid.NewGuid(), Guid.NewGuid() };

        // Act
        var order = svc.Create(clientId, products);

        // Assert
        Assert.NotNull(captured);
        Assert.Equal(order.Id, captured!.Id);
        Assert.Equal(clientId, captured.ClientId);
        Assert.Equal(products, captured.ProductIds);
        repo.Verify(r => r.Add(It.IsAny<Order>()), Times.Once);
        history.Verify(h => h.Record(It.Is<Order>(o => o.Id == order.Id), "Created"), Times.Once);
    }

    [Fact]
    public void Pay_Should_Update_Status_And_Record_History()
    {
        var (svc, repo, history) = Build();
        var order = new Order { ClientId = Guid.NewGuid(), ProductIds = new() { Guid.NewGuid() } };
        var id = order.Id;
        repo.Setup(r => r.Get(id)).Returns(order);
        repo.Setup(r => r.Update(order));
        history.Setup(h => h.Record(order, "StatusChanged:Paid"));

        svc.Pay(id);

        Assert.Equal(OrderStatus.Paid, order.Status);
        repo.Verify(r => r.Update(order), Times.Once);
        history.Verify(h => h.Record(order, "StatusChanged:Paid"), Times.Once);
    }

    [Fact]
    public void Pay_Nonexistent_Should_Throw()
    {
        var (svc, repo, _) = Build();
        var id = Guid.NewGuid();
        repo.Setup(r => r.Get(id)).Returns((Order?)null);
        Assert.Throws<KeyNotFoundException>(() => svc.Pay(id));
    }

    [Fact]
    public void Cancel_Should_Update_Status_And_Record_History()
    {
        var (svc, repo, history) = Build();
        var order = new Order { ClientId = Guid.NewGuid(), ProductIds = new() { Guid.NewGuid() } };
        var id = order.Id;
        repo.Setup(r => r.Get(id)).Returns(order);
        repo.Setup(r => r.Update(order));
        history.Setup(h => h.Record(order, "StatusChanged:Canceled"));

        svc.Cancel(id);

        Assert.Equal(OrderStatus.Canceled, order.Status);
        repo.Verify(r => r.Update(order), Times.Once);
        history.Verify(h => h.Record(order, "StatusChanged:Canceled"), Times.Once);
    }

    [Fact]
    public void Update_Should_Modify_Client_And_Products()
    {
        var (svc, repo, history) = Build();
        var original = new Order { ClientId = Guid.NewGuid(), ProductIds = new() { Guid.NewGuid() } };
        var newClient = Guid.NewGuid();
        var newProducts = new[] { Guid.NewGuid(), Guid.NewGuid() };
        repo.Setup(r => r.Get(original.Id)).Returns(original);
        repo.Setup(r => r.Update(original));
        history.Setup(h => h.Record(original, "Updated"));

        var updated = svc.Update(original.Id, newClient, newProducts);

        Assert.NotNull(updated);
        Assert.Equal(newClient, updated!.ClientId);
        Assert.True(newProducts.SequenceEqual(updated.ProductIds));
        repo.Verify(r => r.Update(original), Times.Once);
        history.Verify(h => h.Record(original, "Updated"), Times.Once);
    }

    [Fact]
    public void Delete_Should_Remove_And_Record()
    {
        var (svc, repo, history) = Build();
        var order = new Order { ClientId = Guid.NewGuid(), ProductIds = new() { Guid.NewGuid() } };
        var id = order.Id;
        repo.Setup(r => r.Get(id)).Returns(order);
        repo.Setup(r => r.Delete(id));
        history.Setup(h => h.Record(order, "Deleted"));

        svc.Delete(id);

        repo.Verify(r => r.Delete(id), Times.Once);
        history.Verify(h => h.Record(order, "Deleted"), Times.Once);
    }

    [Fact]
    public void GetTotal_Should_Sum_Prices()
    {
        var (svc, repo, _) = Build();
        var p1 = Guid.NewGuid();
        var p2 = Guid.NewGuid();
        var prices = new Dictionary<Guid, decimal> { [p1] = 5m, [p2] = 7.5m };
        var order = new Order { ClientId = Guid.NewGuid(), ProductIds = new() { p1, p2 } };
        repo.Setup(r => r.Get(order.Id)).Returns(order);

        var total = svc.GetTotal(order.Id, id => prices[id]);
        Assert.Equal(12.5m, total);
    }

    [Fact]
    public void GetByStatus_Should_Delegate_To_Repository()
    {
        var (svc, repo, _) = Build();
        var list = new List<Order> { new() { ClientId = Guid.NewGuid() } };
        repo.Setup(r => r.GetByStatus(OrderStatus.Created)).Returns(list);
        var result = svc.GetByStatus(OrderStatus.Created);
        Assert.Single(result);
    }

    [Fact]
    public void Delete_Nonexistent_Should_Not_Throw_Or_Record()
    {
        var (svc, repo, history) = Build();
        var id = Guid.NewGuid();
        repo.Setup(r => r.Get(id)).Returns((Order?)null);
        // history should never be called
        svc.Delete(id);
        history.Verify(h => h.Record(It.IsAny<Order>(), It.IsAny<string>()), Times.Never);
    }
}