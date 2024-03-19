package model

import (
	"database/sql/driver"
	"encoding/json"
)

type StringArray []string

func (r *StringArray) Scan(value interface{}) error {
	bytesValue, _ := value.([]byte)
	return json.Unmarshal(bytesValue, &r)
}

func (r StringArray) Value() (driver.Value, error) {
	marshal, err := json.Marshal(&r)
	if err != nil {
		return nil, err
	}
	return marshal, nil
}

type Float64Array []float64

func (r *Float64Array) Scan(value interface{}) error {
	bytesValue, _ := value.([]byte)
	return json.Unmarshal(bytesValue, &r)
}

func (r Float64Array) Value() (driver.Value, error) {
	marshal, err := json.Marshal(&r)
	if err != nil {
		return nil, err
	}
	return marshal, nil
}
