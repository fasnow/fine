// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {wechat} from '../models';
import {fofa} from '../models';

export function Export(arg1:number,arg2:number,arg3:number):Promise<void>;

export function GetAllMiniProgram():Promise<Array<wechat.MiniProgram>>;

export function GetUserInfo():Promise<fofa.User>;

export function Query(arg1:number,arg2:string,arg3:number,arg4:number,arg5:string,arg6:boolean):Promise<fofa.QueryResult>;

export function SetAuth(arg1:string,arg2:string):Promise<void>;
