using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public static class JwtHelper
{
    private const string Key = "supersecretkey1234567890abcdefghij";
    private static readonly SymmetricSecurityKey SecurityKey = new(Encoding.UTF8.GetBytes(Key));

    public static string MakeToken(User u) =>
        new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.NameIdentifier, u.Id.ToString())],
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: new SigningCredentials(SecurityKey, SecurityAlgorithms.HmacSha256)
        ));

    public static int GetId(ClaimsPrincipal c) =>
        int.Parse(c.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public static TokenValidationParameters ValidationParams() => new()
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = SecurityKey,
        ValidateIssuer = false,
        ValidateAudience = false
    };
}
