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
