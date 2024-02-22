import {Base64} from "js-base64";

export function base64ToBytes(base64Str:string): Uint8Array{
    const binaryString = Base64.decode(base64Str)
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function changeExtension(filename:string, ext = "") {
    return filename.slice(0, filename.lastIndexOf(".")) + ext;
}

export function toDir(to:string, from:string) {//get relative path without posix/win32 problem
    if (from[0] == ".") from = from.slice(1);
    if (to[0] == ".") to = to.slice(1);
    from = from.replace(/\\/g, '/');
    to = to.replace(/\\/g, '/');
    let a = Math.min(to.length, from.length);
    for (let i = 1, m = Math.min(to.length, from.length); i <= m; i++) if (!to.startsWith(from.slice(0, i))) {
        a = i - 1;
        break;
    }
    let pub = from.slice(0, a);
    let len = pub.lastIndexOf("/") + 1;
    let k = from.slice(len);
    let ret = "";
    for (let i = 0; i < k.length; i++) if (k[i] == '/') ret += '../';
    return ret + to.slice(len);
}

export function getCommonDirectory(pathA: string, pathB: string): string {
    pathA = pathA.replace(/^\./, '').replace(/\\/g, '/');
    pathB = pathB.replace(/^\./, '').replace(/\\/g, '/');
    if (!pathA.endsWith('/')) pathA += '/';
    if (!pathB.endsWith('/')) pathB += '/';
    const minLength = Math.min(pathA.length, pathB.length);
    let lastSlashIndex = -1;

    // 找到最后一个相同的斜杠位置
    for (let i = 0; i < minLength; i++) {
        if (pathA[i] !== pathB[i]) {
            break;
        }
        if (pathA[i] === '/') {
            lastSlashIndex = i;
        }
    }

    // 返回公共目录部分，如果没有找到则返回空字符串
    return pathA.substring(0, lastSlashIndex + 1);
}
// export function scanDirByExt(dir:string, ext:string) {
//     let result:any = []
//
//     function helper(dir) {
//         scanEvent.encount();
//         ioLimit.runWithCb(fs.readdir.bind(fs), dir, (err, files) => {
//             if (err) throw Error("Scan dir error: " + err);
//             for (let file of files) {
//                 scanEvent.encount();
//                 let name = path.resolve(dir, file);
//                 fs.stat(name, (err, stats) => {
//                     if (err) throw Error("Scan dir error: " + err);
//                     if (stats.isDirectory()) helper(name);
//                     else if (stats.isFile() && name.endsWith(ext)) result.push(name);
//                     scanEvent.decount();
//                 });
//             }
//             scanEvent.decount();
//         });
//     }
//
//     scanEvent.add(cb, result);
//     helper(dir, ext, scanEvent);
// }
