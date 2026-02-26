FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY AuthApi/AuthApi.csproj ./AuthApi/
RUN dotnet restore ./AuthApi/AuthApi.csproj
COPY . .
RUN dotnet publish AuthApi/AuthApi.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /out .
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "AuthApi.dll"]
