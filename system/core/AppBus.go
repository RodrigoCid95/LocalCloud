package core

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

const (
	AppBusScopeUser   = "user"
	AppBusScopeShared = "shared"
)

type AppBusClient struct {
	PackageName string
	Scope       string
	Room        string
	Uid         int
	InstanceId  string
	Events      chan AppBusEvent
}

type AppBusMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type AppBusEvent struct {
	Id          string          `json:"id"`
	PackageName string          `json:"packageName"`
	Scope       string          `json:"scope"`
	Room        string          `json:"room"`
	From        AppBusEventFrom `json:"from"`
	Type        string          `json:"type"`
	Payload     json.RawMessage `json:"payload"`
	CreatedAt   time.Time       `json:"createdAt"`
}

type AppBusEventFrom struct {
	Uid        int    `json:"uid"`
	InstanceId string `json:"instanceId"`
}

type AppBus struct {
	mu      sync.RWMutex
	clients map[AppBusTopic]map[*AppBusClient]struct{}
}

type AppBusTopic struct {
	PackageName string
	Scope       string
	Room        string
	Uid         int
}

func (ab *AppBus) Subscribe(packageName string, scope string, room string, uid int, instanceId string) (*AppBusClient, error) {
	if err := ValidatePackageName(packageName); err != nil {
		return nil, err
	}
	if err := validateAppBusScope(scope); err != nil {
		return nil, err
	}
	if err := validateAppBusName("room", room); err != nil {
		return nil, err
	}
	if instanceId != "" {
		if err := validateAppBusName("instanceId", instanceId); err != nil {
			return nil, err
		}
	}

	client := &AppBusClient{
		PackageName: packageName,
		Scope:       scope,
		Room:        room,
		Uid:         uid,
		InstanceId:  instanceId,
		Events:      make(chan AppBusEvent, 32),
	}

	ab.mu.Lock()
	defer ab.mu.Unlock()

	if ab.clients == nil {
		ab.clients = map[AppBusTopic]map[*AppBusClient]struct{}{}
	}

	key := appBusTopicKey(packageName, scope, room, uid)
	if ab.clients[key] == nil {
		ab.clients[key] = map[*AppBusClient]struct{}{}
	}
	ab.clients[key][client] = struct{}{}

	return client, nil
}

func (ab *AppBus) Unsubscribe(client *AppBusClient) {
	key := appBusTopicKey(client.PackageName, client.Scope, client.Room, client.Uid)

	ab.mu.Lock()
	defer ab.mu.Unlock()

	if clients, ok := ab.clients[key]; ok {
		delete(clients, client)
		if len(clients) == 0 {
			delete(ab.clients, key)
		}
	}

	close(client.Events)
}

func (ab *AppBus) Publish(client *AppBusClient, message AppBusMessage) error {
	if err := validateAppBusMessage(message); err != nil {
		return err
	}

	event := AppBusEvent{
		Id:          appBusEventId(),
		PackageName: client.PackageName,
		Scope:       client.Scope,
		Room:        client.Room,
		From: AppBusEventFrom{
			Uid:        client.Uid,
			InstanceId: client.InstanceId,
		},
		Type:      message.Type,
		Payload:   message.Payload,
		CreatedAt: time.Now().UTC(),
	}

	key := appBusTopicKey(client.PackageName, client.Scope, client.Room, client.Uid)

	ab.mu.RLock()
	defer ab.mu.RUnlock()

	for subscriber := range ab.clients[key] {
		select {
		case subscriber.Events <- event:
		default:
		}
	}

	return nil
}

func appBusTopicKey(packageName string, scope string, room string, uid int) AppBusTopic {
	if scope == AppBusScopeShared {
		uid = 0
	}

	return AppBusTopic{
		PackageName: packageName,
		Scope:       scope,
		Room:        room,
		Uid:         uid,
	}
}

func validateAppBusScope(scope string) error {
	switch scope {
	case AppBusScopeUser, AppBusScopeShared:
		return nil
	default:
		return fmt.Errorf("scope de app bus no valido: %q", scope)
	}
}

func validateAppBusName(name string, value string) error {
	if value == "" || len(value) > 256 {
		return fmt.Errorf("%s de app bus no valido: %q", name, value)
	}
	return nil
}

func validateAppBusMessage(message AppBusMessage) error {
	if message.Type == "" || len(message.Type) > 128 {
		return fmt.Errorf("tipo de mensaje de app bus no valido")
	}
	if message.Payload == nil {
		message.Payload = json.RawMessage("null")
	}
	if !json.Valid(message.Payload) {
		return fmt.Errorf("payload de app bus no es JSON valido")
	}
	return validateAppBusName("type", message.Type)
}

func appBusEventId() string {
	id := make([]byte, 16)
	if _, err := rand.Read(id); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}

	return hex.EncodeToString(id)
}
