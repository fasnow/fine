export namespace app {
	
	export class Constant {
	    event?: constant.Event;
	    status?: constant.Status;
	    history?: constant.History;
	    config?: config.Config;
	
	    static createFrom(source: any = {}) {
	        return new Constant(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.event = this.convertValues(source["event"], constant.Event);
	        this.status = this.convertValues(source["status"], constant.Status);
	        this.history = this.convertValues(source["history"], constant.History);
	        this.config = this.convertValues(source["config"], config.Config);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace config {
	
	export class QueryOnEnter {
	    assets: boolean;
	    icp: boolean;
	    ip138: boolean;
	
	    static createFrom(source: any = {}) {
	        return new QueryOnEnter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.assets = source["assets"];
	        this.icp = source["icp"];
	        this.ip138 = source["ip138"];
	    }
	}
	export class DNS {
	    value: string[];
	
	    static createFrom(source: any = {}) {
	        return new DNS(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.value = source["value"];
	    }
	}
	export class Httpx {
	    path: string;
	    flags: string;
	
	    static createFrom(source: any = {}) {
	        return new Httpx(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.flags = source["flags"];
	    }
	}
	export class Wechat {
	    applet: string;
	    rules: string[];
	
	    static createFrom(source: any = {}) {
	        return new Wechat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.applet = source["applet"];
	        this.rules = source["rules"];
	    }
	}
	export class TianYanCha {
	    token: string;
	
	    static createFrom(source: any = {}) {
	        return new TianYanCha(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token = source["token"];
	    }
	}
	export class ICP {
	    proxy: string;
	    interval: number;
	
	    static createFrom(source: any = {}) {
	        return new ICP(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.proxy = source["proxy"];
	        this.interval = source["interval"];
	    }
	}
	export class Zone {
	    token: string;
	    interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Zone(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token = source["token"];
	        this.interval = source["interval"];
	    }
	}
	export class Quake {
	    token: string;
	    interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Quake(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token = source["token"];
	        this.interval = source["interval"];
	    }
	}
	export class Hunter {
	    token: string;
	    interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Hunter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token = source["token"];
	        this.interval = source["interval"];
	    }
	}
	export class Fofa {
	    token: string;
	    interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Fofa(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token = source["token"];
	        this.interval = source["interval"];
	    }
	}
	export class Proxy {
	    enable: boolean;
	    type: string;
	    host: string;
	    port: string;
	    user: string;
	    pass: string;
	
	    static createFrom(source: any = {}) {
	        return new Proxy(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enable = source["enable"];
	        this.type = source["type"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.user = source["user"];
	        this.pass = source["pass"];
	    }
	}
	export class Config {
	    timeout: number;
	    Proxy?: Proxy;
	    Fofa: Fofa;
	    Hunter: Hunter;
	    Quake: Quake;
	    Zone: Zone;
	    ICP: ICP;
	    TianYanCha: TianYanCha;
	    Wechat: Wechat;
	    Httpx: Httpx;
	    DNS: DNS;
	    BaseDir: string;
	    DataDir: string;
	    DatabaseFile: string;
	    WechatDataPath: string;
	    QueryOnEnter: QueryOnEnter;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.timeout = source["timeout"];
	        this.Proxy = this.convertValues(source["Proxy"], Proxy);
	        this.Fofa = this.convertValues(source["Fofa"], Fofa);
	        this.Hunter = this.convertValues(source["Hunter"], Hunter);
	        this.Quake = this.convertValues(source["Quake"], Quake);
	        this.Zone = this.convertValues(source["Zone"], Zone);
	        this.ICP = this.convertValues(source["ICP"], ICP);
	        this.TianYanCha = this.convertValues(source["TianYanCha"], TianYanCha);
	        this.Wechat = this.convertValues(source["Wechat"], Wechat);
	        this.Httpx = this.convertValues(source["Httpx"], Httpx);
	        this.DNS = this.convertValues(source["DNS"], DNS);
	        this.BaseDir = source["BaseDir"];
	        this.DataDir = source["DataDir"];
	        this.DatabaseFile = source["DatabaseFile"];
	        this.WechatDataPath = source["WechatDataPath"];
	        this.QueryOnEnter = this.convertValues(source["QueryOnEnter"], QueryOnEnter);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	
	
	
	
	
	

}

export namespace constant {
	
	export class Event {
	    windowSizeChange: string;
	    hasNewFofaDownloadItem: string;
	    hasNewDownloadItem: string;
	    hasNewHunterDownloadItem: string;
	    hunterQueryFinished: string;
	    hasNewIcpDownloadItem: string;
	    hasNewQuakeDownloadItem: string;
	    hasNew0ZoneSiteDownloadItem: string;
	    hasNew0ZoneMemberDownloadItem: string;
	    hasNew0ZoneEmailDownloadItem: string;
	    hasNew0ZoneDomainDownloadItem: string;
	    httpxOutput: string;
	    httpxOutputDone: string;
	    decompileWxMiniProgram: string;
	    decompileWxMiniProgramDone: string;
	    extractWxMiniProgramInfoOutput: string;
	    extractWxMiniProgramInfoDone: string;
	    domain2IPOutput: string;
	    domain2IPDown: string;
	    icpOutput: string;
	    icpDown: string;
	    icpBatchQuery: string;
	
	    static createFrom(source: any = {}) {
	        return new Event(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.windowSizeChange = source["windowSizeChange"];
	        this.hasNewFofaDownloadItem = source["hasNewFofaDownloadItem"];
	        this.hasNewDownloadItem = source["hasNewDownloadItem"];
	        this.hasNewHunterDownloadItem = source["hasNewHunterDownloadItem"];
	        this.hunterQueryFinished = source["hunterQueryFinished"];
	        this.hasNewIcpDownloadItem = source["hasNewIcpDownloadItem"];
	        this.hasNewQuakeDownloadItem = source["hasNewQuakeDownloadItem"];
	        this.hasNew0ZoneSiteDownloadItem = source["hasNew0ZoneSiteDownloadItem"];
	        this.hasNew0ZoneMemberDownloadItem = source["hasNew0ZoneMemberDownloadItem"];
	        this.hasNew0ZoneEmailDownloadItem = source["hasNew0ZoneEmailDownloadItem"];
	        this.hasNew0ZoneDomainDownloadItem = source["hasNew0ZoneDomainDownloadItem"];
	        this.httpxOutput = source["httpxOutput"];
	        this.httpxOutputDone = source["httpxOutputDone"];
	        this.decompileWxMiniProgram = source["decompileWxMiniProgram"];
	        this.decompileWxMiniProgramDone = source["decompileWxMiniProgramDone"];
	        this.extractWxMiniProgramInfoOutput = source["extractWxMiniProgramInfoOutput"];
	        this.extractWxMiniProgramInfoDone = source["extractWxMiniProgramInfoDone"];
	        this.domain2IPOutput = source["domain2IPOutput"];
	        this.domain2IPDown = source["domain2IPDown"];
	        this.icpOutput = source["icpOutput"];
	        this.icpDown = source["icpDown"];
	        this.icpBatchQuery = source["icpBatchQuery"];
	    }
	}
	export class History {
	    fofa: number;
	    hunter: number;
	    quake: number;
	    zone: number;
	    icp: number;
	    tyc: number;
	
	    static createFrom(source: any = {}) {
	        return new History(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fofa = source["fofa"];
	        this.hunter = source["hunter"];
	        this.quake = source["quake"];
	        this.zone = source["zone"];
	        this.icp = source["icp"];
	        this.tyc = source["tyc"];
	    }
	}
	export class Status {
	    exporting: number;
	    completed: number;
	    deleted: number;
	    error: number;
	    ok: number;
	
	    static createFrom(source: any = {}) {
	        return new Status(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.exporting = source["exporting"];
	        this.completed = source["completed"];
	        this.deleted = source["deleted"];
	        this.error = source["error"];
	        this.ok = source["ok"];
	    }
	}

}

export namespace fofa {
	
	export class Regions {
	    code: string;
	    count: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Regions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.count = source["count"];
	        this.name = source["name"];
	    }
	}
	export class Country {
	    code: string;
	    count: number;
	    name: string;
	    name_code: string;
	    regions: Regions[];
	
	    static createFrom(source: any = {}) {
	        return new Country(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.count = source["count"];
	        this.name = source["name"];
	        this.name_code = source["name_code"];
	        this.regions = this.convertValues(source["regions"], Regions);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Detail {
	    count: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Detail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.count = source["count"];
	        this.name = source["name"];
	    }
	}
	export class Aggs {
	    as_number: Detail[];
	    as_organization: Detail[];
	    asset_type: Detail[];
	    countries: Country[];
	    domain: Detail[];
	    fid: Detail[];
	    icp: Detail[];
	    os: Detail[];
	    port: Detail[];
	    protocol: Detail[];
	    server: Detail[];
	    title: Detail[];
	
	    static createFrom(source: any = {}) {
	        return new Aggs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.as_number = this.convertValues(source["as_number"], Detail);
	        this.as_organization = this.convertValues(source["as_organization"], Detail);
	        this.asset_type = this.convertValues(source["asset_type"], Detail);
	        this.countries = this.convertValues(source["countries"], Country);
	        this.domain = this.convertValues(source["domain"], Detail);
	        this.fid = this.convertValues(source["fid"], Detail);
	        this.icp = this.convertValues(source["icp"], Detail);
	        this.os = this.convertValues(source["os"], Detail);
	        this.port = this.convertValues(source["port"], Detail);
	        this.protocol = this.convertValues(source["protocol"], Detail);
	        this.server = this.convertValues(source["server"], Detail);
	        this.title = this.convertValues(source["title"], Detail);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Product {
	    product: string;
	    category: string;
	    level: number;
	    sort_hard_code: number;
	    company: string;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.product = source["product"];
	        this.category = source["category"];
	        this.level = source["level"];
	        this.sort_hard_code = source["sort_hard_code"];
	        this.company = source["company"];
	    }
	}
	export class Port {
	    port: number;
	    update_time: string;
	    protocol: string;
	    products: Product[];
	
	    static createFrom(source: any = {}) {
	        return new Port(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.port = source["port"];
	        this.update_time = source["update_time"];
	        this.protocol = source["protocol"];
	        this.products = this.convertValues(source["products"], Product);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class HostAggsResult {
	    error: boolean;
	    host: string;
	    consumed_fpoint: number;
	    required_fpoints: number;
	    ip: string;
	    asn: number;
	    org: string;
	    country_name: string;
	    country_code: string;
	    ports: Port[];
	    update_time: string;
	
	    static createFrom(source: any = {}) {
	        return new HostAggsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.host = source["host"];
	        this.consumed_fpoint = source["consumed_fpoint"];
	        this.required_fpoints = source["required_fpoints"];
	        this.ip = source["ip"];
	        this.asn = source["asn"];
	        this.org = source["org"];
	        this.country_name = source["country_name"];
	        this.country_code = source["country_code"];
	        this.ports = this.convertValues(source["ports"], Port);
	        this.update_time = source["update_time"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Item {
	    ip: string;
	    port: string;
	    protocol: string;
	    country: string;
	    country_name: string;
	    region: string;
	    city: string;
	    longitude: string;
	    latitude: string;
	    as_number: string;
	    as_organization: string;
	    host: string;
	    domain: string;
	    os: string;
	    server: string;
	    icp: string;
	    title: string;
	    jarm: string;
	    header: string;
	    banner: string;
	    cert: string;
	    base_protocol: string;
	    link: string;
	    product: string;
	    product_category: string;
	    version: string;
	    lastupdatetime: string;
	    cname: string;
	    icon_hash: string;
	    certs_valid: string;
	    cname_domain: string;
	    body: string;
	    icon: string;
	    fid: string;
	    structinfo: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.port = source["port"];
	        this.protocol = source["protocol"];
	        this.country = source["country"];
	        this.country_name = source["country_name"];
	        this.region = source["region"];
	        this.city = source["city"];
	        this.longitude = source["longitude"];
	        this.latitude = source["latitude"];
	        this.as_number = source["as_number"];
	        this.as_organization = source["as_organization"];
	        this.host = source["host"];
	        this.domain = source["domain"];
	        this.os = source["os"];
	        this.server = source["server"];
	        this.icp = source["icp"];
	        this.title = source["title"];
	        this.jarm = source["jarm"];
	        this.header = source["header"];
	        this.banner = source["banner"];
	        this.cert = source["cert"];
	        this.base_protocol = source["base_protocol"];
	        this.link = source["link"];
	        this.product = source["product"];
	        this.product_category = source["product_category"];
	        this.version = source["version"];
	        this.lastupdatetime = source["lastupdatetime"];
	        this.cname = source["cname"];
	        this.icon_hash = source["icon_hash"];
	        this.certs_valid = source["certs_valid"];
	        this.cname_domain = source["cname_domain"];
	        this.body = source["body"];
	        this.icon = source["icon"];
	        this.fid = source["fid"];
	        this.structinfo = source["structinfo"];
	    }
	}
	export class QueryResult {
	    query: string;
	    total: number;
	    pageNum: number;
	    pageSize: number;
	    items: Item[];
	    maxPage: number;
	    taskID: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.query = source["query"];
	        this.total = source["total"];
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.items = this.convertValues(source["items"], Item);
	        this.maxPage = source["maxPage"];
	        this.taskID = source["taskID"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class StatisticalAggsResult {
	    error: boolean;
	    consumed_fpoint: number;
	    required_fpoints: number;
	    size: number;
	    // Go type: struct { Domain int "json:\"domain\""; Fid int "json:\"fid\""; Icp int "json:\"icp\""; IP int "json:\"ip\""; Ipc int "json:\"ipc\""; Server int "json:\"server\""; Title int "json:\"title\"" }
	    distinct: any;
	    aggs: Aggs;
	    lastupdatetime: string;
	
	    static createFrom(source: any = {}) {
	        return new StatisticalAggsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.error = source["error"];
	        this.consumed_fpoint = source["consumed_fpoint"];
	        this.required_fpoints = source["required_fpoints"];
	        this.size = source["size"];
	        this.distinct = this.convertValues(source["distinct"], Object);
	        this.aggs = this.convertValues(source["aggs"], Aggs);
	        this.lastupdatetime = source["lastupdatetime"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class User {
	    email: string;
	    username: string;
	    category: string;
	    fcoin: number;
	    fofa_point: number;
	    remain_free_point: number;
	    remain_api_query: number;
	    remain_api_data: number;
	    isvip: boolean;
	    vip_level: number;
	    is_verified: boolean;
	    avatar: string;
	    message: string;
	    fofacli_ver: string;
	    fofa_server: boolean;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.email = source["email"];
	        this.username = source["username"];
	        this.category = source["category"];
	        this.fcoin = source["fcoin"];
	        this.fofa_point = source["fofa_point"];
	        this.remain_free_point = source["remain_free_point"];
	        this.remain_api_query = source["remain_api_query"];
	        this.remain_api_data = source["remain_api_data"];
	        this.isvip = source["isvip"];
	        this.vip_level = source["vip_level"];
	        this.is_verified = source["is_verified"];
	        this.avatar = source["avatar"];
	        this.message = source["message"];
	        this.fofacli_ver = source["fofacli_ver"];
	        this.fofa_server = source["fofa_server"];
	    }
	}

}

export namespace hunter {
	
	export class Component {
	    name: string;
	    version: string;
	    ItemID: number;
	
	    static createFrom(source: any = {}) {
	        return new Component(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.version = source["version"];
	        this.ItemID = source["ItemID"];
	    }
	}
	export class Item {
	    is_risk: string;
	    url: string;
	    ip: string;
	    port: number;
	    web_title: string;
	    domain: string;
	    is_risk_protocol: string;
	    protocol: string;
	    base_protocol: string;
	    status_code: number;
	    component: Component[];
	    os: string;
	    company: string;
	    number: string;
	    country?: string;
	    province?: string;
	    city: string;
	    updated_at: string;
	    is_web: string;
	    as_org: string;
	    isp: string;
	    banner: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.is_risk = source["is_risk"];
	        this.url = source["url"];
	        this.ip = source["ip"];
	        this.port = source["port"];
	        this.web_title = source["web_title"];
	        this.domain = source["domain"];
	        this.is_risk_protocol = source["is_risk_protocol"];
	        this.protocol = source["protocol"];
	        this.base_protocol = source["base_protocol"];
	        this.status_code = source["status_code"];
	        this.component = this.convertValues(source["component"], Component);
	        this.os = source["os"];
	        this.company = source["company"];
	        this.number = source["number"];
	        this.country = source["country"];
	        this.province = source["province"];
	        this.city = source["city"];
	        this.updated_at = source["updated_at"];
	        this.is_web = source["is_web"];
	        this.as_org = source["as_org"];
	        this.isp = source["isp"];
	        this.banner = source["banner"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryResult {
	    accountType: string;
	    consumeQuota: number;
	    restQuota: number;
	    syntaxPrompt: string;
	    total: number;
	    pageNum: number;
	    pageSize: number;
	    items: Item[];
	    maxPage: number;
	    taskID: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.accountType = source["accountType"];
	        this.consumeQuota = source["consumeQuota"];
	        this.restQuota = source["restQuota"];
	        this.syntaxPrompt = source["syntaxPrompt"];
	        this.total = source["total"];
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.items = this.convertValues(source["items"], Item);
	        this.maxPage = source["maxPage"];
	        this.taskID = source["taskID"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace icp {
	
	export class Item {
	    serviceName: string;
	    leaderName: string;
	    natureName: string;
	    serviceLicence: string;
	    unitName: string;
	    updateRecordTime: string;
	    serviceType: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.serviceName = source["serviceName"];
	        this.leaderName = source["leaderName"];
	        this.natureName = source["natureName"];
	        this.serviceLicence = source["serviceLicence"];
	        this.unitName = source["unitName"];
	        this.updateRecordTime = source["updateRecordTime"];
	        this.serviceType = source["serviceType"];
	    }
	}

}

export namespace ip138 {
	
	export class DomainItem {
	    domain: string;
	    date: string;
	
	    static createFrom(source: any = {}) {
	        return new DomainItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.domain = source["domain"];
	        this.date = source["date"];
	    }
	}
	export class IPItem {
	    ip: string;
	    locationOrDate: string;
	
	    static createFrom(source: any = {}) {
	        return new IPItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.locationOrDate = source["locationOrDate"];
	    }
	}

}

export namespace models {
	
	export class DownloadLog {
	    id: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: gorm
	    deletedAt: any;
	    filename: string;
	    dir: string;
	    deleted: boolean;
	    fileId: number;
	    status: number;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new DownloadLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.deletedAt = this.convertValues(source["deletedAt"], null);
	        this.filename = source["filename"];
	        this.dir = source["dir"];
	        this.deleted = source["deleted"];
	        this.fileId = source["fileId"];
	        this.status = source["status"];
	        this.message = source["message"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ExportStatus {
	    FileID: number;
	    Message: string;
	
	    static createFrom(source: any = {}) {
	        return new ExportStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FileID = source["FileID"];
	        this.Message = source["Message"];
	    }
	}
	export class MatchedString {
	    id: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: gorm
	    deletedAt: any;
	    appid: string;
	    version: string;
	    taskDown: boolean;
	    matched: string;
	
	    static createFrom(source: any = {}) {
	        return new MatchedString(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.deletedAt = this.convertValues(source["deletedAt"], null);
	        this.appid = source["appid"];
	        this.version = source["version"];
	        this.taskDown = source["taskDown"];
	        this.matched = source["matched"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace proxy {
	
	export class Manager {
	
	
	    static createFrom(source: any = {}) {
	        return new Manager(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace quake {
	
	export class Component {
	    SID: number;
	    ItemID: number;
	    product_level: string;
	    product_type: string[];
	    product_vendor: string;
	    product_name_cn: string;
	    product_name_en: string;
	    id: string;
	    version: string;
	    product_catalog: string[];
	
	    static createFrom(source: any = {}) {
	        return new Component(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.SID = source["SID"];
	        this.ItemID = source["ItemID"];
	        this.product_level = source["product_level"];
	        this.product_type = source["product_type"];
	        this.product_vendor = source["product_vendor"];
	        this.product_name_cn = source["product_name_cn"];
	        this.product_name_en = source["product_name_en"];
	        this.id = source["id"];
	        this.version = source["version"];
	        this.product_catalog = source["product_catalog"];
	    }
	}
	export class HTTP {
	    server: string;
	    status_code: any;
	    title: string;
	    host: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new HTTP(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.server = source["server"];
	        this.status_code = source["status_code"];
	        this.title = source["title"];
	        this.host = source["host"];
	        this.path = source["path"];
	    }
	}
	export class Location {
	    LocationID: number;
	    owner: string;
	    province_cn: string;
	    province_en: string;
	    isp: string;
	    country_en: string;
	    district_cn: string;
	    gps: number[];
	    street_cn: string;
	    city_en: string;
	    district_en: string;
	    country_cn: string;
	    street_en: string;
	    city_cn: string;
	    country_code: string;
	    asname: string;
	    scene_cn: string;
	    scene_en: string;
	    radius: number;
	
	    static createFrom(source: any = {}) {
	        return new Location(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.LocationID = source["LocationID"];
	        this.owner = source["owner"];
	        this.province_cn = source["province_cn"];
	        this.province_en = source["province_en"];
	        this.isp = source["isp"];
	        this.country_en = source["country_en"];
	        this.district_cn = source["district_cn"];
	        this.gps = source["gps"];
	        this.street_cn = source["street_cn"];
	        this.city_en = source["city_en"];
	        this.district_en = source["district_en"];
	        this.country_cn = source["country_cn"];
	        this.street_en = source["street_en"];
	        this.city_cn = source["city_cn"];
	        this.country_code = source["country_code"];
	        this.asname = source["asname"];
	        this.scene_cn = source["scene_cn"];
	        this.scene_en = source["scene_en"];
	        this.radius = source["radius"];
	    }
	}
	export class Service {
	    ItemID: number;
	    response: string;
	    response_hash: string;
	    name: string;
	    http: HTTP;
	    cert: string;
	
	    static createFrom(source: any = {}) {
	        return new Service(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ItemID = source["ItemID"];
	        this.response = source["response"];
	        this.response_hash = source["response_hash"];
	        this.name = source["name"];
	        this.http = this.convertValues(source["http"], HTTP);
	        this.cert = source["cert"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RealtimeServiceItem {
	    components: Component[];
	    org: string;
	    ip: string;
	    os_version: string;
	    is_ipv6: boolean;
	    transport: string;
	    hostname: string;
	    port: number;
	    service: Service;
	    domain: string;
	    os_name: string;
	    location: Location;
	    time: string;
	    asn: number;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeServiceItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.components = this.convertValues(source["components"], Component);
	        this.org = source["org"];
	        this.ip = source["ip"];
	        this.os_version = source["os_version"];
	        this.is_ipv6 = source["is_ipv6"];
	        this.transport = source["transport"];
	        this.hostname = source["hostname"];
	        this.port = source["port"];
	        this.service = this.convertValues(source["service"], Service);
	        this.domain = source["domain"];
	        this.os_name = source["os_name"];
	        this.location = this.convertValues(source["location"], Location);
	        this.time = source["time"];
	        this.asn = source["asn"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RSDQueryResult {
	    items: RealtimeServiceItem[];
	    pageNum: number;
	    pageSize: number;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new RSDQueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.items = this.convertValues(source["items"], RealtimeServiceItem);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RealtimeDataQueryOptions {
	    query?: string;
	    rule?: string;
	    ipList?: string[];
	    page?: number;
	    size?: number;
	    ignoreCache?: boolean;
	    startTime?: string;
	    endTime?: string;
	    include?: string[];
	    exclude?: string[];
	    latest?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeDataQueryOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.query = source["query"];
	        this.rule = source["rule"];
	        this.ipList = source["ipList"];
	        this.page = source["page"];
	        this.size = source["size"];
	        this.ignoreCache = source["ignoreCache"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.include = source["include"];
	        this.exclude = source["exclude"];
	        this.latest = source["latest"];
	    }
	}
	
	export class RealtimeServiceQueryResult {
	    result: RSDQueryResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeServiceQueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], RSDQueryResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class UserRole {
	    fullname: string;
	    priority: number;
	    credit: number;
	
	    static createFrom(source: any = {}) {
	        return new UserRole(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fullname = source["fullname"];
	        this.priority = source["priority"];
	        this.credit = source["credit"];
	    }
	}
	export class User {
	    id: string;
	    // Go type: struct { ID string "json:\"id\""; Username string "json:\"username\""; Fullname string "json:\"fullname\""; Email interface {} "json:\"email\""; Group []string "json:\"group\"" }
	    user: any;
	    baned: boolean;
	    ban_status: string;
	    month_remaining_credit: number;
	    constant_credit: number;
	    credit: number;
	    persistent_credit: number;
	    free_query_api_count: number;
	    avatar_id: string;
	    token: string;
	    mobile_phone: string;
	    source: string;
	    time: string;
	    // Go type: struct { DisableTime interface {} "json:\"disable_time\""; StartTime interface {} "json:\"start_time\"" }
	    disable: any;
	    // Go type: struct { QuakeLogStatus bool "json:\"quake_log_status\""; QuakeLogTime interface {} "json:\"quake_log_time\""; AnonymousModel bool "json:\"anonymous_model\""; Status bool "json:\"status\""; Time interface {} "json:\"time\"" }
	    privacy_log: any;
	    // Go type: struct { Name interface {} "json:\"name\""; Email interface {} "json:\"email\""; Status string "json:\"status\"" }
	    enterprise_information: any;
	    // Go type: struct { Code string "json:\"code\""; InviteAcquireCredit int "json:\"invite_acquire_credit\""; InviteNumber int "json:\"invite_number\"" }
	    invitation_code_info: any;
	    is_cashed_invitation_code: boolean;
	    // Go type: struct { NamingFailed interface {} "json:\"注册用户\"" }
	    role_validity: any;
	    personal_information_status: boolean;
	    role: UserRole[];
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user = this.convertValues(source["user"], Object);
	        this.baned = source["baned"];
	        this.ban_status = source["ban_status"];
	        this.month_remaining_credit = source["month_remaining_credit"];
	        this.constant_credit = source["constant_credit"];
	        this.credit = source["credit"];
	        this.persistent_credit = source["persistent_credit"];
	        this.free_query_api_count = source["free_query_api_count"];
	        this.avatar_id = source["avatar_id"];
	        this.token = source["token"];
	        this.mobile_phone = source["mobile_phone"];
	        this.source = source["source"];
	        this.time = source["time"];
	        this.disable = this.convertValues(source["disable"], Object);
	        this.privacy_log = this.convertValues(source["privacy_log"], Object);
	        this.enterprise_information = this.convertValues(source["enterprise_information"], Object);
	        this.invitation_code_info = this.convertValues(source["invitation_code_info"], Object);
	        this.is_cashed_invitation_code = source["is_cashed_invitation_code"];
	        this.role_validity = this.convertValues(source["role_validity"], Object);
	        this.personal_information_status = source["personal_information_status"];
	        this.role = this.convertValues(source["role"], UserRole);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace tianyancha {
	
	export class LabelListV3 {
	    companyId: number;
	    profileTagId: number;
	    profileTagTypeId: number;
	    profileTagNameOnPage: string;
	    profileTagLogo: string;
	    borderTransparency: string;
	    guideTransparency: string;
	    borderWidth: string;
	    borderColor: string;
	    guideColor: string;
	    fontSize: number;
	    fontFamily: string;
	    color: string;
	    background: string;
	
	    static createFrom(source: any = {}) {
	        return new LabelListV3(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.companyId = source["companyId"];
	        this.profileTagId = source["profileTagId"];
	        this.profileTagTypeId = source["profileTagTypeId"];
	        this.profileTagNameOnPage = source["profileTagNameOnPage"];
	        this.profileTagLogo = source["profileTagLogo"];
	        this.borderTransparency = source["borderTransparency"];
	        this.guideTransparency = source["guideTransparency"];
	        this.borderWidth = source["borderWidth"];
	        this.borderColor = source["borderColor"];
	        this.guideColor = source["guideColor"];
	        this.fontSize = source["fontSize"];
	        this.fontFamily = source["fontFamily"];
	        this.color = source["color"];
	        this.background = source["background"];
	    }
	}
	export class PenetrationItem {
	    ratio: number;
	    amountStr: string;
	    id: string;
	    entityType: number;
	    companyId: number;
	    humanNameId: number;
	    name: string;
	    logo: string;
	    isActualController: boolean;
	    isFinalBeneficial: boolean;
	    isBigHolder: boolean;
	    hasHolder: boolean;
	    hasInvestor: boolean;
	    // Go type: struct { TagID int "json:\"tagId\""; Name string "json:\"name\""; Title string "json:\"title\""; FontColor string "json:\"fontColor\""; BackgroundColor string "json:\"backgroundColor\""; TagLogoURL string "json:\"tagLogoUrl\"" }
	    statusTag: any;
	    isValid: boolean;
	    industry: any;
	    // Go type: struct { TagID int "json:\"tagId\""; Name string "json:\"name\""; Title string "json:\"title\""; FontColor string "json:\"fontColor\""; BackgroundColor string "json:\"backgroundColor\""; TagLogoURL string "json:\"tagLogoUrl\"" }
	    entityTag: any;
	    beneficiaryShareholdingRatio: any;
	    alias: string;
	    totalShareholdingRatio: any;
	    isShellCompany: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PenetrationItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ratio = source["ratio"];
	        this.amountStr = source["amountStr"];
	        this.id = source["id"];
	        this.entityType = source["entityType"];
	        this.companyId = source["companyId"];
	        this.humanNameId = source["humanNameId"];
	        this.name = source["name"];
	        this.logo = source["logo"];
	        this.isActualController = source["isActualController"];
	        this.isFinalBeneficial = source["isFinalBeneficial"];
	        this.isBigHolder = source["isBigHolder"];
	        this.hasHolder = source["hasHolder"];
	        this.hasInvestor = source["hasInvestor"];
	        this.statusTag = this.convertValues(source["statusTag"], Object);
	        this.isValid = source["isValid"];
	        this.industry = source["industry"];
	        this.entityTag = this.convertValues(source["entityTag"], Object);
	        this.beneficiaryShareholdingRatio = source["beneficiaryShareholdingRatio"];
	        this.alias = source["alias"];
	        this.totalShareholdingRatio = source["totalShareholdingRatio"];
	        this.isShellCompany = source["isShellCompany"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RegStatusLabel {
	    companyId: number;
	    profileTagId: number;
	    profileTagTypeId: number;
	    profileTagNameOnPage: string;
	    profileTagLogo: string;
	    borderTransparency: string;
	    guideTransparency: string;
	    borderWidth: string;
	    borderColor: string;
	    guideColor: string;
	    fontSize: number;
	    fontFamily: string;
	    color: string;
	    background: string;
	
	    static createFrom(source: any = {}) {
	        return new RegStatusLabel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.companyId = source["companyId"];
	        this.profileTagId = source["profileTagId"];
	        this.profileTagTypeId = source["profileTagTypeId"];
	        this.profileTagNameOnPage = source["profileTagNameOnPage"];
	        this.profileTagLogo = source["profileTagLogo"];
	        this.borderTransparency = source["borderTransparency"];
	        this.guideTransparency = source["guideTransparency"];
	        this.borderWidth = source["borderWidth"];
	        this.borderColor = source["borderColor"];
	        this.guideColor = source["guideColor"];
	        this.fontSize = source["fontSize"];
	        this.fontFamily = source["fontFamily"];
	        this.color = source["color"];
	        this.background = source["background"];
	    }
	}
	export class SearchCompanyV4Item {
	    id: number;
	    name: string;
	    type: number;
	    matchType: any;
	    base: string;
	    legalPersonName: string;
	    estiblishTime: string;
	    regCapital: string;
	    regStatus: string;
	    score: any;
	    orginalScore: any;
	    bonusScore: any;
	    companyScore: any;
	    historyNames: string;
	    categoryCode: string;
	    industry: any;
	    humanNames: any;
	    trademarks: any;
	    tmList: any;
	    productList: any;
	    usedBondName: any;
	    bondName: any;
	    bondNum: any;
	    bondType: any;
	    newtestName: any;
	    regNumber: string;
	    orgNumber: string;
	    creditCode: string;
	    businessScope: string;
	    regLocation: string;
	    phone: any;
	    phoneList: string[];
	    phoneInfoList: any;
	    businessItemList: any;
	    phoneNum: string;
	    logo: string;
	    city: string;
	    district: any;
	    emails: any;
	    emailList: any;
	    websites: string;
	    hiddenPhones: any;
	    abbr: any;
	    tagList: any;
	    companyType: number;
	    companyOrgType: any;
	    labelList: any;
	    matchField: any;
	    latitude: any;
	    longitude: any;
	    legalPersonId: string;
	    legalPersonType: string;
	    distance: any;
	    categoryStr: any;
	    isClaimed: number;
	    claimPkgType: any;
	    realClaimPkgType: any;
	    baiduUrl: any;
	    isBranch: number;
	    alias: string;
	    claimInfo: any;
	    hidden: number;
	    legalPersonShowStr: string;
	    regCapitalShowStr: string;
	    estiblishTimeShowStr: string;
	    multiMatchField: any[];
	    labelListV2: any;
	    labelJsonList: any;
	    taxCode: string;
	    socialSecurityStaff_num: any;
	    categoryCodeStd: any;
	    hasMorePhone: any;
	    hasVideo: any;
	    videoId: any;
	    isRecommend: any;
	    englishName: any;
	    firstPositionShowStr: string;
	    secondPositionShowStr: string;
	    firstPositionValue: string;
	    secondPositionValue: string;
	    bizType: string;
	    docFeature: string;
	    companyNum: any;
	    department: string;
	    illegalType: string;
	    targetGid: string;
	    targetName: string;
	    changeTime: string;
	    isIn: string;
	    mainId: string;
	    targetRegCapitalAmount: string;
	    targetRegCapitalCurrency: string;
	    legalPerson: string;
	    gidForB: string;
	    geoLocation: any;
	    websiteFilingCount: number;
	    repCurrency: any;
	    province: any;
	    areaCodes: any;
	    address: any;
	    establishmentTime: string;
	    icps: any;
	    icp: string;
	    changeRatio: string;
	    afterRatio: string;
	    changeAmt: string;
	    registerInstitute: string;
	    companyScale: any;
	    abstractsBaseInfo: string;
	    financingRound: string;
	    staffNumReportYear: any;
	    categoryCode2017List: any;
	    institutionTypeList: any;
	    companyBrandInfo: any;
	    companyGroupInfo: any;
	    contantMap: any;
	    companyPhoneBook: any;
	    companyQuestions: any;
	    selfRiskCount: any;
	    legalPersonLogo: any;
	    legalPersonAlias: any;
	    relatedRiskCount: any;
	    historyRiskCount: any;
	    followLabel: any;
	    contentType: number;
	    normalWord: any;
	    suggestWordList: any;
	    companyHumanInfo: any;
	    phoneType: any;
	    phoneTips: any;
	    publicSentimentNewsInfo: any;
	    enterpriseServiceGoodsInfo: any;
	    qfLabels: any;
	    productShowMore: any;
	    goodsAndProducts: any;
	    shortVideoList: any;
	    focusCompanyList: any;
	    isBrandArea: number;
	    areaType: number;
	    customizedImagePath: string;
	    isBrandAreaControlGroup: number;
	    adsFlag: any;
	    isCooperationShow: any;
	    cooperationUrl: string;
	    albumHeadImgPath: any;
	    albumCount: any;
	    websiteUrl: any;
	    websiteRiskType: number;
	    hotMsg: any;
	    hotType: any;
	    competitorName: any;
	    brandInstitutionGroupCard: any;
	    publishDemandCard: any;
	    appDynamicCompanyCard: any;
	    emptyRecommendTextCard: any;
	    emptyRecommendCompanyCard: any;
	    recommendScene: any;
	    companyBrand: any;
	    companyGroup: any;
	    institutionCard: any;
	    verticalCard: any;
	    phoneTagType: number;
	    aladdinCompanyCard: any;
	    illegalSocialOrganization: any;
	    labelListV3: LabelListV3[];
	    regStatusLabel: RegStatusLabel[];
	    newlyCompanyCard: any;
	    deepSearchCard: any;
	    legalPersonForList: string;
	    regCapitalForList: string;
	    provinceName: string;
	    cityName: string;
	    districtName: string;
	    categoryNameLv1: any;
	    categoryNameLv2: any;
	    categoryNameLv3: any;
	    categoryNameLv4: any;
	    orgType: string;
	    approveDate: string;
	    businessTerm: string;
	    socialSecurityStaffNum: string;
	    companyScaleInfo: any;
	    // Go type: struct { Status int "json:\"status\""; TagID interface {} "json:\"tagId\""; TagName interface {} "json:\"tagName\"" }
	    followInfo: any;
	    englishNameForTab: string;
	
	    static createFrom(source: any = {}) {
	        return new SearchCompanyV4Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.matchType = source["matchType"];
	        this.base = source["base"];
	        this.legalPersonName = source["legalPersonName"];
	        this.estiblishTime = source["estiblishTime"];
	        this.regCapital = source["regCapital"];
	        this.regStatus = source["regStatus"];
	        this.score = source["score"];
	        this.orginalScore = source["orginalScore"];
	        this.bonusScore = source["bonusScore"];
	        this.companyScore = source["companyScore"];
	        this.historyNames = source["historyNames"];
	        this.categoryCode = source["categoryCode"];
	        this.industry = source["industry"];
	        this.humanNames = source["humanNames"];
	        this.trademarks = source["trademarks"];
	        this.tmList = source["tmList"];
	        this.productList = source["productList"];
	        this.usedBondName = source["usedBondName"];
	        this.bondName = source["bondName"];
	        this.bondNum = source["bondNum"];
	        this.bondType = source["bondType"];
	        this.newtestName = source["newtestName"];
	        this.regNumber = source["regNumber"];
	        this.orgNumber = source["orgNumber"];
	        this.creditCode = source["creditCode"];
	        this.businessScope = source["businessScope"];
	        this.regLocation = source["regLocation"];
	        this.phone = source["phone"];
	        this.phoneList = source["phoneList"];
	        this.phoneInfoList = source["phoneInfoList"];
	        this.businessItemList = source["businessItemList"];
	        this.phoneNum = source["phoneNum"];
	        this.logo = source["logo"];
	        this.city = source["city"];
	        this.district = source["district"];
	        this.emails = source["emails"];
	        this.emailList = source["emailList"];
	        this.websites = source["websites"];
	        this.hiddenPhones = source["hiddenPhones"];
	        this.abbr = source["abbr"];
	        this.tagList = source["tagList"];
	        this.companyType = source["companyType"];
	        this.companyOrgType = source["companyOrgType"];
	        this.labelList = source["labelList"];
	        this.matchField = source["matchField"];
	        this.latitude = source["latitude"];
	        this.longitude = source["longitude"];
	        this.legalPersonId = source["legalPersonId"];
	        this.legalPersonType = source["legalPersonType"];
	        this.distance = source["distance"];
	        this.categoryStr = source["categoryStr"];
	        this.isClaimed = source["isClaimed"];
	        this.claimPkgType = source["claimPkgType"];
	        this.realClaimPkgType = source["realClaimPkgType"];
	        this.baiduUrl = source["baiduUrl"];
	        this.isBranch = source["isBranch"];
	        this.alias = source["alias"];
	        this.claimInfo = source["claimInfo"];
	        this.hidden = source["hidden"];
	        this.legalPersonShowStr = source["legalPersonShowStr"];
	        this.regCapitalShowStr = source["regCapitalShowStr"];
	        this.estiblishTimeShowStr = source["estiblishTimeShowStr"];
	        this.multiMatchField = source["multiMatchField"];
	        this.labelListV2 = source["labelListV2"];
	        this.labelJsonList = source["labelJsonList"];
	        this.taxCode = source["taxCode"];
	        this.socialSecurityStaff_num = source["socialSecurityStaff_num"];
	        this.categoryCodeStd = source["categoryCodeStd"];
	        this.hasMorePhone = source["hasMorePhone"];
	        this.hasVideo = source["hasVideo"];
	        this.videoId = source["videoId"];
	        this.isRecommend = source["isRecommend"];
	        this.englishName = source["englishName"];
	        this.firstPositionShowStr = source["firstPositionShowStr"];
	        this.secondPositionShowStr = source["secondPositionShowStr"];
	        this.firstPositionValue = source["firstPositionValue"];
	        this.secondPositionValue = source["secondPositionValue"];
	        this.bizType = source["bizType"];
	        this.docFeature = source["docFeature"];
	        this.companyNum = source["companyNum"];
	        this.department = source["department"];
	        this.illegalType = source["illegalType"];
	        this.targetGid = source["targetGid"];
	        this.targetName = source["targetName"];
	        this.changeTime = source["changeTime"];
	        this.isIn = source["isIn"];
	        this.mainId = source["mainId"];
	        this.targetRegCapitalAmount = source["targetRegCapitalAmount"];
	        this.targetRegCapitalCurrency = source["targetRegCapitalCurrency"];
	        this.legalPerson = source["legalPerson"];
	        this.gidForB = source["gidForB"];
	        this.geoLocation = source["geoLocation"];
	        this.websiteFilingCount = source["websiteFilingCount"];
	        this.repCurrency = source["repCurrency"];
	        this.province = source["province"];
	        this.areaCodes = source["areaCodes"];
	        this.address = source["address"];
	        this.establishmentTime = source["establishmentTime"];
	        this.icps = source["icps"];
	        this.icp = source["icp"];
	        this.changeRatio = source["changeRatio"];
	        this.afterRatio = source["afterRatio"];
	        this.changeAmt = source["changeAmt"];
	        this.registerInstitute = source["registerInstitute"];
	        this.companyScale = source["companyScale"];
	        this.abstractsBaseInfo = source["abstractsBaseInfo"];
	        this.financingRound = source["financingRound"];
	        this.staffNumReportYear = source["staffNumReportYear"];
	        this.categoryCode2017List = source["categoryCode2017List"];
	        this.institutionTypeList = source["institutionTypeList"];
	        this.companyBrandInfo = source["companyBrandInfo"];
	        this.companyGroupInfo = source["companyGroupInfo"];
	        this.contantMap = source["contantMap"];
	        this.companyPhoneBook = source["companyPhoneBook"];
	        this.companyQuestions = source["companyQuestions"];
	        this.selfRiskCount = source["selfRiskCount"];
	        this.legalPersonLogo = source["legalPersonLogo"];
	        this.legalPersonAlias = source["legalPersonAlias"];
	        this.relatedRiskCount = source["relatedRiskCount"];
	        this.historyRiskCount = source["historyRiskCount"];
	        this.followLabel = source["followLabel"];
	        this.contentType = source["contentType"];
	        this.normalWord = source["normalWord"];
	        this.suggestWordList = source["suggestWordList"];
	        this.companyHumanInfo = source["companyHumanInfo"];
	        this.phoneType = source["phoneType"];
	        this.phoneTips = source["phoneTips"];
	        this.publicSentimentNewsInfo = source["publicSentimentNewsInfo"];
	        this.enterpriseServiceGoodsInfo = source["enterpriseServiceGoodsInfo"];
	        this.qfLabels = source["qfLabels"];
	        this.productShowMore = source["productShowMore"];
	        this.goodsAndProducts = source["goodsAndProducts"];
	        this.shortVideoList = source["shortVideoList"];
	        this.focusCompanyList = source["focusCompanyList"];
	        this.isBrandArea = source["isBrandArea"];
	        this.areaType = source["areaType"];
	        this.customizedImagePath = source["customizedImagePath"];
	        this.isBrandAreaControlGroup = source["isBrandAreaControlGroup"];
	        this.adsFlag = source["adsFlag"];
	        this.isCooperationShow = source["isCooperationShow"];
	        this.cooperationUrl = source["cooperationUrl"];
	        this.albumHeadImgPath = source["albumHeadImgPath"];
	        this.albumCount = source["albumCount"];
	        this.websiteUrl = source["websiteUrl"];
	        this.websiteRiskType = source["websiteRiskType"];
	        this.hotMsg = source["hotMsg"];
	        this.hotType = source["hotType"];
	        this.competitorName = source["competitorName"];
	        this.brandInstitutionGroupCard = source["brandInstitutionGroupCard"];
	        this.publishDemandCard = source["publishDemandCard"];
	        this.appDynamicCompanyCard = source["appDynamicCompanyCard"];
	        this.emptyRecommendTextCard = source["emptyRecommendTextCard"];
	        this.emptyRecommendCompanyCard = source["emptyRecommendCompanyCard"];
	        this.recommendScene = source["recommendScene"];
	        this.companyBrand = source["companyBrand"];
	        this.companyGroup = source["companyGroup"];
	        this.institutionCard = source["institutionCard"];
	        this.verticalCard = source["verticalCard"];
	        this.phoneTagType = source["phoneTagType"];
	        this.aladdinCompanyCard = source["aladdinCompanyCard"];
	        this.illegalSocialOrganization = source["illegalSocialOrganization"];
	        this.labelListV3 = this.convertValues(source["labelListV3"], LabelListV3);
	        this.regStatusLabel = this.convertValues(source["regStatusLabel"], RegStatusLabel);
	        this.newlyCompanyCard = source["newlyCompanyCard"];
	        this.deepSearchCard = source["deepSearchCard"];
	        this.legalPersonForList = source["legalPersonForList"];
	        this.regCapitalForList = source["regCapitalForList"];
	        this.provinceName = source["provinceName"];
	        this.cityName = source["cityName"];
	        this.districtName = source["districtName"];
	        this.categoryNameLv1 = source["categoryNameLv1"];
	        this.categoryNameLv2 = source["categoryNameLv2"];
	        this.categoryNameLv3 = source["categoryNameLv3"];
	        this.categoryNameLv4 = source["categoryNameLv4"];
	        this.orgType = source["orgType"];
	        this.approveDate = source["approveDate"];
	        this.businessTerm = source["businessTerm"];
	        this.socialSecurityStaffNum = source["socialSecurityStaffNum"];
	        this.companyScaleInfo = source["companyScaleInfo"];
	        this.followInfo = this.convertValues(source["followInfo"], Object);
	        this.englishNameForTab = source["englishNameForTab"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SuggestItem {
	    id: number;
	    graphId: string;
	    type: number;
	    matchType: string;
	    comName: string;
	    name: string;
	    alias: string;
	    logo: string;
	    regStatus: number;
	    taxCode: string;
	    promptContent: any;
	    label: any;
	    sourceName: any;
	    sourceUrl: any;
	
	    static createFrom(source: any = {}) {
	        return new SuggestItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.graphId = source["graphId"];
	        this.type = source["type"];
	        this.matchType = source["matchType"];
	        this.comName = source["comName"];
	        this.name = source["name"];
	        this.alias = source["alias"];
	        this.logo = source["logo"];
	        this.regStatus = source["regStatus"];
	        this.taxCode = source["taxCode"];
	        this.promptContent = source["promptContent"];
	        this.label = source["label"];
	        this.sourceName = source["sourceName"];
	        this.sourceUrl = source["sourceUrl"];
	    }
	}

}

export namespace wechat {
	
	export class Info {
	    nickname: string;
	    username: string;
	    description: string;
	    avatar: string;
	    uses_count: string;
	    principal_name: string;
	    appid: string;
	
	    static createFrom(source: any = {}) {
	        return new Info(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nickname = source["nickname"];
	        this.username = source["username"];
	        this.description = source["description"];
	        this.avatar = source["avatar"];
	        this.uses_count = source["uses_count"];
	        this.principal_name = source["principal_name"];
	        this.appid = source["appid"];
	    }
	}
	export class Version {
	    ID: number;
	    // Go type: time
	    CreatedAt: any;
	    // Go type: time
	    UpdatedAt: any;
	    // Go type: gorm
	    DeletedAt: any;
	    VersionID: number;
	    number: string;
	    unpacked: boolean;
	    update_date: string;
	
	    static createFrom(source: any = {}) {
	        return new Version(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], null);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], null);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.VersionID = source["VersionID"];
	        this.number = source["number"];
	        this.unpacked = source["unpacked"];
	        this.update_date = source["update_date"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InfoToFront {
	    appid: string;
	    update_date: string;
	    versions: Version[];
	    nickname: string;
	    username: string;
	    description: string;
	    avatar: string;
	    uses_count: string;
	    principal_name: string;
	
	    static createFrom(source: any = {}) {
	        return new InfoToFront(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.appid = source["appid"];
	        this.update_date = source["update_date"];
	        this.versions = this.convertValues(source["versions"], Version);
	        this.nickname = source["nickname"];
	        this.username = source["username"];
	        this.description = source["description"];
	        this.avatar = source["avatar"];
	        this.uses_count = source["uses_count"];
	        this.principal_name = source["principal_name"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MiniProgram {
	    appid: string;
	    update_date: string;
	    versions: Version[];
	
	    static createFrom(source: any = {}) {
	        return new MiniProgram(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.appid = source["appid"];
	        this.update_date = source["update_date"];
	        this.versions = this.convertValues(source["versions"], Version);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace zone {
	
	export class Regions {
	    country: string;
	    province: string;
	    city: string;
	
	    static createFrom(source: any = {}) {
	        return new Regions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.country = source["country"];
	        this.province = source["province"];
	        this.city = source["city"];
	    }
	}
	export class AimSource {
	    chat_id: string;
	    chat_name: string;
	    message_id: string;
	    content_text: string;
	    message_time: string;
	    message_date: string;
	    sender_first_name: string;
	    sender_id: string;
	    sender_last_name: string;
	    sender_phone: string;
	    sender_username: string;
	    tags: string[];
	    regions: Regions[];
	    event: string[];
	    org: string[];
	    industry: string[];
	    page_type: string[];
	    media_file_url: string;
	    media_type: string;
	    file_extension: string;
	    hot: number;
	    content_text_md5: string;
	
	    static createFrom(source: any = {}) {
	        return new AimSource(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chat_id = source["chat_id"];
	        this.chat_name = source["chat_name"];
	        this.message_id = source["message_id"];
	        this.content_text = source["content_text"];
	        this.message_time = source["message_time"];
	        this.message_date = source["message_date"];
	        this.sender_first_name = source["sender_first_name"];
	        this.sender_id = source["sender_id"];
	        this.sender_last_name = source["sender_last_name"];
	        this.sender_phone = source["sender_phone"];
	        this.sender_username = source["sender_username"];
	        this.tags = source["tags"];
	        this.regions = this.convertValues(source["regions"], Regions);
	        this.event = source["event"];
	        this.org = source["org"];
	        this.industry = source["industry"];
	        this.page_type = source["page_type"];
	        this.media_file_url = source["media_file_url"];
	        this.media_type = source["media_type"];
	        this.file_extension = source["file_extension"];
	        this.hot = source["hot"];
	        this.content_text_md5 = source["content_text_md5"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AimItem {
	    _index: string;
	    _type: string;
	    _id: string;
	    _score: any;
	    _ignored?: string[];
	    _source: AimSource;
	    sort: number[];
	
	    static createFrom(source: any = {}) {
	        return new AimItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this._index = source["_index"];
	        this._type = source["_type"];
	        this._id = source["_id"];
	        this._score = source["_score"];
	        this._ignored = source["_ignored"];
	        this._source = this.convertValues(source["_source"], AimSource);
	        this.sort = source["sort"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AimResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: AimItem[];
	
	    static createFrom(source: any = {}) {
	        return new AimResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], AimItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ApkItem {
	    title: string;
	    company: string;
	    type: string;
	    source: string;
	    timestamp: string;
	    msg: any;
	
	    static createFrom(source: any = {}) {
	        return new ApkItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.company = source["company"];
	        this.type = source["type"];
	        this.source = source["source"];
	        this.timestamp = source["timestamp"];
	        this.msg = source["msg"];
	    }
	}
	export class ApkResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: ApkItem[];
	
	    static createFrom(source: any = {}) {
	        return new ApkResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], ApkItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DetailParsing {
	    phone_list: string[];
	    telegram_list: string[];
	    email_list: string[];
	    domain_list: string[];
	    ip_list: string[];
	    wangpan_list: string[];
	    keyword: string[];
	
	    static createFrom(source: any = {}) {
	        return new DetailParsing(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.phone_list = source["phone_list"];
	        this.telegram_list = source["telegram_list"];
	        this.email_list = source["email_list"];
	        this.domain_list = source["domain_list"];
	        this.ip_list = source["ip_list"];
	        this.wangpan_list = source["wangpan_list"];
	        this.keyword = source["keyword"];
	    }
	}
	export class Repository {
	    id: number;
	    name: string;
	    description: string;
	    node_id: string;
	    fork: boolean;
	    private: boolean;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new Repository(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.node_id = source["node_id"];
	        this.fork = source["fork"];
	        this.private = source["private"];
	        this.url = source["url"];
	    }
	}
	export class CodeOwner {
	    id: string;
	    login: string;
	    url: string;
	    avatar_url: string;
	
	    static createFrom(source: any = {}) {
	        return new CodeOwner(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.login = source["login"];
	        this.url = source["url"];
	        this.avatar_url = source["avatar_url"];
	    }
	}
	export class CodeItem {
	    _id: string;
	    name: string;
	    path: string;
	    url: string;
	    sha: string;
	    keyword: any;
	    tags: string[];
	    file_extension: string;
	    source: string;
	    code_detail: string;
	    score: any;
	    type: string;
	    created_time?: string;
	    timestamp: string;
	    owner: CodeOwner;
	    repository?: Repository;
	    detail_parsing?: DetailParsing;
	    timestamp_update?: string;
	    related_company?: string[];
	
	    static createFrom(source: any = {}) {
	        return new CodeItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this._id = source["_id"];
	        this.name = source["name"];
	        this.path = source["path"];
	        this.url = source["url"];
	        this.sha = source["sha"];
	        this.keyword = source["keyword"];
	        this.tags = source["tags"];
	        this.file_extension = source["file_extension"];
	        this.source = source["source"];
	        this.code_detail = source["code_detail"];
	        this.score = source["score"];
	        this.type = source["type"];
	        this.created_time = source["created_time"];
	        this.timestamp = source["timestamp"];
	        this.owner = this.convertValues(source["owner"], CodeOwner);
	        this.repository = this.convertValues(source["repository"], Repository);
	        this.detail_parsing = this.convertValues(source["detail_parsing"], DetailParsing);
	        this.timestamp_update = source["timestamp_update"];
	        this.related_company = source["related_company"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class CodeResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: CodeItem[];
	
	    static createFrom(source: any = {}) {
	        return new CodeResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], CodeItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DarknetMsg {
	    num_sales: number;
	    quantity: string;
	    daily_time: string;
	    author: string;
	    price: string;
	    daily: string;
	    title_cn: string;
	    description: string;
	    keyword: string[];
	    release_time: string;
	    example: string;
	
	    static createFrom(source: any = {}) {
	        return new DarknetMsg(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.num_sales = source["num_sales"];
	        this.quantity = source["quantity"];
	        this.daily_time = source["daily_time"];
	        this.author = source["author"];
	        this.price = source["price"];
	        this.daily = source["daily"];
	        this.title_cn = source["title_cn"];
	        this.description = source["description"];
	        this.keyword = source["keyword"];
	        this.release_time = source["release_time"];
	        this.example = source["example"];
	    }
	}
	export class DarknetItem {
	    _id: string;
	    body_md5: string;
	    msg: DarknetMsg;
	    status_code: number;
	    regions: Regions[];
	    org: string[];
	    page_type: string[];
	    root_domain: string;
	    detail_parsing: DetailParsing;
	    to_new: string;
	    description: string;
	    industry: string[];
	    language: string[];
	    source: string;
	    title: string;
	    hot: string;
	    url: string;
	    tags: string[];
	    path: string;
	    update_time: string;
	    toplv_domain: string;
	    user_id: any;
	    event: string[];
	    timestamp: any;
	
	    static createFrom(source: any = {}) {
	        return new DarknetItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this._id = source["_id"];
	        this.body_md5 = source["body_md5"];
	        this.msg = this.convertValues(source["msg"], DarknetMsg);
	        this.status_code = source["status_code"];
	        this.regions = this.convertValues(source["regions"], Regions);
	        this.org = source["org"];
	        this.page_type = source["page_type"];
	        this.root_domain = source["root_domain"];
	        this.detail_parsing = this.convertValues(source["detail_parsing"], DetailParsing);
	        this.to_new = source["to_new"];
	        this.description = source["description"];
	        this.industry = source["industry"];
	        this.language = source["language"];
	        this.source = source["source"];
	        this.title = source["title"];
	        this.hot = source["hot"];
	        this.url = source["url"];
	        this.tags = source["tags"];
	        this.path = source["path"];
	        this.update_time = source["update_time"];
	        this.toplv_domain = source["toplv_domain"];
	        this.user_id = source["user_id"];
	        this.event = source["event"];
	        this.timestamp = source["timestamp"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class DarknetResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: DarknetItem[];
	
	    static createFrom(source: any = {}) {
	        return new DarknetResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], DarknetItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class DomainItem {
	    ip: string;
	    icp: string;
	    company: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new DomainItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.icp = source["icp"];
	        this.company = source["company"];
	        this.url = source["url"];
	    }
	}
	export class DomainResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: DomainItem[];
	
	    static createFrom(source: any = {}) {
	        return new DomainResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], DomainItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class EmailItem {
	    email: string;
	    email_type: string;
	    group: string;
	    source: string[];
	    timestamp: string;
	
	    static createFrom(source: any = {}) {
	        return new EmailItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.email = source["email"];
	        this.email_type = source["email_type"];
	        this.group = source["group"];
	        this.source = source["source"];
	        this.timestamp = source["timestamp"];
	    }
	}
	export class EmailResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: EmailItem[];
	
	    static createFrom(source: any = {}) {
	        return new EmailResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], EmailItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MemberItem {
	    name: string;
	    position: string[];
	    introduction: string;
	    source: string;
	    timestamp: string;
	    company: string;
	
	    static createFrom(source: any = {}) {
	        return new MemberItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.position = source["position"];
	        this.introduction = source["introduction"];
	        this.source = source["source"];
	        this.timestamp = source["timestamp"];
	        this.company = source["company"];
	    }
	}
	export class MemberResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: MemberItem[];
	
	    static createFrom(source: any = {}) {
	        return new MemberResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], MemberItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryAimResult {
	    result: AimResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryAimResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], AimResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryApkResult {
	    result: ApkResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryApkResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], ApkResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryCodeResult {
	    result: CodeResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryCodeResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], CodeResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryDomainResult {
	    result: DomainResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryDomainResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], DomainResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryDwmResult {
	    result: DarknetResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryDwmResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], DarknetResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryEmailResult {
	    result: EmailResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryEmailResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], EmailResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueryMemberResult {
	    result: MemberResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryMemberResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], MemberResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SiteItem {
	    ip: string;
	    port: string;
	    url: string;
	    title: string;
	    cms: string;
	    continent?: string;
	    country?: string;
	    province?: string;
	    city: string;
	    operator: string;
	    banner: string;
	    html_banner: string;
	    group: string;
	    beian: string;
	    is_cdn: number;
	    ssl_certificate: string;
	    service: string;
	
	    static createFrom(source: any = {}) {
	        return new SiteItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.port = source["port"];
	        this.url = source["url"];
	        this.title = source["title"];
	        this.cms = source["cms"];
	        this.continent = source["continent"];
	        this.country = source["country"];
	        this.province = source["province"];
	        this.city = source["city"];
	        this.operator = source["operator"];
	        this.banner = source["banner"];
	        this.html_banner = source["html_banner"];
	        this.group = source["group"];
	        this.beian = source["beian"];
	        this.is_cdn = source["is_cdn"];
	        this.ssl_certificate = source["ssl_certificate"];
	        this.service = source["service"];
	    }
	}
	export class SiteResult {
	    pageNum: number;
	    pageSize: number;
	    total: number;
	    items: SiteItem[];
	
	    static createFrom(source: any = {}) {
	        return new SiteResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pageNum = source["pageNum"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], SiteItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QuerySiteResult {
	    result: SiteResult;
	    taskID: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QuerySiteResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], SiteResult);
	        this.taskID = source["taskID"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	

}

