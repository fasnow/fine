package config

import "fine/backend/logger"

//wails调用

func (r *Config) Get() *Config {
	return r
}

func (r *Config) GetWechatDataPath() string {
	return r.WechatDataPath
}

func (r *Config) SaveWechatDataPath(path string) {
	GlobalConfig.WechatDataPath = path
	Save()
}

func (r *Config) GetProxy() Proxy {
	return r.Proxy
}

func (r *Config) SaveProxy(proxy Proxy) error {
	return SaveProxy(proxy)
}

func (r *Config) GetFofa() Fofa {
	return r.Fofa
}

func (r *Config) GetConfigBaseDir() string {
	return r.BaseDir
}

func (r *Config) GetDataDir() string {
	return r.DataDir
}

func (r *Config) SaveFofa(fofa Fofa) error {
	GlobalConfig.Fofa = fofa
	return Save()
}

func (r *Config) GetHunter() Hunter {
	return r.Hunter
}

func (r *Config) SaveHunter(hunter Hunter) error {
	GlobalConfig.Hunter = hunter
	return Save()
}

func (r *Config) GetQuake() Quake {
	return r.Quake
}

func (r *Config) SaveQuake(quake Quake) error {
	GlobalConfig.Quake = quake
	return Save()
}

func (r *Config) Get0zone() Zone {
	return r.Zone
}

func (r *Config) Save0zone(zone Zone) error {
	GlobalConfig.Zone = zone
	return Save()
}

func (r *Config) GetDBFile() string {
	return r.dbFilePath
}

func (r *Config) GetConfigFilePath() string {
	return r.filePath
}

func (r *Config) GetHttpx() Httpx {
	return r.Httpx
}

func (r *Config) SaveHttpx(httpx Httpx) error {
	GlobalConfig.Httpx = httpx
	return Save()
}

func (r *Config) GetWechat() Wechat {
	return r.Wechat
}

func (r *Config) SaveWechatMatchRules(rules []string) error {
	GlobalConfig.Wechat.Rules = rules
	return Save()
}

func (r *Config) GetWechatMatchRules() []string {
	return r.Wechat.Rules
}

func (r *Config) SaveWechat(wechat Wechat) error {
	GlobalConfig.Wechat = wechat
	return Save()
}

func (r *Config) GetDNS() DNS {
	return r.DNS
}

func (r *Config) SaveDNS(dns DNS) error {
	GlobalConfig.DNS = dns
	return Save()
}

func (r *Config) SaveQueryOnEnter(enter QueryOnEnter) error {
	GlobalConfig.QueryOnEnter = enter
	err := Save()
	if err != nil {
		logger.Info("can't save queryOnEnter to file")
		return err
	}
	return nil
}

func (r *Config) GetTianYanCha() TianYanCha {
	return r.TianYanCha
}

func (r *Config) SaveTianYanCha(cha TianYanCha) error {
	GlobalConfig.TianYanCha = cha
	return Save()
}
