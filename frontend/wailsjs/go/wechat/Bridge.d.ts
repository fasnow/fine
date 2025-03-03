// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {wechat} from '../models';
import {proxy} from '../models';

export function AutoDecompile(arg1:boolean):Promise<void>;

export function ClearApplet():Promise<void>;

export function ClearDecompiled():Promise<void>;

export function Decompile(arg1:wechat.InfoToFront):Promise<void>;

export function GetAllMiniApp():Promise<Array<wechat.InfoToFront>>;

export function GetInfo(arg1:string):Promise<void>;

export function GetMatchedString(arg1:string,arg2:string):Promise<Array<string>>;

export function SaveWechatRules(arg1:Array<string>):Promise<void>;

export function SetAppletPath(arg1:string):Promise<void>;

export function SetRegex(arg1:Array<string>):Promise<void>;

export function UseProxyManager(arg1:proxy.Manager):Promise<void>;
