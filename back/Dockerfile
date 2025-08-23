# Multi-stage build for .NET 6 backend
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY gps-test.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish gps-test.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENTRYPOINT ["dotnet", "gps-test.dll"]
