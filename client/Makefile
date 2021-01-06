all: obfuscate get build

obfuscate:
	go build obfuscator.go
	./obfuscator > obfuscated.go

get:
	GOOS=windows GOARCH=386 go get github.com/tadvi/winc

build:
	GOOS=windows GOARCH=386 go build -ldflags="-H windowsgui" exam.go obfuscated.go