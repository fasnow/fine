package utils

//type Map[T any] map[string]T
//
//func (j Map[T]) Value() (driver.Value, error) {
//	return json.Marshal(j)
//}
//
//func (j Map[T]) Scan(value interface{}) error {
//	var bytes []byte
//	switch v := value.(type) {
//	case []byte:
//		bytes = v
//	case string:
//		bytes = []byte(v)
//	default:
//		return errors.New(fmt.Sprint("Failed to unmarshal JSONB value:", value))
//	}
//	return json.Unmarshal(bytes, &j)
//}
