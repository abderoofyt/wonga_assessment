using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

public static class LoanEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/loans", async (ClaimsPrincipal c, LoanDto dto, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(JwtHelper.GetId(c));
            if (user == null) return Results.NotFound();

            var loanCount = await db.Loans.CountAsync(l => l.UserId == user.Id); // count BEFORE adding
            var loan = new Loan
            {
                UserId = user.Id, Amount = dto.Amount, Period = dto.Period,
                Instalment = dto.Instalment, RepaymentDate = dto.RepaymentDate, Status = "active"
            };
            db.Loans.Add(loan);
            if (loanCount == 0) user.Level += 1; // first loan = level up
            await db.SaveChangesAsync();
            return Results.Ok(new { loan, user.Level, leveledUp = loanCount == 0 });
        }).RequireAuthorization();

        app.MapGet("/loans", async (ClaimsPrincipal c, AppDbContext db) =>
        {
            var loans = await db.Loans
                .Where(l => l.UserId == JwtHelper.GetId(c))
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
            return Results.Ok(loans);
        }).RequireAuthorization();

        app.MapPost("/loans/{id}/repay", async (int id, ClaimsPrincipal c, RepayDto dto, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(JwtHelper.GetId(c));
            var loan = await db.Loans.FindAsync(id);
            if (user == null || loan == null || loan.UserId != user.Id) return Results.NotFound();

            loan.Status   = "repaid";
            loan.RepaidAt = DateTime.UtcNow;
            loan.RepayType = dto.Type;

            if (dto.Type == "late")
            {
                user.MissedCount += 1;
                user.NextLevelTarget += 2; // penalty: need 2 more on-time payments
            }
            else
            {
                user.OnTimeCount += 1;
                if (user.OnTimeCount >= user.NextLevelTarget)
                {
                    user.Level += 1;
                    user.OnTimeCount = 0;
                    user.MissedCount = 0;
                    user.NextLevelTarget = 3;
                }
            }
            await db.SaveChangesAsync();
            return Results.Ok(new { user.Level, user.OnTimeCount, user.MissedCount, user.NextLevelTarget, loan.Status });
        }).RequireAuthorization();
    }
}
