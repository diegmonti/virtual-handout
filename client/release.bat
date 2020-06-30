rsrc -manifest exam.manifest -o rsrc.syso
go build -ldflags="-H windowsgui" exam.go