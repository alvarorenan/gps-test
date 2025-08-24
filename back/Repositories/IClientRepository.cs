using GpsTest.Models;

namespace GpsTest.Repositories;

public interface IClientRepository : IRepository<Client>
{
    bool ExistsByCpf(string cleanCpf, Guid? ignoreId = null);
    Client? GetByCpf(string cleanCpf);
}
