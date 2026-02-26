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

public class ProfileTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

    public ProfileTests(WebApplicationFactory<Program> factory)
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
            s.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("ProfileTestDb_" + Guid.NewGuid()));
        })).CreateClient();
    }

    private async Task<string> Register(string email) {
        var res = await _client.PostAsJsonAsync("/register", new { firstName = "Test", lastName = "User", email, password = "pass123", phone = (string?)null, idNumber = (string?)null });
        var data = JsonSerializer.Deserialize<TokenResult>(await res.Content.ReadAsStringAsync(), _json);
        return data!.Token!;
    }

    private void Authorize(string token) =>
        _client.DefaultRequestHeaders.Authorization = new("Bearer", token);

    [Fact]
    public async Task GetProfile_WithoutToken_Returns401()
    {
        var res = await _client.GetAsync("/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task PatchProfile_WithoutToken_Returns401()
    {
        var res = await _client.PatchAsync("/profile", JsonContent.Create(new { firstName = "X", lastName = "Y", phone = (string?)null, idNumber = (string?)null }));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    record TokenResult(string? Token);
    record ProfileResult(string? FirstName, string? LastName, string? Email, string? Phone, string? IdNumber, int Level, int OnTimeCount, int MissedCount, int NextLevelTarget);
}
