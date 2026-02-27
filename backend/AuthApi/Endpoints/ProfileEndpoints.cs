using System.Security.Claims;

public static class ProfileEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapGet("/profile", async (ClaimsPrincipal c, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(JwtHelper.GetId(c));
            return user == null ? Results.NotFound() : Results.Ok(UserResponse(user));
        }).RequireAuthorization();

        app.MapPatch("/profile", async (ClaimsPrincipal c, UpdateDto dto, AppDbContext db) =>
        {
            var err = (dto.FirstName != null ? Validate.Name(dto.FirstName, "First name") : null)
                   ?? (dto.LastName  != null ? Validate.Name(dto.LastName,  "Last name")  : null)
                   ?? Validate.OptionalPhone(dto.Phone) ?? Validate.OptionalIdNumber(dto.IdNumber);
            if (err != null) return Results.BadRequest(err);

            var user = await db.Users.FindAsync(JwtHelper.GetId(c));
            if (user == null) return Results.NotFound();

            if (dto.FirstName != null) user.FirstName = dto.FirstName.Trim();
            if (dto.LastName  != null) user.LastName  = dto.LastName.Trim();
            if (dto.Phone     != null) user.Phone     = dto.Phone.Trim();
            if (dto.IdNumber  != null) user.IdNumber  = dto.IdNumber.Trim();
            await db.SaveChangesAsync();
            return Results.Ok(UserResponse(user));
        }).RequireAuthorization();
    }

    // Shared response shape so both endpoints stay consistent
    private static object UserResponse(User u) => new
    {
        u.FirstName, u.LastName, u.Email, u.Phone, u.IdNumber,
        u.Level, u.OnTimeCount, u.MissedCount, u.NextLevelTarget
    };
}
