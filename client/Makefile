all: get build

get:
	GOOS=windows GOARCH=386 go get github.com/tadvi/winc

build:
	GOOS=windows GOARCH=386 go build -ldflags="-H windowsgui -X main.server=$(SERVER) -X main.secret=$(SECRET) -X main.baseURL=$(BASEURL)" exam.go