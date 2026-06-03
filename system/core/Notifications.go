package core

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

type NotificationClient struct {
	PackageName string
	Uid         int
	Events      chan NotificationEvent
}

type NotificationMessage struct {
	Type    string          `json:"type"`
	Title   string          `json:"title,omitempty"`
	Message string          `json:"message,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type NotificationEvent struct {
	Id          string          `json:"id"`
	PackageName string          `json:"packageName"`
	Uid         int             `json:"uid"`
	Type        string          `json:"type"`
	Title       string          `json:"title,omitempty"`
	Message     string          `json:"message,omitempty"`
	Payload     json.RawMessage `json:"payload,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
}

type Notifications struct {
	mu      sync.RWMutex
	clients map[int]map[*NotificationClient]struct{}
}

func (n *Notifications) Subscribe(packageName string, uid int) (*NotificationClient, error) {
	if err := ValidatePackageName(packageName); err != nil {
		return nil, err
	}

	client := &NotificationClient{
		PackageName: packageName,
		Uid:         uid,
		Events:      make(chan NotificationEvent, 32),
	}

	n.mu.Lock()
	defer n.mu.Unlock()

	if n.clients == nil {
		n.clients = map[int]map[*NotificationClient]struct{}{}
	}

	if n.clients[uid] == nil {
		n.clients[uid] = map[*NotificationClient]struct{}{}
	}
	n.clients[uid][client] = struct{}{}

	return client, nil
}

func (n *Notifications) Unsubscribe(client *NotificationClient) {
	n.mu.Lock()
	defer n.mu.Unlock()

	if clients, ok := n.clients[client.Uid]; ok {
		delete(clients, client)
		if len(clients) == 0 {
			delete(n.clients, client.Uid)
		}
	}

	close(client.Events)
}

func (n *Notifications) SendToUser(packageName string, uid int, message NotificationMessage) (NotificationEvent, error) {
	if err := ValidatePackageName(packageName); err != nil {
		return NotificationEvent{}, err
	}
	if err := validateNotificationMessage(message); err != nil {
		return NotificationEvent{}, err
	}

	event := NotificationEvent{
		Id:          notificationEventId(),
		PackageName: packageName,
		Uid:         uid,
		Type:        message.Type,
		Title:       message.Title,
		Message:     message.Message,
		Payload:     message.Payload,
		CreatedAt:   time.Now().UTC(),
	}

	n.mu.RLock()
	defer n.mu.RUnlock()

	for subscriber := range n.clients[uid] {
		select {
		case subscriber.Events <- event:
		default:
		}
	}

	return event, nil
}

func validateNotificationMessage(message NotificationMessage) error {
	if message.Type == "" || len(message.Type) > 128 {
		return fmt.Errorf("tipo de notificacion no valido")
	}
	if len(message.Title) > 256 {
		return fmt.Errorf("titulo de notificacion no valido")
	}
	if len(message.Message) > 4096 {
		return fmt.Errorf("mensaje de notificacion no valido")
	}
	if message.Payload != nil && !json.Valid(message.Payload) {
		return fmt.Errorf("payload de notificacion no es JSON valido")
	}

	return nil
}

func notificationEventId() string {
	id := make([]byte, 16)
	if _, err := rand.Read(id); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}

	return hex.EncodeToString(id)
}
