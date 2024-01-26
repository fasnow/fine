// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {config} from '../models';

export function CheckAuth(arg1:string):Promise<boolean>;

export function Get0zoneAuth():Promise<config.Zone>;

export function GetAll():Promise<config.Config>;

export function GetConfigAbsFilePath():Promise<string>;

export function GetConfigBaseDir():Promise<string>;

export function GetConfigFromFile():Promise<config.Config>;

export function GetDBFile():Promise<string>;

export function GetDataBaseDir():Promise<string>;

export function GetDefaultInterval():Promise<config.Interval>;

export function GetDefaultTimeout():Promise<number>;

export function GetFofaAuth():Promise<config.Fofa>;

export function GetHttpx():Promise<config.Httpx>;

export function GetHunterAuth():Promise<config.Hunter>;

export function GetProxy():Promise<config.Proxy>;

export function GetQuakeAuth():Promise<config.Quake>;

export function Init():Promise<void>;

export function Save0zoneAuth(arg1:string):Promise<void>;

export function SaveConf(arg1:config.Config):Promise<void>;

export function SaveFofaAuth(arg1:string,arg2:string):Promise<void>;

export function SaveHttpx(arg1:config.Httpx):Promise<void>;

export function SaveHunterAuth(arg1:string):Promise<void>;

export function SaveProxy(arg1:config.Proxy):Promise<void>;

export function SaveQuakeAuth(arg1:string):Promise<void>;
