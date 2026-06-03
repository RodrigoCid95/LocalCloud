package types

type EncryptService interface {
	Encrypt(key string, data string) (string, error)
	Decrypt(key string, strEncrypted string) (string, error)
	CreateHash(plainText string, salt *string) (*string, error)
	VerifyHash(plainText string, hash string) (bool, error)
}
