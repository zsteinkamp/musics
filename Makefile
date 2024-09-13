.DEFAULT_GOAL := default

GREP               ?= $(shell command -v ggrep 2> /dev/null || command -v grep 2> /dev/null)
AWK                ?= $(shell command -v gawk 2> /dev/null || command -v awk 2> /dev/null)

help: ## Show makefile targets and their descriptions
	@$(GREP) --no-filename -E '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		$(AWK) 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-28s\033[0m %s\n", $$1, $$2}' | sort

devup: ## Start development environment
	cd dev && docker compose build && docker compose up -d --force-recreate && docker compose logs -f

devlogs: ## Tail logs in development environment
	cd dev && docker compose logs -f

devdown: ## Stop/rm development environment
	cd dev && docker compose down

default: config ## Build and run production environment
	docker compose build && docker compose up -d --force-recreate

config: docker-compose.yml nginx.conf ## Run setup script to generate docker-compose.yml and nginx.conf files

docker-compose.yml nginx.conf:
	bin/gen-config

clean: config ## Remove docker-compose.yml and nginx.conf files
	mv docker-compose.yml docker-compose.yml.BAK && mv nginx.conf nginx.conf.BAK
