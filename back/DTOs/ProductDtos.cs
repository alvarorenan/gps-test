namespace GpsTest.DTOs;

public record CreateProductRequest(string Name, decimal Price);
public record UpdateProductRequest(string Name, decimal Price);
public record ProductResponse(Guid Id, string Name, decimal Price);