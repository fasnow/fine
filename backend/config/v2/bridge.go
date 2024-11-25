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
	SaveWechatDataPath(path)
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
	return r.baseDir
}

func (r *Config) GetDataDir() string {
	return r.dataDir
}

func (r *Config) SaveFofa(fofa Fofa) error {
	return SaveFofa(fofa)
}

func (r *Config) GetHunter() Hunter {
	return r.Hunter
}

func (r *Config) SaveHunter(hunter Hunter) error {
	return SaveHunter(hunter)
}

func (r *Config) GetQuake() Quake {
	return r.Quake
}

func (r *Config) SaveQuake(quake Quake) error {
	return SaveQuake(quake)
}

func (r *Config) Get0zone() Zone {
	return r.Zone
}

func (r *Config) Save0zone(zone Zone) error {
	return Save0zone(zone)
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
	return SaveHttpx(httpx)
}

func (r *Config) GetWechat() Wechat {
	return r.Wechat
}

func (r *Config) SaveWechatMatchRules(rules []string) error {
	return SaveWechatMatchRules(rules)
}

func (r *Config) GetWechatMatchRules() []string {
	return r.Wechat.Rules
}

func (r *Config) SaveWechat(wechat Wechat) error {
	return SaveWechat(wechat)
}

func (r *Config) GetDNS() DNS {
	return r.DNS
}

func (r *Config) SaveDNS(dns DNS) error {
	return SaveDNS(dns)
}

func (r *Config) SaveQueryOnEnter(enter QueryOnEnter) error {
	t := GlobalConfig
	t.QueryOnEnter = enter
	err := save(*t)
	if err != nil {
		logger.Info("can't save queryOnEnter to file")
		return err
	}
	return nil
}
