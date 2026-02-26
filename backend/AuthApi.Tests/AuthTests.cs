using Xunit;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public class AuthTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

    public AuthTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(b => b.ConfigureServices(s =>
        {
            var toRemove = s.Where(d =>
                d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                d.ServiceType == typeof(DbContextOptions) ||
                d.ServiceType.ToString().Contains("Npgsql") ||
                d.ServiceType.ToString().Contains("IDbContextOptionsConfiguration")
            ).ToList();
            foreach (var d in toRemove) s.Remove(d);
            s.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("AuthTestDb_" + Guid.NewGuid()));
        })).CreateClient();
    }

    private async Task<string> Register(string email) {
        var res = await _client.PostAsJsonAsync("/register", new { firstName = "Test", lastName = "User", email, password = "pass123", phone = (string?)null, idNumber = (string?)null });
        var data = JsonSerializer.Deserialize<TokenResult>(await res.Content.ReadAsStringAsync(), _json);
        return data!.Token!;
    }

    [Fact]
    public async Task Register_ReturnsToken()
    {
        var token = await Register("reg@test.com");
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public async Task CheckEmail_UnknownEmail_ReturnsFalse()
    {
        var res = await _client.PostAsJsonAsync("/check-email", new { email = "ghost@test.com" });
        var data = JsonSerializer.Deserialize<CheckResult>(await res.Content.ReadAsStringAsync(), _json);
        Assert.False(data!.Exists);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        await Register("wrong@test.com");
        var res = await _client.PostAsJsonAsync("/login", new { email = "wrong@test.com", password = "badpassword" });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Login_UnknownEmail_ReturnsUnauthorized()
    {
        var res = await _client.PostAsJsonAsync("/login", new { email = "nobody@test.com", password = "pass123" });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    record TokenResult(string? Token);
    record CheckResult(bool Exists);
}