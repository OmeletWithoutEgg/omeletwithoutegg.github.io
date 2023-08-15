---
title: pulseaudio problems with mpv
date: 2022-12-21T16:33:11+08:00
draft: false
mathjax: true
tags: [arch, linux]
---

# mpv suspends pulseaudio sink

`mpv` 是一個簡單、輕量的 media player。

## Description

最近在用 `mpv` 播放影片的時候發現有時候暫停 youtube 的影片用 `mpv` 一下下再轉回去瀏覽器，就瘋狂轉圈圈然後表示「如果經過一段時間仍未開始播放，請試著重新啟動您的裝置」

## Solution

找 log 找了很久究竟誰是犯人， `systemctl restart --user pulseaudio` 之後影片就可以播了所以確定犯人是它。

```bash
systemctl status --user pulseaudio
```

然後就是一大堆的 `Failed to create sink input: sink is suspended.`

拿去搜尋得知應該是因為 pulseaudio 預設有打開某種 idle 時候自動 suspend 的機制，改掉預設的 config file 就可以了

```bash
vim /etc/pulse/default.pa
```

```conf
...
### Automatically suspend sinks/sources that become idle for too long
#load-module module-suspend-on-idle # comment this
...
```

## Another solution

看 Reference 那篇有說到安裝 pipewire-pulse 也可以解決問題，目前試起來沒什麼問題。
我覺得這個方法看起來比較乾淨。

## Reference
https://wiki.archlinux.org/title/Mpv
https://unix.stackexchange.com/questions/114602/pulseaudio-sink-always-suspended
