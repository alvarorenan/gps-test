namespace GpsTest.Validators;

public class PriceValidator : IValidator<decimal>
{
    public ValidationResult Validate(decimal price)
    {
        var errors = new List<string>();
        
        if (price <= 0)
        {
            errors.Add("Preço deve ser maior que zero");
        }
        
        return errors.Any() ? ValidationResult.Failure(errors.ToArray()) : ValidationResult.Success();
    }
}
