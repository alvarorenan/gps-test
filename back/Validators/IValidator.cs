namespace GpsTest.Validators;

public interface IValidator<in T>
{
    ValidationResult Validate(T value);
}

public class ValidationResult
{
    public bool IsValid { get; init; }
    public string[] Errors { get; init; } = Array.Empty<string>();
    
    public static ValidationResult Success() => new() { IsValid = true };
    public static ValidationResult Failure(params string[] errors) => new() { IsValid = false, Errors = errors };
}
