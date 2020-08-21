all: build run

build: build-client build-server

build-client:
	docker run -it --rm -v $(shell pwd)/client:/usr/src/myapp -w /usr/src/myapp --env-file .env golang make

build-server:
	docker build -t virtual-handout .

run:
	docker run -d --name virtual-handout -p 3000:3000 -v $(shell pwd)/data:/home/node/app/data virtual-handout

clean:
	docker stop virtual-handout
	docker rm virtual-handout
	rm client/exam.exe