record CheckEmailDto(string Email);
record RegisterDto(string FirstName, string LastName, string Email, string Password, string? Phone, string? IdNumber);
record LoginDto(string Email, string Password);
record UpdateDto(string? FirstName, string? LastName, string? Phone, string? IdNumber);
record LoanDto(decimal Amount, int Period, decimal Instalment, string RepaymentDate);
record RepayDto(string Type);
