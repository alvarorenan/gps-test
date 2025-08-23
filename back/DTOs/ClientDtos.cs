namespace GpsTest.DTOs;

public record CreateClientRequest(string Name, string Cpf);
public record ClientResponse(Guid Id, string Name, string Cpf);