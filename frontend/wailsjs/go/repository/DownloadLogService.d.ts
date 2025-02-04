// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {models} from '../models';

export function Clear():Promise<void>;

export function GetByOffset(arg1:number,arg2:number):Promise<{[key: string]: any}>;

export function GetByPagination(arg1:number,arg2:number):Promise<Array<models.DownloadLog>>;

export function GetRunningOrErrorOccurredTask():Promise<Array<models.ExportStatus>>;

export function Insert(arg1:models.DownloadLog,arg2:number):Promise<void>;

export function MarkAsDeleted(arg1:number):Promise<void>;

export function UpdateStatus(arg1:number,arg2:number,arg3:string):Promise<void>;
