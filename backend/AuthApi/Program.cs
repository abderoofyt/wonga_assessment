using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt => opt.TokenValidationParameters = JwtHelper.ValidationParams());
builder.Services.AddAuthorization();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Wait for DB on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    for (int i = 0; i < 10; i++)
    {
        try { db.Database.EnsureCreated(); break; }
        catch { Thread.Sleep(2000); }
    }
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Register all endpoint groups
AuthEndpoints.Map(app);
ProfileEndpoints.Map(app);
LoanEndpoints.Map(app);

app.Run();

public partial class Program { } // required for integration tests
