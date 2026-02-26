using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

public static class HttpExtensions
{
    public static Task<HttpResponseMessage> PatchAsJsonAsync<T>(this HttpClient client, string url, T value) =>
        client.PatchAsync(url, JsonContent.Create(value));
}
