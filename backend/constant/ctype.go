package constant

import (
	"database/sql/driver"
	"encoding/json"
	"os"
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

type FileInfoSlice []os.DirEntry

func (f FileInfoSlice) Len() int {
	return len(f)
}

func (f FileInfoSlice) Less(i, j int) bool {
	info1, err := f[i].Info()
	if err != nil {
		return false
	}
	info2, err := f[j].Info()
	if err != nil {
		return false
	}
	return info1.ModTime().After(info2.ModTime())
}

func (f FileInfoSlice) Swap(i, j int) {
	f[i], f[j] = f[j], f[i]
}
