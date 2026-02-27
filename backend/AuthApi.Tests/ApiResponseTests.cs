#nullable enable
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

public class ApiResponseTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private static readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

    public ApiResponseTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(b => b.ConfigureServices(s =>
        {
            var toRemove = s.Where(d =>
                d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                d.ServiceType == typeof(DbContextOptions) ||
                d.ServiceType.ToString().Contains("Npgsql") ||
                d.ServiceType.ToString().Contains("IDbContextOptionsConfiguration")
            ).ToList();
            foreach (var d in toRemove) s.Remove(d);
            s.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("ApiRespDb_" + Guid.NewGuid()));
        }));
    }

    private HttpClient NewClient() => _factory.CreateClient();

    private async Task<HttpClient> AuthClient(string email)
    {
        var client = NewClient();
        var res = await client.PostAsJsonAsync("/register", new { firstName = "Test", lastName = "User", email, password = "pass123", phone = (string?)null, idNumber = (string?)null });
        var token = JsonSerializer.Deserialize<TokenResult>(await res.Content.ReadAsStringAsync(), _json)!.Token!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", token);
        return client;
    }

    [Fact] public async Task Register_Returns200() => Assert.Equal(HttpStatusCode.OK, (await NewClient().PostAsJsonAsync("/register", new { firstName = "Test", lastName = "User", email = "ok@test.com", password = "pass123", phone = (string?)null, idNumber = (string?)null })).StatusCode);
    [Fact] public async Task CheckEmail_Returns200() => Assert.Equal(HttpStatusCode.OK, (await NewClient().PostAsJsonAsync("/check-email", new { email = "any@test.com" })).StatusCode);


    [Fact]
    public async Task Register_Response_HasTokenAndIsNewUser()
    {
        var res = await NewClient().PostAsJsonAsync("/register", new { firstName = "Test", lastName = "User", email = "shape@test.com", password = "pass123", phone = (string?)null, idNumber = (string?)null });
        var data = JsonSerializer.Deserialize<RegisterResult>(await res.Content.ReadAsStringAsync(), _json)!;
        Assert.NotNull(data.Token);
        Assert.True(data.IsNewUser);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ResponseContainsMessage()
    {
        var client = NewClient();
        await client.PostAsJsonAsync("/register", new { firstName = "Test", lastName = "User", email = "dup2@test.com", password = "pass123", phone = (string?)null, idNumber = (string?)null });
        var res = await client.PostAsJsonAsync("/register", new { firstName = "A", lastName = "B", email = "dup2@test.com", password = "pass123", phone = (string?)null, idNumber = (string?)null });
        Assert.NotEmpty(await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Register_InvalidName_ErrorMentionsFieldName()
    {
        var res = await NewClient().PostAsJsonAsync("/register", new { firstName = "J", lastName = "Doe", email = "errfield@test.com", password = "pass123", phone = (string?)null, idNumber = (string?)null });
        Assert.Contains("First name", await res.Content.ReadAsStringAsync());
    }

    record TokenResult(string? Token);
    record RegisterResult(string? Token, bool IsNewUser);
}
