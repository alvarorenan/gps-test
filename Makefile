# Essential Docker Compose commands for GPS Test project

.PHONY: up down logs clean help test-back

up: ## Start all services (database, backend, frontend)
	docker compose up --build -d
	@echo "🚀 Services started:"
	@echo "   Frontend: http://localhost"
	@echo "   Backend API: http://localhost:8080"
	@echo "   Swagger: http://localhost:8080/swagger"

down: ## Stop and remove all services
	docker compose down
	@echo "🛑 All services stopped"

logs: ## Show logs from all services
	docker compose logs -f

clean: ## Stop services and remove volumes/networks
	docker compose down -v --remove-orphans
	docker system prune -f --volumes
	@echo "🧹 Cleaned up containers, volumes, and networks"

help: ## Show available commands
	@echo "GPS Test - Docker Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?##' Makefile | awk -F':|##' '{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$3}'

test-back: ## Run backend tests with real-time verbose output
	@echo "⚙️  Running backend tests..."
	@echo "=================================="
	@docker run --rm -v $(PWD):/src -w /src mcr.microsoft.com/dotnet/sdk:6.0 \
		dotnet test back/gps-test.Tests/gps-test.Tests.csproj \
		--logger "console;verbosity=detailed" \
		--verbosity normal \
		--nologo
	@echo "=================================="
	@echo "✅ Backend tests completed" 