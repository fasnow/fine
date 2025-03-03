package beauty

import (
	"bytes"
	"github.com/ditashi/jsbeautifier-go/jsbeautifier"
)

type JSBeautifier struct{}

func NewJSBeautifier() *JSBeautifier {
	return &JSBeautifier{}
}

func (f *JSBeautifier) Beauty(input []byte) ([]byte, error) {
	code := string(bytes.TrimSpace(input))
	beautifiedCode, err := jsbeautifier.Beautify(&code, jsbeautifier.DefaultOptions())
	if err != nil {
		return input, err
	}
	return []byte(beautifiedCode), nil
}
