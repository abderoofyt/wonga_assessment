using Xunit;

/// <summary>
/// Unit tests for BCrypt password hashing — no DB or API needed.
/// Run: dotnet test --filter "FullyQualifiedName~PasswordTests"
/// </summary>
public class PasswordTests
{
    [Fact]
    public void HashAndVerify_Works() =>
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", BCrypt.Net.BCrypt.HashPassword("password123")));

    [Fact]
    public void WrongPassword_Fails() =>
        Assert.False(BCrypt.Net.BCrypt.Verify("wrong", BCrypt.Net.BCrypt.HashPassword("password123")));

    [Fact]
    public void DifferentHashes_ForSamePassword() =>
        Assert.NotEqual(BCrypt.Net.BCrypt.HashPassword("password123"), BCrypt.Net.BCrypt.HashPassword("password123"));

    [Fact]
    public void EmptyPassword_DoesNotMatchNonEmpty() =>
        Assert.False(BCrypt.Net.BCrypt.Verify("", BCrypt.Net.BCrypt.HashPassword("password123")));
}
