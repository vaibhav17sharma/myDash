.PHONY: build up down logs restart clean help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs
	docker-compose logs -f

restart: ## Restart all services
	docker-compose restart

clean: ## Remove containers, images, and volumes
	docker-compose down -v
	docker system prune -f

rebuild: ## Rebuild and restart
	docker-compose up -d --build

status: ## Show container status
	docker-compose ps
