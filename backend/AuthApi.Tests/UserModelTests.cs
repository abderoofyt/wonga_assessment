#nullable enable
using Xunit;
using System;

public class UserModelTests
{
    [Fact] public void Loan_DefaultStatus_IsActive() => Assert.Equal("active", new Loan().Status);
    [Fact] public void Loan_DefaultRepayType_IsNull() => Assert.Null(new Loan().RepayType);
    [Fact] public void Loan_DefaultRepaidAt_IsNull() => Assert.Null(new Loan().RepaidAt);
    [Fact] public void Loan_CreatedAt_IsRecentUtc()
    {
        var before = DateTime.UtcNow.AddSeconds(-1);
        var loan = new Loan();
        var after = DateTime.UtcNow.AddSeconds(1);
        Assert.InRange(loan.CreatedAt, before, after);
    }

    [Fact]
    public void User_CanSetAndGetProperties()
    {
        var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", Level = 5 };
        Assert.Equal("John", user.FirstName);
        Assert.Equal("Doe", user.LastName);
        Assert.Equal("john@test.com", user.Email);
        Assert.Equal(5, user.Level);
    }

    [Fact]
    public void Loan_CanSetAndGetProperties()
    {
        var loan = new Loan { Amount = 5000, Period = 12, Instalment = 427.56m, Status = "repaid" };
        Assert.Equal(5000, loan.Amount);
        Assert.Equal(12, loan.Period);
        Assert.Equal(427.56m, loan.Instalment);
        Assert.Equal("repaid", loan.Status);
    }
}
