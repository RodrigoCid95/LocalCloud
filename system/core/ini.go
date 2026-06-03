package core

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"localcloud/utils"
	"log"
	"math/big"
	"net"
	"os"
	"path/filepath"
	"time"

	"gopkg.in/ini.v1"
)

var generalCfg *ini.File

const configPath string = "/etc/local-cloud/conf.ini"

var groupPath string
var shadowPath string
var passwdPath string
var homePath string

var sambaConfigPath string
var sambaBinPath string

var sharedDirPath string
var appsPath string
var systemAppsPath string
var appDataPath string
var tempPath string

var encrypt = utils.Encrypt{}

const appAssignmentsPath string = "/etc/local-cloud/assignments.json"

var Cert = Certificate{}

var PermissionsAllowed = []string{
	APPS_GET_ALL,
	APPS_GET,
	APPS_UPDATE,

	APP_BUS_CONNECT,
	APP_BUS_SHARED,

	NOTIFICATIONS_STREAM,
	NOTIFICATIONS_SEND,

	APP_STORE_READ,
	APP_STORE_WRITE,
	APP_STORE_DELETE,
	APP_STORE_COMPACT,

	PROFILE_GET,
	PROFILE_GET_APPS,
	PROFILE_UPDATE,
	PROFILE_SET_PASSWORD,
	PROFILE_SET_SAMBA_PASSWORD,

	USERS_CREATE,
	USERS_GET_ALL,
	USERS_GET,
	USERS_UPDATE,
	USERS_DELETE,
	USERS_SET_PASSWORD,

	ASSIGNMENTS_GET,
	ASSIGNMENTS_ADD,
	ASSIGNMENTS_REMOVE,

	PERMISSIONS_GET,
	PERMISSIONS_ENABLE,
	PERMISSIONS_DISABLE,

	SOURCES_GET,
	SOURCES_ENABLE,
	SOURCES_DISABLE,

	SAMBA_BELONGS_TO,
	SAMBA_ENABLE,
	SAMBA_DISABLE,
	SAMBA_SET_PASSWORD,

	SYSTEM_STATUS_GET,
	SYSTEM_SHUTDOWN,
	SYSTEM_REBOOT,

	FILESYSTEM_READ_DIR,
	FILESYSTEM_READ_FILE,
	FILESYSTEM_CREATE_DIR,
	FILESYSTEM_WRITE_FILE,
	FILESYSTEM_DELETE,
	FILESYSTEM_RENAME,
}

var SourceTypesAllowed = []string{
	"img",
	"media",
	"object",
	"script",
	"style",
	"worker",
	"font",
	"connect",
}

type Certificate struct {
	Cert string `json:"cert"`
	Key  string `json:"key"`
}

func verifyConfig() {
	generalCfg.Reload()
	defer func() {
		if err := generalCfg.SaveTo(configPath); err != nil {
			panic(err.Error())
		}
	}()

	if !generalCfg.HasSection("System Paths") {
		section, _ := generalCfg.NewSection("System Paths")
		section.NewKey("group", "/etc/group")
		section.NewKey("shadow", "/etc/shadow")
		section.NewKey("passwd", "/etc/passwd")
		section.NewKey("home", "/home")
	}

	if !generalCfg.HasSection("Samba") {
		section, _ := generalCfg.NewSection("Samba")
		section.NewKey("config path", "/etc/samba/smb.conf")
		section.NewKey("bin", "smbpasswd")
	}

	if !generalCfg.HasSection("Paths") {
		section, _ := generalCfg.NewSection("Paths")
		section.NewKey("shared", "/shared")
		section.NewKey("apps", "/usr/share/local-cloud/apps")
		section.NewKey("system apps", "/usr/share/local-cloud/system-apps")
		section.NewKey("app data", "/etc/local-cloud/app-data")
		section.NewKey("temp", "/tmp/local-cloud")
	}
	pathsSection, _ := generalCfg.GetSection("Paths")
	if !pathsSection.HasKey("app data") {
		pathsSection.NewKey("app data", "/etc/local-cloud/app-data")
	}

	if !generalCfg.HasSection("Server") {
		section, _ := generalCfg.NewSection("Server")
		section.NewKey("cert", "/etc/local-cloud/ssl/cert.pem")
		section.NewKey("key", "/etc/local-cloud/ssl/key.pem")
	}
}

func loadConfig() {
	generalCfg.Reload()

	section, err := generalCfg.GetSection("System Paths")
	if err != nil {
		panic(err.Error())
	}

	key, _ := section.GetKey("group")
	groupPath = key.Value()
	key, _ = section.GetKey("shadow")
	shadowPath = key.Value()
	key, _ = section.GetKey("passwd")
	passwdPath = key.Value()
	key, _ = section.GetKey("home")
	homePath = key.Value()

	section, err = generalCfg.GetSection("Samba")
	if err != nil {
		panic(err.Error())
	}

	key, _ = section.GetKey("config path")
	sambaConfigPath = key.Value()
	key, _ = section.GetKey("bin")
	sambaBinPath = key.Value()

	section, err = generalCfg.GetSection("Paths")
	if err != nil {
		panic(err.Error())
	}

	key, _ = section.GetKey("shared")
	sharedDirPath = key.Value()
	key, _ = section.GetKey("apps")
	appsPath = key.Value()
	key, _ = section.GetKey("system apps")
	systemAppsPath = key.Value()
	key, _ = section.GetKey("app data")
	appDataPath = key.Value()
	key, _ = section.GetKey("temp")
	tempPath = key.Value()

	section, err = generalCfg.GetSection("Server")
	if err != nil {
		panic(err.Error())
	}

	key, _ = section.GetKey("cert")
	Cert.Cert = key.Value()
	key, _ = section.GetKey("key")
	Cert.Key = key.Value()
}

func init() {
	if !utils.FileExists(configPath) {
		if err := utils.WriteFile(configPath, ""); err != nil {
			panic(err)
		}
	}

	log.Printf("[Core] Loading config %s\n", configPath)
	cfg, err := ini.Load(configPath)
	if err != nil {
		panic(err)
	}
	generalCfg = cfg

	verifyConfig()
	loadConfig()

	if !utils.FileExists(groupPath) {
		panic("Group file not exists!")
	}

	if !utils.FileExists(shadowPath) {
		panic("Shadow file not exists!")
	}

	if !utils.FileExists(passwdPath) {
		panic("Passwd file not exists!")
	}

	if !utils.DirExists(homePath) {
		panic("Home dir not exists!")
	}

	if !utils.FileExists(sambaConfigPath) {
		panic("Samba file config not exists!")
	}

	if !utils.DirExists(sharedDirPath) {
		if err := utils.Mkdir(sharedDirPath); err != nil {
			panic(err)
		}
		log.Printf("[Core] Created directory %s\n", sharedDirPath)
	}

	if !utils.DirExists(appsPath) {
		if err := utils.Mkdir(appsPath); err != nil {
			panic(err)
		}
		log.Printf("[Core] Created directory %s\n", appsPath)
	}

	if !utils.DirExists(appDataPath) {
		if err := utils.Mkdir(appDataPath); err != nil {
			panic(err)
		}
		log.Printf("[Core] Created directory %s\n", appDataPath)
	}

	if !utils.DirExists(tempPath) {
		if err := utils.Mkdir(tempPath); err != nil {
			panic(err)
		}
		log.Printf("[Core] Created directory %s\n", tempPath)
	}

	if !utils.FileExists(Cert.Cert) || !utils.FileExists(Cert.Key) {
		if err := generateSelfSigned(Cert.Cert, Cert.Key); err != nil {
			panic(err)
		}
	}

	verifySambaConfig()
}

func generateSelfSigned(certPath, keyPath string) error {
	certBase := filepath.Dir(certPath)
	if !utils.DirExists(certBase) {
		if err := utils.Mkdir(certBase); err != nil {
			return err
		}
	}

	keyBase := filepath.Dir(keyPath)
	if !utils.DirExists(keyBase) {
		if err := utils.Mkdir(keyBase); err != nil {
			return err
		}
	}

	log.Printf("[Core] Generating ssl certificate (%s, %s)", certPath, keyPath)
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return err
	}

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		return err
	}

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"LocalCloud"},
		},
		NotBefore: time.Now(),
		NotAfter:  time.Now().Add(365 * 24 * time.Hour),

		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	template.IPAddresses = []net.IP{net.ParseIP("127.0.0.1")}
	template.DNSNames = []string{"localhost"}

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
	if err != nil {
		return err
	}

	certOut, err := os.OpenFile(certPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer certOut.Close()

	if err := pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes}); err != nil {
		return err
	}

	keyOut, err := os.OpenFile(keyPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0600)
	if err != nil {
		return err
	}
	defer keyOut.Close()

	privBytes := x509.MarshalPKCS1PrivateKey(priv)
	if err := pem.Encode(keyOut, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: privBytes}); err != nil {
		return err
	}

	return nil
}
