package notify

import (
	"context"
	"fmt"
	"net/smtp"
)

// SMTPSender delivers notifications as plain-text email.
type SMTPSender struct {
	Addr string
	From string
	// Resolve maps a user id to an email address.
	Resolve func(userID string) (string, error)
}

func (s SMTPSender) Send(_ context.Context, m Message) error {
	to, err := s.Resolve(m.UserID)
	if err != nil {
		return fmt.Errorf("resolve recipient: %w", err)
	}
	body := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: LearnSphere: %s\r\n\r\n%s\r\n", s.From, to, m.Kind, m.Body)
	return smtp.SendMail(s.Addr, nil, s.From, []string{to}, []byte(body))
}
