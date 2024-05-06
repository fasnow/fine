package domain2ip

import (
	"fine/backend/app"
	"testing"
)

func TestNewIP2DomainBridge(t *testing.T) {
	b := NewDomain2IPBridge(app.NewApp())
	items := []string{"zc.hbgs.cloud", "zhyh0.hbgs.cloud", "spy.hbgs.cloud", "xd.hbgs.com.cn", "qy.hbgs.com.cn", "jhb.hbgs.com.cn", "hg.hbgs.com.cn", "yzyxjt.hbgs.com.cn", "zhyh1.hbgs.cloud", "cd.hbgs.com.cn", "xhh.hbgs.com.cn", "jq.hbgs.com.cn", "jsc.hbgs.cloud", "zhyh5.hbgs.cloud", "zhgh.hbgs.cloud", "xf.hbgs.com.cn", "jh.hbgs.com.cn", "sh.hbgs.com.cn", "aqsk.hbgs.cloud", "sfjh.hbgs.cloud", "hebcd.hbgs.cloud", "zhdd.hbgs.cloud", "zichan.hbgs.cloud", "zcz.hbgs.com.cn", "yc.hbgs.com.cn", "sa.hbgs.com.cn", "cq.hbgs.com.cn", "xhx.hbgs.com.cn", "gc.hbgs.cloud", "zhyh4.hbgs.cloud", "rw.hbgs.com.cn", "jx.hbgs.com.cn", "jxt.hbgs.com.cn", "dg.hbgs.com.cn", "zhyh3.hbgs.cloud", "lf.hbgs.com.cn", "www.hbgs.com.cn", "gcjs.hbgs.com.cn", "zz.hbgs.com.cn", "oa.hbgs.cloud"}
	//dnss := config.GetSingleton().DNS.Value
	//for _, item := range items {
	//	for _, d := range dnss {
	//		record, err := b.ip2domain.GetARecord(item, d+":53")
	//		if err != nil {
	//			t.Error(err)
	//			continue
	//		}
	//		t.Log(item, record)
	//	}
	//}
	b.GetDetail(items)
}
