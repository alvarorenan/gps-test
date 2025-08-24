using System.Text.RegularExpressions;

namespace GpsTest.Validators;

public class CpfValidator : IValidator<string>
{
    public ValidationResult Validate(string cpf)
    {
        var errors = new List<string>();
        
        if (string.IsNullOrWhiteSpace(cpf))
        {
            errors.Add("CPF é obrigatório");
            return ValidationResult.Failure(errors.ToArray());
        }

        // Remove formatação
        var cleanCpf = Regex.Replace(cpf, @"\D", "");
        
        // Validar comprimento
        if (cleanCpf.Length != 11)
        {
            errors.Add("CPF deve ter exatamente 11 dígitos");
        }
        
        // Validar se não são todos números iguais
        if (Regex.IsMatch(cleanCpf, @"^(\d)\1{10}$"))
        {
            errors.Add("CPF não pode ter todos os dígitos iguais");
        }
        
        // Validar dígitos verificadores
        if (cleanCpf.Length == 11 && !IsValidCpfChecksum(cleanCpf))
        {
            errors.Add("CPF possui dígitos verificadores inválidos");
        }
        
        return errors.Any() ? ValidationResult.Failure(errors.ToArray()) : ValidationResult.Success();
    }
    
    private static bool IsValidCpfChecksum(string cpf)
    {
        // Calcular primeiro dígito verificador
        int sum = 0;
        for (int i = 0; i < 9; i++)
        {
            sum += int.Parse(cpf[i].ToString()) * (10 - i);
        }
        int firstDigit = (sum * 10) % 11;
        if (firstDigit == 10) firstDigit = 0;

        // Calcular segundo dígito verificador
        sum = 0;
        for (int i = 0; i < 10; i++)
        {
            sum += int.Parse(cpf[i].ToString()) * (11 - i);
        }
        int secondDigit = (sum * 10) % 11;
        if (secondDigit == 10) secondDigit = 0;

        return cpf[9].ToString() == firstDigit.ToString() && 
               cpf[10].ToString() == secondDigit.ToString();
    }
}
