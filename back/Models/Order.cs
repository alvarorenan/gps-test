namespace GpsTest.Models;

public class Order : IEntity
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid ClientId { get; set; }
    public List<Guid> ProductIds { get; set; } = new();
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public OrderStatus Status { get; private set; } = OrderStatus.Created;

    public void MarkPaid()
    {
        if (Status == OrderStatus.Canceled) throw new InvalidOperationException("Canceled order can't be paid");
        if (Status == OrderStatus.Paid) return; // idempotent
        Status = OrderStatus.Paid;
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Paid) throw new InvalidOperationException("Paid order can't be canceled");
        if (Status == OrderStatus.Canceled) return; // idempotent
        Status = OrderStatus.Canceled;
    }
}