#nullable enable
using Xunit;

/// Unit tests for Validate.Name()
public class NameTests
{
    [Fact] public void Valid_Name_ReturnsNull() => Assert.Null(Validate.Name("John", "First name"));

    [Fact]
    public void Error_Contains_FieldName()
    {
        var err = Validate.Name("1", "Last name");
        Assert.Contains("Last name", err!);
    }

    [Fact]
    public void TooShort_Error_MentionsTwoChars()
    {
        var err = Validate.Name("J", "First name");
        Assert.Contains("2", err!);
    }
}
