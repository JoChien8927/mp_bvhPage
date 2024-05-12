DC=docker-compose
MC=front
UTC=unitary-test

all:start

init: ## Init the project after a git clone
	@echo "INIT PROJECT"
	@echo "Copying .env.dist in .env"
	@cp .env.dist .env
	@echo ".env: \n"
	@cat .env
	@echo "\n"

dev: ## Launch the project stack with attached output (ctrl+c will kill project)
	@echo "Launch attached project and build\n"
	$(DC) up --build

build: ## Build the project stack
	@echo "build\n"
	$(DC) build

start: ## Build and launch the project in background
	@echo "Launch dettached projet and build\n"
	$(DC) up -d --build

stop: ## Stop the project stack
	$(DC) stop

clean: ## Stop and delete the project stack
	$(DC) down

logs: ## Attach to standard output of containers (to see logs)
	$(DC) -f docker-compose.yml logs -f $(MC)

logs-tail: ## Attach to standard output of containers (only tail of the log)
	@if [ -z "$l" ]; then \
	$(DC) -f docker-compose.yml logs -f --tail 50 $(MC); \
	else \
	$(DC) -f docker-compose.yml logs -f --tail $(l) $(MC); \
	fi

re: clean start

help: ## help command
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m- %-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := start

install_dc: ## Install docker
	sudo curl https://get.docker.com | sudo sh -

install_dcc: ## Install docker-compose
	COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
	sudo sh -c "curl -L https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose"
	sudo chmod +x /usr/local/bin/docker-compose
	sudo sh -c "curl -L https://raw.githubusercontent.com/docker/compose/${COMPOSE_VERSION}/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose"
	docker-compose -v

.PHONY: all test clean_test
