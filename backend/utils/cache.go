package utils

import (
	"github.com/google/uuid"
	"sync"
	"time"
)

type Cache struct {
	m sync.Map
}

type CacheItem struct {
	value      any
	expireTime time.Time // 过期时间戳（Unix 时间戳）
}

func NewCache() *Cache {
	return &Cache{}
}

func (c *Cache) Set(key string, value any, ttl time.Duration) {
	c.m.Store(key, &CacheItem{
		value:      value,
		expireTime: time.Now().Add(ttl),
	})
}

func (c *Cache) Update(key string, value any) {
	if val, ok := c.m.Load(key); ok {
		if cache, ok2 := val.(*CacheItem); ok2 {
			c.m.Store(key, &CacheItem{
				value:      value,
				expireTime: cache.expireTime,
			})
		}
	}
}

func (c *Cache) Get(key string) (any, bool) {
	if val, ok := c.m.Load(key); ok {
		ev := val.(*CacheItem)
		if ev.expireTime.After(time.Now()) {
			return ev.value, true
		}
		c.Delete(key)
	}
	return nil, false
}

func (c *Cache) Delete(key string) {
	c.m.Delete(key)
}

func (c *Cache) Clear() {
	c.m = sync.Map{}
}

func (c *Cache) GenerateUUID() string {
	id := uuid.New()
	return id.String()
}

// RunCleanupTask 是否开启自动清理
func (c *Cache) RunCleanupTask(interval time.Duration) {
	for {
		<-time.After(interval)
		c.m.Range(func(key, value interface{}) bool {
			k, ok1 := key.(string)
			v, ok2 := value.(*CacheItem)
			if ok1 && ok2 {
				if !v.expireTime.After(time.Now()) {
					c.Delete(k)
				}
			}
			return true
		})
	}
}
