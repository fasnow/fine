const js_beautify = require('js-beautify');
const fs = require('fs-extra');
const path = require('path');

function isEmpty(str) {
    if (str === undefined || str === null) {
        return true
    }
    if (typeof str !== "string") {
        throw new TypeError("Input must be a string");
    }
    return str.trim().length === 0;
}

function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
}

function changeFileExtension(name, ext = "") {
    if (ext != "") {
        ext = "." + ext
    }
    let index = name.lastIndexOf(".")
    if (index === -1) {
        return name + ext;
    }
    return name.slice(0, index) + ext;
}

function codeBeautify(type, buf) {
    switch (type) {
        case "js":
            return js_beautify.js(buf.toString("utf-8"), { indent_size: 2, space_in_empty_paren: true })
        case "json":
            return JSON.stringify(JSON.parse(buf.toString("utf-8")), null, 4);
        case "html":
            return js_beautify.html(buf.toString("utf-8"), { indent_size: 2, space_in_empty_paren: true })
        case "css":
        case "xml":
        case "wxs":
            return js_beautify.js_beautify(buf.toString("utf-8"));
        default:
            return buf;
    }
}
// 从第一个字符开始找到两个路径的公共部分
function getCommonPath(pathA, pathB) {
    if (pathA[0] == ".") pathA = pathA.slice(1);
    if (pathB[0] == ".") pathB = pathB.slice(1);
    pathA = pathA.replace(/\\/g, '/');
    pathB = pathB.replace(/\\/g, '/');
    let minLength = Math.min(pathA.length, pathB.length);

    let commonLength = 0;
    for (let i = 0; i < minLength; i++) {
        if (pathA[i] !== pathB[i]) {
            break;
        }
        if (pathA[i] === '/') {
            commonLength = i;
        }
    }
    return pathA.slice(0, commonLength + 1);
}

// 若dirA以dirB开头，则删除dirA中的dirB然后返回，否则返回dirA
function getUniquePath(dirA, dirB) {
    return dirA?.startsWith(dirB) ? dirA?.slice(dirB.length + 1) : dirA;
}

function writeFile(filepath, content) {
    filepath = filepath.replace(/plugin-private:/g, "plugin-private") //fix private: error
    const dir = path.dirname(filepath);
    fs.ensureDir(dir).then(
        () => fs.writeFile(filepath, content, 'utf8')
    ).catch(
        err => console.error('Error creating directories or writing files:', err)
    )
}

async function getAllFileByExt(dir, ext) {
    return await getAllFileByExtE(dir, ext)
}

async function getAllFileByExtE(dir, ext) {
    let result = [];
    try {
        const files = await fs.readdir(dir);
        for (const file of files) {
            let name = path.resolve(dir, file);
            const stats = await fs.stat(name);
            if (stats.isDirectory()) {
                const subDirFiles = await getAllFileByExt(name, ext);
                result.push(...subDirFiles);
            } else if (stats.isFile() && name.endsWith(ext)) {
                result.push(name);
            }
        }
    } catch (err) {
        console.error('Unable to scan directory:', err);
    }
    return result;
}


//get relative path without posix/win32 problem
function toDir(to, from) {
    // 去掉路径开头的点号（.）
    if (from[0] == ".") {
        from = from.slice(1);
    }
    if (to[0] == ".") {
        to = to.slice(1);
    }

    from = from.replace(/\\/g, '/');
    to = to.replace(/\\/g, '/');
    let minLength = Math.min(to.length, from.length);

    // 找到两个路径的公共部分
    let commonLength = 0;
    for (let i = 0; i < minLength; i++) {
        if (to[i] !== from[i]) {
            break;
        }
        if (to[i] === '/') {
            commonLength = i + 1; // 更新到下一个斜杠的位置
        }
    }

    let pub = from.slice(0, commonLength);
    let len = pub.lastIndexOf("/") + 1;
    let k = from.slice(len);

    // 构造相对路径
    let ret = "";
    for (let i = 0; i < k.length; i++) {
        if (k[i] == '/') ret += '../';
    }

    return ret + to.slice(len);
}

function fixDir(dir) {
    return dir.startsWith(rdir) ? dir.slice(rdir.length + 1) : dir;
}


// 删除单个文件
function deleteFile(filePath) {
    fs.remove(filePath)
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要+1，并且补零
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
    isEmpty,
    codeBeautify,
    getFileExtension,
    changeFileExtension,
    writeFile,
    toDir,
    getAllFileByExt,
    getUniquePath,
    formatDate
};
