package repository

import (
	"fine/backend/database"
	"testing"
)

func TestIcpRepositoryImpl_FindByPartialKeyV2(t *testing.T) {
	c := NewIcpRepository(database.GetConnection())
	items, total, err := c.FindByPartialKeyV2("", 1, 10)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(total)
	for _, item := range items {
		t.Log(item)
	}
}
