export namespace config {
	
	export class Zone {
	    key: string;
	
	    static createFrom(source: any = {}) {
	        return new Zone(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	    }
	}
	export class Quake {
	    key: string;
	
	    static createFrom(source: any = {}) {
	        return new Quake(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	    }
	}
	export class Hunter {
	    key: string;
	
	    static createFrom(source: any = {}) {
	        return new Hunter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	    }
	}
	export class Fofa {
	    key: string;
	    email: string;
	
	    static createFrom(source: any = {}) {
	        return new Fofa(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.email = source["email"];
	    }
	}
	export class Auth {
	    fofa: Fofa;
	    hunter: Hunter;
	    quake: Quake;
	    "0.zone": Zone;
	
	    static createFrom(source: any = {}) {
	        return new Auth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fofa = this.convertValues(source["fofa"], Fofa);
	        this.hunter = this.convertValues(source["hunter"], Hunter);
	        this.quake = this.convertValues(source["quake"], Quake);
	        this["0.zone"] = this.convertValues(source["0.zone"], Zone);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	export class Wechat {
	    appletPath: string;
	    dataCachePath: string;
	
	    static createFrom(source: any = {}) {
	        return new Wechat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.appletPath = source["appletPath"];
	        this.dataCachePath = source["dataCachePath"];
	    }
	}
	export class Httpx {
	    path: string;
	    flags: string;
	    inputFlag: string;
	    fromFile: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Httpx(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.flags = source["flags"];
	        this.inputFlag = source["inputFlag"];
	        this.fromFile = source["fromFile"];
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
	    auth: Auth;
	    proxy: Proxy;
	    fofa: number;
	    hunter: number;
	    quake: number;
	    "0.zone": number;
	    timeout: number;
	    httpx: Httpx;
	    wechat: Wechat;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.auth = this.convertValues(source["auth"], Auth);
	        this.proxy = this.convertValues(source["proxy"], Proxy);
	        this.fofa = source["fofa"];
	        this.hunter = source["hunter"];
	        this.quake = source["quake"];
	        this["0.zone"] = source["0.zone"];
	        this.timeout = source["timeout"];
	        this.httpx = this.convertValues(source["httpx"], Httpx);
	        this.wechat = this.convertValues(source["wechat"], Wechat);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	
	
	
	export class Interval {
	    fofa: number;
	    hunter: number;
	    quake: number;
	    "0.zone": number;
	
	    static createFrom(source: any = {}) {
	        return new Interval(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fofa = source["fofa"];
	        this.hunter = source["hunter"];
	        this.quake = source["quake"];
	        this["0.zone"] = source["0.zone"];
	    }
	}
	
	
	

}

export namespace event {
	
	export class Event {
	    windowSizeChange: number;
	    hasNewFofaDownloadItem: number;
	    hasNewDownloadItem: number;
	    hasNewHunterDownloadItem: number;
	    hunterQueryFinished: number;
	    hasNewIcpDownloadItem: number;
	    hasNewQuakeDownloadItem: number;
	    hasNew0ZoneSiteDownloadItem: number;
	    hasNew0ZoneMemberDownloadItem: number;
	    hasNew0ZoneEmailDownloadItem: number;
	    hasNew0ZoneDomainDownloadItem: number;
	    httpxOutput: number;
	    httpxOutputDone: number;
	    decompileWxMiniProgram: number;
	    decompileWxMiniProgramDone: number;
	
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
	    }
	}

}

export namespace fofa {
	
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
	    page: number;
	    size: number;
	    items: Item[];
	    maxPage: number;
	    id: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.query = source["query"];
	        this.total = source["total"];
	        this.page = source["page"];
	        this.size = source["size"];
	        this.items = this.convertValues(source["items"], Item);
	        this.maxPage = source["maxPage"];
	        this.id = source["id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	
	    static createFrom(source: any = {}) {
	        return new Component(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.version = source["version"];
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
		    if (a.slice) {
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
	    page: number;
	    size: number;
	    items: Item[];
	    maxPage: number;
	    id: number;
	
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
	        this.page = source["page"];
	        this.size = source["size"];
	        this.items = this.convertValues(source["items"], Item);
	        this.maxPage = source["maxPage"];
	        this.id = source["id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	
	export class Image {
	    bigImage: string;
	    smallImage: string;
	    uuid: string;
	    secretKey: string;
	    wordCount: number;
	
	    static createFrom(source: any = {}) {
	        return new Image(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.bigImage = source["bigImage"];
	        this.smallImage = source["smallImage"];
	        this.uuid = source["uuid"];
	        this.secretKey = source["secretKey"];
	        this.wordCount = source["wordCount"];
	    }
	}
	export class Item {
	    domain: string;
	    domainId: number;
	    leaderName: string;
	    limitAccess: string;
	    mainId: number;
	    mainLicence: string;
	    natureName: string;
	    serviceId: number;
	    serviceLicence: string;
	    unitName: string;
	    updateRecordTime: string;
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.domain = source["domain"];
	        this.domainId = source["domainId"];
	        this.leaderName = source["leaderName"];
	        this.limitAccess = source["limitAccess"];
	        this.mainId = source["mainId"];
	        this.mainLicence = source["mainLicence"];
	        this.natureName = source["natureName"];
	        this.serviceId = source["serviceId"];
	        this.serviceLicence = source["serviceLicence"];
	        this.unitName = source["unitName"];
	        this.updateRecordTime = source["updateRecordTime"];
	    }
	}
	export class QueryResult {
	    page: number;
	    size: number;
	    total: number;
	    items: Item[];
	    task_id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.size = source["size"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], Item);
	        this.task_id = source["task_id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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

export namespace model {
	
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
		    if (a.slice) {
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
	
	export class Fofa {
	    id: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: gorm
	    deletedAt: any;
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
	        return new Fofa(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.deletedAt = this.convertValues(source["deletedAt"], null);
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
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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

export namespace quake {
	
	export class Component {
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
		    if (a.slice) {
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
		    if (a.slice) {
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
	    page: number;
	    size: number;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new RSDQueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.items = this.convertValues(source["items"], RealtimeServiceItem);
	        this.page = source["page"];
	        this.size = source["size"];
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new RealtimeServiceQueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], RSDQueryResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
		    if (a.slice) {
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

export namespace wechat {
	
	export class Version {
	    number: string;
	    unpacked: boolean;
	    update_date: string;
	
	    static createFrom(source: any = {}) {
	        return new Version(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.unpacked = source["unpacked"];
	        this.update_date = source["update_date"];
	    }
	}
	export class MiniProgram {
	    app_id: string;
	    update_date: string;
	    versions: Version[];
	
	    static createFrom(source: any = {}) {
	        return new MiniProgram(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app_id = source["app_id"];
	        this.update_date = source["update_date"];
	        this.versions = this.convertValues(source["versions"], Version);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	export class TestA {
	    a: boolean;
	    b: string;
	
	    static createFrom(source: any = {}) {
	        return new TestA(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.a = source["a"];
	        this.b = source["b"];
	    }
	}
	export class TestB {
	    tests: TestA[];
	
	    static createFrom(source: any = {}) {
	        return new TestB(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tests = this.convertValues(source["tests"], TestA);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
		    if (a.slice) {
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
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: AimItem[];
	
	    static createFrom(source: any = {}) {
	        return new AimResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], AimItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: ApkItem[];
	
	    static createFrom(source: any = {}) {
	        return new ApkResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], ApkItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: CodeItem[];
	
	    static createFrom(source: any = {}) {
	        return new CodeResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], CodeItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: DarknetItem[];
	
	    static createFrom(source: any = {}) {
	        return new DarknetResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], DarknetItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: DomainItem[];
	
	    static createFrom(source: any = {}) {
	        return new DomainResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], DomainItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: EmailItem[];
	
	    static createFrom(source: any = {}) {
	        return new EmailResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], EmailItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: MemberItem[];
	
	    static createFrom(source: any = {}) {
	        return new MemberResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], MemberItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryAimResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], AimResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryApkResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], ApkResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryCodeResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], CodeResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryDomainResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], DomainResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryDwmResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], DarknetResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryEmailResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], EmailResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QueryMemberResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], MemberResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    page: number;
	    pageSize: number;
	    total: number;
	    items: SiteItem[];
	
	    static createFrom(source: any = {}) {
	        return new SiteResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.total = source["total"];
	        this.items = this.convertValues(source["items"], SiteItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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
	    id: number;
	    maxPage: number;
	
	    static createFrom(source: any = {}) {
	        return new QuerySiteResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = this.convertValues(source["result"], SiteResult);
	        this.id = source["id"];
	        this.maxPage = source["maxPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
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

