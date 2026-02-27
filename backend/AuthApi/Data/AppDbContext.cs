using Microsoft.EntityFrameworkCore;

public class AppDbContext(DbContextOptions<AppDbContext> opt) : DbContext(opt)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Loan> Loans => Set<Loan>();
}
