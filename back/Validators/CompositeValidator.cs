namespace GpsTest.Validators;

public class CompositeValidator<T> : IValidator<T>
{
    private readonly List<IValidator<T>> _validators = new();
    
    public CompositeValidator<T> AddValidator(IValidator<T> validator)
    {
        _validators.Add(validator);
        return this;
    }
    
    public ValidationResult Validate(T value)
    {
        var allErrors = new List<string>();
        
        foreach (var validator in _validators)
        {
            var result = validator.Validate(value);
            if (!result.IsValid)
            {
                allErrors.AddRange(result.Errors);
            }
        }
        
        return allErrors.Any() ? ValidationResult.Failure(allErrors.ToArray()) : ValidationResult.Success();
    }
}
