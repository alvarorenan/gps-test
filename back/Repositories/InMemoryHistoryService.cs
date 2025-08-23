using GpsTest.Models.History;
using GpsTest.Services;
using System.Text.Json;

namespace GpsTest.Repositories;

/// <summary>
/// Implementação InMemory do HistoryService para testes
/// Armazena histórico em memória em vez de banco de dados
/// </summary>
public class InMemoryHistoryService : IHistoryService
{
    // Lista em memória para armazenar o histórico
    private readonly List<GenericHistory> _history = new();

    public void Record<T>(T entity, string action) where T : class
    {
        // Busca a propriedade Id da entidade (usando reflexão)
        var idProp = typeof(T).GetProperty("Id");
        var id = idProp != null ? (Guid)(idProp.GetValue(entity) ?? Guid.Empty) : Guid.Empty;
        
        // Cria um registro de histórico
        var record = new GenericHistory
        {
            Id = Guid.NewGuid(),
            EntityId = id.ToString(), // Converte Guid para string
            EntityType = typeof(T).Name, // Nome da classe (Client, Product, Order)
            Action = action, // "Created", "StatusChanged:Paid", etc.
            DataSnapshotJson = JsonSerializer.Serialize(entity), // Serializa os dados da entidade
            Timestamp = DateTime.UtcNow
        };
        
        // Adiciona à lista em memória
        _history.Add(record);
    }    public IEnumerable<GenericHistory> GetAll()
    {
        // Retorna todos os registros ordenados por data (mais recentes primeiro)
        return _history.OrderByDescending(h => h.Timestamp).ToList();
    }
}
