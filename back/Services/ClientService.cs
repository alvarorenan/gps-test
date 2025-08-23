using GpsTest.Models;
using GpsTest.Repositories;

namespace GpsTest.Services;

public interface IClientService
{
    Client Create(string name, string cpf);
    Client? Get(Guid id);
    IEnumerable<Client> GetAll();
    Client? Update(Guid id, string name, string cpf);
    void Delete(Guid id);
}

public class ClientService : IClientService
{
    private readonly IRepository<Client> _repo;
    private readonly IHistoryService _history;
    public ClientService(IRepository<Client> repo, IHistoryService history)
    {
        _repo = repo; _history = history;
    }

    public Client Create(string name, string cpf)
    {
        var c = new Client { Name = name, Cpf = cpf };
        _repo.Add(c);
        _history.Record(c, "Created");
        return c;
    }

    public Client? Get(Guid id) => _repo.Get(id);
    public IEnumerable<Client> GetAll() => _repo.GetAll();

    public Client? Update(Guid id, string name, string cpf)
    {
        var client = _repo.Get(id);
        if (client == null) return null;

        client.Name = name;
        client.Cpf = cpf;
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
}