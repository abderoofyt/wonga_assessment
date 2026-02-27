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
