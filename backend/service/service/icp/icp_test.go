package icp

import (
	"testing"
)

func TestICP_Query(t *testing.T) {
	c := NewClient()
	req := NewQueryReqBuilder().PageNum(1).PageSize(40).ServiceType("1").UnitName("baidu.com").Build()
	result, err := c.Query(req)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(result.Total)
}

func TestICP_SetTokenFromRemote(t *testing.T) {
	c := NewClient()
	if err := c.SetTokenFromRemote(); err != nil {
		t.Error(err)
		return
	}
	req := NewQueryReqBuilder().PageNum(1).PageSize(40).ServiceType("1").UnitName("baidu.com").Build()
	result, err := c.Query(req)
	if err != nil {
		t.Error(err)
		return
	}
	t.Log(result.Total)
}
