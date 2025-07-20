build:
	docker-compose build

build-no-cache:
	rm -rf node_modules && yarn && docker-compose build --no-cache	

up:
	docker-compose up

down:
	docker-compose down
