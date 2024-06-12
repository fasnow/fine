# Fine

网络空间资产测绘工具，目前支持fofa、hunter、quake和零零信安，ICP备案、IP138域名解析与IP反查、外部HTTP调用与小程序反编译。

![image-20240318101417116](README_images/image-20240318101417116.png)
=======

macOS提示文件损坏请执行下面命令后重新打开。

```
sudo xattr -d com.apple.quarantine Fine.app
```
# 自主编译

第一步：环境。

```
git https://git-scm.com/downloads
nodejs https://nodejs.org/en/download/prebuilt-installer （只支持18版本）
golang https://go.dev/dl/
wails https://wails.io/docs/gettingstarted/installation
```

第二步：初始化。

```
git clone https://github.com/fasnow/fine.git && cd fine && go mod tidy && cd ../frontend && npm install --force  
```

第三步。

```
cd fine/wechatMiniProgram && npm install --force && npm build
# 如果提示pkg不存在先执行npm install pkg --force后再执行上述命令
```

将编译好的可执行文件重命名为`decompile`放入`backend/service/service/wechat`目录下。

第四步：生成的可执行文件在`fine/build/bin`目录下。

```
cd fine && wails build
```

## TODO

？？？

