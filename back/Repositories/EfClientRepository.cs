using System.Text.RegularExpressions;
using GpsTest.Data;
using GpsTest.Models;

namespace GpsTest.Repositories;

public class EfClientRepository : EfRepository<Client>, IClientRepository
{
    public EfClientRepository(AppDbContext ctx) : base(ctx) { }

    private static string Clean(string cpf) => Regex.Replace(cpf, @"\D", "");

    public bool ExistsByCpf(string cleanCpf, Guid? ignoreId = null)
    {
        cleanCpf = Clean(cleanCpf);
        return ignoreId == null
            ? _ctx.Clients.Any(c => c.Cpf == cleanCpf)
            : _ctx.Clients.Any(c => c.Cpf == cleanCpf && c.Id != ignoreId);
    }

    public Client? GetByCpf(string cleanCpf)
    {
        cleanCpf = Clean(cleanCpf);
        return _ctx.Clients.FirstOrDefault(c => c.Cpf == cleanCpf);
    }
}
