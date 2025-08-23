using System;
using System.Linq;
using GpsTest.Models;
using GpsTest.Models.History;
using GpsTest.Repositories;
using GpsTest.Services;
using Xunit;

namespace GpsTest.Tests;

public class OrderServiceTests
{
    private static (OrderService orderService, ProductService productService, InMemoryHistoryService historyService) BuildServices()
    {
        var historyService = new InMemoryHistoryService();
        var orderRepository = new InMemoryOrderRepository();
        var productRepository = new InMemoryRepository<Product>();
        
        var productService = new ProductService(productRepository, historyService);
        var orderService = new OrderService(orderRepository, historyService);
        
        return (orderService, productService, historyService);
    }

    #region Order Creation Tests

    [Fact]
    public void Create_Order_Should_Calculate_Correct_Total()
    {
        // Arrange
        var (orderService, productService, _) = BuildServices();
        var product1 = productService.Create("Produto A", 10.50m);
        var product2 = productService.Create("Produto B", 15.75m);
        var clientId = Guid.NewGuid();

        // Act
        var order = orderService.Create(clientId, new[] { product1.Id, product2.Id });
        var total = orderService.GetTotal(order.Id, id => productService.Get(id)!.Price);

        // Assert
        Assert.Equal(26.25m, total);
        Assert.Equal(OrderStatus.Created, order.Status);
        Assert.Equal(clientId, order.ClientId);
        Assert.Equal(2, order.ProductIds.Count);
    }

    [Fact]
    public void Create_Order_With_Single_Product_Should_Work()
    {
        // Arrange
        var (orderService, productService, _) = BuildServices();
        var product = productService.Create("Produto Único", 99.99m);
        var clientId = Guid.NewGuid();

        // Act
        var order = orderService.Create(clientId, new[] { product.Id });
        var total = orderService.GetTotal(order.Id, id => productService.Get(id)!.Price);

        // Assert
        Assert.Equal(99.99m, total);
        Assert.Single(order.ProductIds);
    }

    [Fact]
    public void Create_Order_With_Empty_Products_Should_Have_Zero_Total()
    {
        // Arrange
        var (orderService, _, _) = BuildServices();
        var clientId = Guid.NewGuid();

        // Act
        var order = orderService.Create(clientId, Array.Empty<Guid>());
        var total = orderService.GetTotal(order.Id, _ => 0);

        // Assert
        Assert.Equal(0, total);
        Assert.Empty(order.ProductIds);
    }

    #endregion

    #region Payment Tests

    [Fact]
    public void Pay_Pending_Order_Should_Change_Status_To_Paid()
    {
        // Arrange
        var (orderService, productService, _) = BuildServices();
        var product = productService.Create("Produto para Pagamento", 50.00m);
        var order = orderService.Create(Guid.NewGuid(), new[] { product.Id });

        // Act
        orderService.Pay(order.Id);

        // Assert
        var updatedOrder = orderService.Get(order.Id);
        Assert.Equal(OrderStatus.Paid, updatedOrder!.Status);
    }

    [Fact]
    public void Pay_Already_Paid_Order_Should_Remain_Paid()
    {
        // Arrange
        var (orderService, productService, _) = BuildServices();
        var product = productService.Create("Produto Já Pago", 25.00m);
        var order = orderService.Create(Guid.NewGuid(), new[] { product.Id });
        orderService.Pay(order.Id);

        // Act - Tentar pagar novamente
        orderService.Pay(order.Id);

        // Assert
        var updatedOrder = orderService.Get(order.Id);
        Assert.Equal(OrderStatus.Paid, updatedOrder!.Status);
    }

    #endregion

    #region Cancellation Tests

    [Fact]
    public void Cancel_Pending_Order_Should_Change_Status_To_Canceled()
    {
        // Arrange
        var (orderService, productService, _) = BuildServices();
        var product = productService.Create("Produto para Cancelamento", 30.00m);
        var order = orderService.Create(Guid.NewGuid(), new[] { product.Id });

        // Act
        orderService.Cancel(order.Id);

        // Assert
        var updatedOrder = orderService.Get(order.Id);
        Assert.Equal(OrderStatus.Canceled, updatedOrder!.Status);
    }

    [Fact]
    public void Cancel_Paid_Order_Should_Not_Be_Allowed()
    {
        // Arrange
        var (orderService, productService, _) = BuildServices();
        var product = productService.Create("Produto Pago", 40.00m);
        var order = orderService.Create(Guid.NewGuid(), new[] { product.Id });
        orderService.Pay(order.Id);

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => orderService.Cancel(order.Id));
    }

    #endregion

    #region History and Audit Tests

    [Fact]
    public void Order_Operations_Should_Be_Recorded_In_History()
    {
        // Arrange
        var (orderService, productService, historyService) = BuildServices();
        var product = productService.Create("Produto com Histórico", 15.50m);
        var clientId = Guid.NewGuid();

        // Act
        var order = orderService.Create(clientId, new[] { product.Id });
        orderService.Pay(order.Id);

        // Assert
        var historyRecords = historyService.GetAll().ToList();
        
        // Deve ter 3 registros: Product Created, Order Created, Order StatusChanged:Paid
        Assert.Equal(3, historyRecords.Count);
        
        // Verifica registro de produto criado
        var productHistory = historyRecords.FirstOrDefault(h => h.EntityType == "Product" && h.Action == "Created");
        Assert.NotNull(productHistory);
        Assert.Equal(product.Id.ToString(), productHistory.EntityId);
        
        // Verifica registro de pedido criado
        var orderCreatedHistory = historyRecords.FirstOrDefault(h => h.EntityType == "Order" && h.Action == "Created");
        Assert.NotNull(orderCreatedHistory);
        Assert.Equal(order.Id.ToString(), orderCreatedHistory.EntityId);
        
        // Verifica registro de mudança de status
        var statusChangeHistory = historyRecords.FirstOrDefault(h => h.EntityType == "Order" && h.Action == "StatusChanged:Paid");
        Assert.NotNull(statusChangeHistory);
        Assert.Equal(order.Id.ToString(), statusChangeHistory.EntityId);
    }

    [Fact]
    public void Cancel_Order_Should_Record_Status_Change_In_History()
    {
        // Arrange
        var (orderService, productService, historyService) = BuildServices();
        var product = productService.Create("Produto para Cancelar", 20.00m);
        var order = orderService.Create(Guid.NewGuid(), new[] { product.Id });

        // Act
        orderService.Cancel(order.Id);

        // Assert
        var historyRecords = historyService.GetAll().ToList();
        var cancelHistory = historyRecords.FirstOrDefault(h => 
            h.EntityType == "Order" && 
            h.Action == "StatusChanged:Canceled" && 
            h.EntityId == order.Id.ToString());
        
        Assert.NotNull(cancelHistory);
        Assert.True(cancelHistory.Timestamp <= DateTime.UtcNow);
    }

    #endregion

    #region Business Logic Tests

    [Fact]
    public void Get_Nonexistent_Order_Should_Return_Null()
    {
        // Arrange
        var (orderService, _, _) = BuildServices();
        var nonexistentId = Guid.NewGuid();

        // Act
        var result = orderService.Get(nonexistentId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void GetAll_Should_Return_All_Created_Orders()
    {
        // Arrange
        var (orderService, productService, _) = BuildServices();
        var product = productService.Create("Produto Comum", 10.00m);
        
        // Act
        var order1 = orderService.Create(Guid.NewGuid(), new[] { product.Id });
        var order2 = orderService.Create(Guid.NewGuid(), new[] { product.Id });
        var allOrders = orderService.GetAll().ToList();

        // Assert
        Assert.Equal(2, allOrders.Count);
        Assert.Contains(allOrders, o => o.Id == order1.Id);
        Assert.Contains(allOrders, o => o.Id == order2.Id);
    }

    #endregion
}