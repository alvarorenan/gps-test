namespace GpsTest.Models;

public class Client
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
}