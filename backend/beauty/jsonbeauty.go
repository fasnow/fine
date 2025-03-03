package beauty

import (
	"bytes"
	"encoding/json"
)

type JSONBeautifier struct{}

func NewJSONBeautifier() *JSONBeautifier {
	return &JSONBeautifier{}
}

func (f *JSONBeautifier) Beauty(input []byte) ([]byte, error) {
	var prettyJSON bytes.Buffer
	err := json.Indent(&prettyJSON, input, "", "    ")
	if err != nil {
		return nil, err
	}
	return prettyJSON.Bytes(), nil
}
