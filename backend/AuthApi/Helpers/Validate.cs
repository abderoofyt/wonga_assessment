using System.Text.RegularExpressions;

public static class Validate
{
    // Letters, hyphens, apostrophes only (handles O'Brien, Mary-Jane). 2–50 chars.
    public static string? Name(string? value, string field)
    {
        if (string.IsNullOrWhiteSpace(value)) return $"{field} is required.";
        var v = value.Trim();
        if (v.Length < 2)  return $"{field} must be at least 2 characters.";
        if (v.Length > 50) return $"{field} must be 50 characters or fewer.";
        if (!Regex.IsMatch(v, @"^[\p{L}\s'\-]+$"))
            return $"{field} must contain only letters.";
        return null;
    }

    // Basic email format + length check.
    public static string? Email(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "Email is required.";
        var v = value.Trim();
        if (v.Length > 254) return "Email must be 254 characters or fewer.";
        if (!Regex.IsMatch(v, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            return "Email is not valid.";
        return null;
    }

    public static string? Password(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "Password is required.";
        if (value.Length < 6)   return "Password must be at least 6 characters.";
        if (value.Length > 128) return "Password must be 128 characters or fewer.";
        return null;
    }

    // Phone: digits only. 7–15 digits.
    public static string? OptionalPhone(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim();
        if (!Regex.IsMatch(v, @"^[\d\s\+\-\(\)]+$"))
            return "Phone number must contain only digits.";
        var digits = Regex.Replace(v, @"\D", "");
        if (digits.Length < 7 || digits.Length > 15)
            return "Phone number must be between 7 and 15 digits.";
        return null;
    }

    // SA ID: exactly 13 digits.
    public static string? OptionalIdNumber(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim();
        if (!Regex.IsMatch(v, @"^\d+$"))
            return "ID number must contain only digits.";
        if (v.Length != 13)
            return "ID number must be exactly 13 digits.";
        return null;
    }
}
