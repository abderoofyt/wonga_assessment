using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = "supersecretkey1234567890abcdefghij";

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt => opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = false, ValidateAudience = false
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    for (int i = 0; i < 10; i++)
    {
        try { db.Database.EnsureCreated(); break; }
        catch { Thread.Sleep(2000); }
    }
}
app.UseCors(); app.UseAuthentication(); app.UseAuthorization();

app.MapPost("/check-email", async (CheckEmailDto dto, AppDbContext db) =>
    Results.Ok(new { exists = await db.Users.AnyAsync(u => u.Email == dto.Email.Trim().ToLower()) }));

app.MapPost("/register", async (RegisterDto dto, AppDbContext db) =>
{
    var email = dto.Email.Trim().ToLower();
    if (await db.Users.AnyAsync(u => u.Email == email)) return Results.BadRequest("Email already in use");
    var user = new User { FirstName = dto.FirstName, LastName = dto.LastName, Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), Phone = dto.Phone, IdNumber = dto.IdNumber, Level = 1 };
    db.Users.Add(user); await db.SaveChangesAsync();
    return Results.Ok(new { token = Program.MakeToken(user) });
});

app.MapPost("/login", async (LoginDto dto, AppDbContext db) =>
{
    var email = dto.Email.Trim().ToLower();
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) return Results.Unauthorized();
    return Results.Ok(new { token = Program.MakeToken(user) });
});

app.MapGet("/profile", async (ClaimsPrincipal c, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(Program.GetId(c));
    return user == null ? Results.NotFound()
        : Results.Ok(new { user.FirstName, user.LastName, user.Email, user.Phone, user.IdNumber, user.Level, user.OnTimeCount, user.MissedCount, user.NextLevelTarget });
}).RequireAuthorization();

app.MapPatch("/profile", async (ClaimsPrincipal c, UpdateDto dto, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(Program.GetId(c));
    if (user == null) return Results.NotFound();
    if (dto.FirstName != null) user.FirstName = dto.FirstName;
    if (dto.LastName != null) user.LastName = dto.LastName;
    if (dto.Phone != null) user.Phone = dto.Phone;
    if (dto.IdNumber != null) user.IdNumber = dto.IdNumber;
    await db.SaveChangesAsync();
    return Results.Ok(new { user.FirstName, user.LastName, user.Email, user.Phone, user.IdNumber, user.Level, user.OnTimeCount, user.MissedCount, user.NextLevelTarget });
}).RequireAuthorization();

app.MapPost("/loans", async (ClaimsPrincipal c, LoanDto dto, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(Program.GetId(c));
    if (user == null) return Results.NotFound();
    var loan = new Loan { UserId = user.Id, Amount = dto.Amount, Period = dto.Period, Instalment = dto.Instalment, RepaymentDate = dto.RepaymentDate, Status = "active" };
    db.Loans.Add(loan);
    var loanCount = await db.Loans.CountAsync(l => l.UserId == user.Id);
    if (loanCount == 1) user.Level += 1; // Level up on first loan only
    await db.SaveChangesAsync();
    return Results.Ok(new { loan, user.Level, leveledUp = loanCount == 1 });
}).RequireAuthorization();

app.MapGet("/loans", async (ClaimsPrincipal c, AppDbContext db) =>
{
    var loans = await db.Loans.Where(l => l.UserId == Program.GetId(c)).OrderByDescending(l => l.CreatedAt).ToListAsync();
    return Results.Ok(loans);
}).RequireAuthorization();

app.MapPost("/loans/{id}/repay", async (int id, ClaimsPrincipal c, RepayDto dto, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(Program.GetId(c));
    var loan = await db.Loans.FindAsync(id);
    if (user == null || loan == null || loan.UserId != user.Id) return Results.NotFound();

    loan.Status = "repaid";
    loan.RepaidAt = DateTime.UtcNow;
    loan.RepayType = dto.Type; // "early", "ontime", "late"

    if (dto.Type == "late")
    {
        user.MissedCount += 1;
        user.NextLevelTarget += 2; // missed = need 2 more
    }
    else
    {
        user.OnTimeCount += 1;
        if (user.OnTimeCount >= user.NextLevelTarget)
        {
            user.Level += 1;
            user.OnTimeCount = 0;
            user.MissedCount = 0;
            user.NextLevelTarget = 3; // reset
        }
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { user.Level, user.OnTimeCount, user.MissedCount, user.NextLevelTarget, loan.Status });
}).RequireAuthorization();

app.Run();

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string? Phone { get; set; }
    public string? IdNumber { get; set; }
    public int Level { get; set; } = 1;
    public int OnTimeCount { get; set; } = 0;
    public int MissedCount { get; set; } = 0;
    public int NextLevelTarget { get; set; } = 3;
}

public class Loan
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public int Period { get; set; }
    public decimal Instalment { get; set; }
    public string RepaymentDate { get; set; } = "";
    public string Status { get; set; } = "active";
    public string? RepayType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RepaidAt { get; set; }
}

public class AppDbContext(DbContextOptions<AppDbContext> opt) : DbContext(opt)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Loan> Loans => Set<Loan>();
}

record CheckEmailDto(string Email);
record RegisterDto(string FirstName, string LastName, string Email, string Password, string? Phone, string? IdNumber);
record LoginDto(string Email, string Password);
record UpdateDto(string? FirstName, string? LastName, string? Phone, string? IdNumber);
record LoanDto(decimal Amount, int Period, decimal Instalment, string RepaymentDate);
record RepayDto(string Type);

public partial class Program {
    static readonly string JwtKey = "supersecretkey1234567890abcdefghij";
    public static string MakeToken(User u) => new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
        claims: [new Claim(ClaimTypes.NameIdentifier, u.Id.ToString())],
        expires: DateTime.UtcNow.AddHours(24),
        signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtKey)), SecurityAlgorithms.HmacSha256)
    ));
    public static int GetId(ClaimsPrincipal c) => int.Parse(c.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
