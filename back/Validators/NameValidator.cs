namespace GpsTest.Validators;

public class NameValidator : IValidator<string>
{
    public ValidationResult Validate(string name)
    {
        var errors = new List<string>();
        
        if (string.IsNullOrWhiteSpace(name))
        {
            errors.Add("Nome é obrigatório");
        }
        else
        {
            var trimmedName = name.Trim();
            
            if (trimmedName.Length < 2)
            {
                errors.Add("Nome deve ter pelo menos 2 caracteres");
            }
            
            if (trimmedName.Length > 100)
            {
                errors.Add("Nome deve ter no máximo 100 caracteres");
            }
        }
        
        return errors.Any() ? ValidationResult.Failure(errors.ToArray()) : ValidationResult.Success();
    }
}
