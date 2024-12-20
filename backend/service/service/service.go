package service

import (
	"github.com/cenkalti/backoff/v4"
	"time"
)

// GetBackOffWithMaxRetries interval:间隔 multiplier:延迟递增倍数,1表示不递增 max:最大重试次数
func GetBackOffWithMaxRetries(max uint64, interval time.Duration, multiplier float64) backoff.BackOff {
	bf := backoff.NewExponentialBackOff()
	bf.InitialInterval = interval
	bf.Multiplier = multiplier
	return backoff.WithMaxRetries(bf, max)
}
