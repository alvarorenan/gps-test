# Essential Docker Compose commands for GPS Test project

.PHONY: up down logs clean help

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

test:
	@echo "🧪 Running tests..."
	docker compose exec backend dotnet test
	@echo "🧪 Tests completed"