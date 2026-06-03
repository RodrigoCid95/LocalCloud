package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"strings"
)

type Encrypt struct{}

func (e *Encrypt) generateAESGCMKey(key string) (cipher.AEAD, error) {
	keyBytes := []byte(key)
	if len(keyBytes) > 16 {
		keyBytes = keyBytes[:16]
	} else if len(keyBytes) < 16 {
		return nil, errors.New("la clave es demasiado corta para AES-128")
	}

	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return nil, fmt.Errorf("error al crear el cifrador AES: %w", err)
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("error al crear GCM: %w", err)
	}
	return aesgcm, nil
}

func (e *Encrypt) Encrypt(key string, data string) (string, error) {
	aesgcm, err := e.generateAESGCMKey(key)
	if err != nil {
		return "", fmt.Errorf("error al generar clave AES-GCM: %w", err)
	}

	nonce := make([]byte, aesgcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("error al generar Nonce: %w", err)
	}

	encryptedData := aesgcm.Seal(nil, nonce, []byte(data), nil)

	combined := append(nonce, encryptedData...)

	result := hex.EncodeToString(combined)
	return result, nil
}

func (e *Encrypt) Decrypt(key string, strEncrypted string) (string, error) {
	aesgcm, err := e.generateAESGCMKey(key)
	if err != nil {
		return "", fmt.Errorf("error al generar clave AES-GCM: %w", err)
	}

	combined, err := hex.DecodeString(strEncrypted)
	if err != nil {
		return "", fmt.Errorf("error al decodificar la cadena hexadecimal: %w", err)
	}

	nonceSize := aesgcm.NonceSize()
	if len(combined) < nonceSize {
		return "", errors.New("datos cifrados demasiado cortos para contener el Nonce")
	}

	nonce := combined[:nonceSize]
	encryptedData := combined[nonceSize:]

	decryptedData, err := aesgcm.Open(nil, nonce, encryptedData, nil)
	if err != nil {
		return "", fmt.Errorf("error al descifrar los datos: %w. La clave o el Nonce podrían ser incorrectos o los datos están corruptos", err)
	}

	return string(decryptedData), nil
}

func (e *Encrypt) CreateHash(plainText string, salt *string) (*string, error) {
	var cmd *exec.Cmd
	if salt != nil {
		cmd = exec.Command("openssl", "passwd", "-6", "-salt", *salt, plainText)
	} else {
		cmd = exec.Command("openssl", "passwd", "-6", plainText)
	}
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	result := strings.Split(string(output), "\n")[0]
	return &result, nil
}

func (e *Encrypt) VerifyHash(plainText string, hash string) (bool, error) {
	salt := strings.Split(hash, "$")[2]
	newhash, err := e.CreateHash(plainText, &salt)
	if err != nil {
		return false, err
	}
	return *newhash == hash, nil
}
