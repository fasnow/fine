package utils

import (
	"os"
	"path/filepath"
)

func WriteFile(path string, data []byte, perm os.FileMode) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, perm); err != nil {
		return err
	}
	return os.WriteFile(path, data, perm)
}
