using GpsTest.Models;

namespace GpsTest.DTOs;

public record CreateOrderRequest(Guid ClientId, List<Guid> ProductIds);
public record UpdateOrderRequest(Guid ClientId, List<Guid> ProductIds);
public record OrderResponse(Guid Id, Guid ClientId, List<Guid> ProductIds, DateTime CreatedAt, OrderStatus Status);