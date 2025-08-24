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
        
        if (price > 999999.99m)
        {
            errors.Add("Preço deve ser menor que R$ 999.999,99");
        }
        
        return errors.Any() ? ValidationResult.Failure(errors.ToArray()) : ValidationResult.Success();
    }
}
