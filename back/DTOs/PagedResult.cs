namespace GpsTest.DTOs;

public record PagedResult<T>(IEnumerable<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)System.Math.Ceiling(TotalCount / (double)PageSize);
}