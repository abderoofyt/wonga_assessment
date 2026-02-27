using Microsoft.EntityFrameworkCore;

public static class AuthEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/check-email", async (CheckEmailDto dto, AppDbContext db) =>
            Results.Ok(new { exists = await db.Users.AnyAsync(u => u.Email == dto.Email.Trim().ToLower()) }));

        app.MapPost("/register", async (RegisterDto dto, AppDbContext db) =>
        {
            var err = Validate.Name(dto.FirstName, "First name") ?? Validate.Name(dto.LastName, "Last name")
                   ?? Validate.Email(dto.Email) ?? Validate.Password(dto.Password)
                   ?? Validate.OptionalPhone(dto.Phone) ?? Validate.OptionalIdNumber(dto.IdNumber);
            if (err != null) return Results.BadRequest(err);

            var email = dto.Email.Trim().ToLower();
            if (await db.Users.AnyAsync(u => u.Email == email))
                return Results.BadRequest("Email already in use");

            var user = new User
            {
                FirstName = dto.FirstName.Trim(), LastName = dto.LastName.Trim(),
                Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone?.Trim(), IdNumber = dto.IdNumber?.Trim(), Level = 1
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return Results.Ok(new { token = JwtHelper.MakeToken(user), isNewUser = true });
        });

        app.MapPost("/login", async (LoginDto dto, AppDbContext db) =>
        {
            var email = dto.Email.Trim().ToLower();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Results.Unauthorized();
            return Results.Ok(new { token = JwtHelper.MakeToken(user) });
        });
    }
}
