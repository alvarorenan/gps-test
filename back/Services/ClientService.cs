using GpsTest.Models;
using GpsTest.Repositories;
using GpsTest.Validators;
using GpsTest.DTOs;

namespace GpsTest.Services;

public interface IClientService
{
    Client Create(string name, string cpf);
    Client? Get(Guid id);
    IEnumerable<Client> GetAll();
    (IEnumerable<Client> Items, int TotalCount) GetPaged(int page, int pageSize);
    Client? Update(Guid id, string name, string cpf);
    void Delete(Guid id);
}

public class ClientService : IClientService
{
    private readonly IClientRepository _repo;
    private readonly IHistoryService _history;
    private readonly IValidator<ClientValidationDto> _clientValidator;
    
    public ClientService(
    IClientRepository repo, 
        IHistoryService history,
        IValidator<ClientValidationDto> clientValidator)
    {
        _repo = repo; 
        _history = history;
        _clientValidator = clientValidator;
    }

    public Client Create(string name, string cpf)
    {
        var validationDto = new ClientValidationDto { Name = name, Cpf = cpf };
        var validationResult = _clientValidator.Validate(validationDto);
        
        if (!validationResult.IsValid)
        {
            throw new ArgumentException($"Dados inválidos: {string.Join(", ", validationResult.Errors)}");
        }

        var cleanCpf = CleanCpf(cpf);
        
        // Verificar se CPF já existe
        if (_repo.ExistsByCpf(cleanCpf))
            throw new InvalidOperationException("CPF já está cadastrado no sistema");

        var c = new Client { Name = name.Trim(), Cpf = cleanCpf };
        _repo.Add(c);
        _history.Record(c, "Created");
        return c;
    }

    public Client? Get(Guid id) => _repo.Get(id);
    public IEnumerable<Client> GetAll() => _repo.GetAll();
    public (IEnumerable<Client> Items, int TotalCount) GetPaged(int page, int pageSize) => _repo.GetPaged(page, pageSize);

    public Client? Update(Guid id, string name, string cpf)
    {
        var validationDto = new ClientValidationDto { Name = name, Cpf = cpf };
        var validationResult = _clientValidator.Validate(validationDto);
        
        if (!validationResult.IsValid)
        {
            throw new ArgumentException($"Dados inválidos: {string.Join(", ", validationResult.Errors)}");
        }

    var client = _repo.Get(id);
    if (client == null) throw new KeyNotFoundException("Cliente não encontrado");

        var cleanCpf = CleanCpf(cpf);
        
        // Verificar se CPF já existe em outro cliente
        if (_repo.ExistsByCpf(cleanCpf, id))
            throw new InvalidOperationException("CPF já está cadastrado em outro cliente");

        client.Name = name.Trim();
        client.Cpf = cleanCpf;
        _repo.Update(client);
        _history.Record(client, "Updated");
        return client;
    }

    public void Delete(Guid id)
    {
        var client = _repo.Get(id);
        if (client != null)
        {
            _repo.Delete(id);
            _history.Record(client, "Deleted");
        }
    }
    
    private static string CleanCpf(string cpf)
    {
        return System.Text.RegularExpressions.Regex.Replace(cpf, @"\D", "");
    }
}