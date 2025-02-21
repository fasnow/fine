package logger

import (
	"testing"
)

func TestNewWithLogDir(t *testing.T) {
	logger := NewWithLogDir("./")
	logger.WithField("key", 1).WithField("user", "test_user").Info("error")
}
