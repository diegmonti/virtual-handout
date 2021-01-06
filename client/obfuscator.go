package main

import (
	"bytes"
	"fmt"
	"math/rand"
	"os"
	"strconv"
)

// https://github.com/unixpickle/gobfuscate/blob/master/strings.go
func obfuscatedStringCode(str string, name string) []byte {
	var res bytes.Buffer
	res.WriteString("func get" + name + "() string {\n")
	res.WriteString("\tmask := []byte(\"")
	mask := make([]byte, len(str))
	for i := range mask {
		mask[i] = byte(rand.Intn(256))
		res.WriteString(fmt.Sprintf("\\x%02x", mask[i]))
	}
	res.WriteString("\")\n\tmaskedStr := []byte(\"")
	for i, x := range []byte(str) {
		res.WriteString(fmt.Sprintf("\\x%02x", x^mask[i]))
	}
	res.WriteString("\")\n\tres := make([]byte, ")
	res.WriteString(strconv.Itoa(len(mask)))
	res.WriteString(")\n")
	res.WriteString("\tfor i, m := range mask {\n")
	res.WriteString("\t\tres[i] = m ^ maskedStr[i]\n")
	res.WriteString("\t}\n")
	res.WriteString("\treturn string(res)\n")
	res.WriteString("}\n\n")
	return res.Bytes()
}

func main() {

	var out bytes.Buffer

	out.WriteString("package main\n\n")
	out.Write(obfuscatedStringCode(os.Getenv("SERVER"), "Server"))
	out.Write(obfuscatedStringCode(os.Getenv("SECRET"), "Secret"))
	out.Write(obfuscatedStringCode(os.Getenv("BASEURL"), "BaseURL"))

	fmt.Printf("%s", out.Bytes())
}
