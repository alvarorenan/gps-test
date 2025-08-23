namespace GpsTest.Models.History;

public abstract class EntityHistory
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public string EntityType { get; init; } = string.Empty;
    public Guid EntityId { get; init; }
    public string Action { get; init; } = string.Empty;
    public string DataSnapshotJson { get; init; } = string.Empty;
}