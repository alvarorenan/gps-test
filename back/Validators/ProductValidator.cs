namespace GpsTest.Validators;

public class ProductValidator : IValidator<DTOs.ProductValidationDto>
{
    private readonly IValidator<string> _nameValidator;
    private readonly IValidator<decimal> _priceValidator;
    
    public ProductValidator(IValidator<string> nameValidator, IValidator<decimal> priceValidator)
    {
        _nameValidator = nameValidator;
        _priceValidator = priceValidator;
    }
    
    public ValidationResult Validate(DTOs.ProductValidationDto product)
    {
        var allErrors = new List<string>();
        
        var nameResult = _nameValidator.Validate(product.Name);
        if (!nameResult.IsValid)
        {
            allErrors.AddRange(nameResult.Errors);
        }
        
        var priceResult = _priceValidator.Validate(product.Price);
        if (!priceResult.IsValid)
        {
            allErrors.AddRange(priceResult.Errors);
        }
        
        return allErrors.Any() ? ValidationResult.Failure(allErrors.ToArray()) : ValidationResult.Success();
    }
}
