package ip138

import (
	"github.com/fasnow/ghttp"
	"net/http"
	"sync"
	"testing"
	"time"
)

func TestQueryByDomain(t *testing.T) {
	client := NewClient()
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	r, _, _ := client.Domain.GetCurrentIP("web.sqlsec.com")
	for _, i2 := range r {
		t.Log(i2.IP, i2.LocationOrDate)
	}

}

func TestDomainHistory(t *testing.T) {
	client := NewClient()
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	r, _ := client.Domain.GetHistoryIP("www.sqlsec.com")
	for _, i2 := range r {
		t.Log(i2.IP, i2.LocationOrDate)
	}

}

func TestQueryByIp(t *testing.T) {
	client := NewClient()
	ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	r, _ := client.IP.GetCurrentDomain("1.71.157.41")

	for _, i2 := range r {
		t.Log(i2.Domain, i2.Date)
	}
}

func TestQueryByIp1(t *testing.T) {
	var wg = &sync.WaitGroup{}
	//ghttp.SetGlobalProxy("http://127.0.0.1:8080")
	client := ghttp.Client{}
	ghttp.SetGlobalTimeout(1 * time.Microsecond)
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			req, _ := http.NewRequest("GET", "https://www.baidu.com", nil)
			rsp, err := client.Do(req)
			if err != nil {
				t.Log(err)
				return
			}
			t.Log(rsp.Status)
		}()
	}
	wg.Wait()
}
