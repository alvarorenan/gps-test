namespace GpsTest.Validators;

public class ClientValidator : IValidator<DTOs.ClientValidationDto>
{
    private readonly IValidator<string> _nameValidator;
    private readonly IValidator<string> _cpfValidator;
    
    public ClientValidator(IValidator<string> nameValidator, IValidator<string> cpfValidator)
    {
        _nameValidator = nameValidator;
        _cpfValidator = cpfValidator;
    }
    
    public ValidationResult Validate(DTOs.ClientValidationDto client)
    {
        var allErrors = new List<string>();
        
        var nameResult = _nameValidator.Validate(client.Name);
        if (!nameResult.IsValid)
        {
            allErrors.AddRange(nameResult.Errors);
        }
        
        var cpfResult = _cpfValidator.Validate(client.Cpf);
        if (!cpfResult.IsValid)
        {
            allErrors.AddRange(cpfResult.Errors);
        }
        
        return allErrors.Any() ? ValidationResult.Failure(allErrors.ToArray()) : ValidationResult.Success();
    }
}
