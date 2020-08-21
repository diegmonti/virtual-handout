package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"os/user"

	"github.com/tadvi/winc"
)

var server string
var secret string
var baseURL string

type response struct {
	Label    string `json:"label"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func main() {

	user, err := user.Current()
	if err != nil {
		panic(err)
	}

	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	requestBody, err := json.Marshal(map[string]string{
		"username": user.Username,
		"hostname": hostname,
	})
	if err != nil {
		panic(err)
	}

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(requestBody)
	requestMac := mac.Sum(nil)

	client := &http.Client{}
	req, err := http.NewRequest("POST", server, bytes.NewReader(requestBody))
	if err != nil {
		panic(err)
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Signature", hex.EncodeToString(requestMac))

	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer res.Body.Close()

	responseBody, err := ioutil.ReadAll(res.Body)
	if err != nil {
		panic(err)
	}

	resContent := response{}
	err = json.Unmarshal(responseBody, &resContent)
	if err != nil {
		panic(err)
	}

	mainWindow := winc.NewForm(nil)
	mainWindow.SetSize(500, 200)
	mainWindow.SetText("Virtual Handout")

	consolasFont := winc.NewFont("Consolas", 18, 0)
	tohomaFont := winc.NewFont("Tahoma", 10, 0)

	infoLabel := winc.NewLabel(mainWindow)
	infoLabel.SetPos(10, 10)
	infoLabel.SetSize(490, 30)
	infoLabel.SetFont(consolasFont)
	infoLabel.SetText(resContent.Label)

	repositoryLabel := winc.NewLabel(mainWindow)
	repositoryLabel.SetPos(10, 50)
	repositoryLabel.SetSize(100, 22)
	repositoryLabel.SetFont(tohomaFont)
	repositoryLabel.SetText("Repository:")

	repository := winc.NewEdit(mainWindow)
	repository.SetText(baseURL + resContent.Username)
	repository.SetReadOnly(true)
	repository.SetPos(80, 50)
	repository.SetSize(390, 22)

	usernameLabel := winc.NewLabel(mainWindow)
	usernameLabel.SetPos(10, 90)
	usernameLabel.SetSize(100, 22)
	usernameLabel.SetFont(tohomaFont)
	usernameLabel.SetText("Username:")

	username := winc.NewEdit(mainWindow)
	username.SetText(resContent.Username)
	username.SetReadOnly(true)
	username.SetPos(80, 90)
	username.SetSize(390, 22)

	passwordLabel := winc.NewLabel(mainWindow)
	passwordLabel.SetPos(10, 130)
	passwordLabel.SetSize(100, 22)
	passwordLabel.SetFont(tohomaFont)
	passwordLabel.SetText("Password:")

	password := winc.NewEdit(mainWindow)
	password.SetText(resContent.Password)
	password.SetReadOnly(true)
	password.SetPos(80, 130)
	password.SetSize(390, 22)

	mainWindow.Center()
	mainWindow.Show()
	mainWindow.OnClose().Bind(wndOnClose)

	winc.RunMainLoop()
}

func wndOnClose(arg *winc.Event) {
	winc.Exit()
}
