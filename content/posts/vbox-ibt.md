---
title: "VirtualBox cannot start"
date: 2022-12-24T02:40:02+08:00
draft: false
mathjax: true
tags: [arch, linux]
---

# VirtualBox cannot start

最近想要用 virtual box 開一些 virtual machine，在上學期還好好地 work 但這學期不知道什麼時刻就不打算動了（？）
因為學期中很忙所以感覺很難找時間好好調查它，今天終於花時間來解決這個問題。

## context
打開 virtual box，想要 start 一個 VM 就會進入無限等待它的情況，而且還很難關掉它。

## solution
使用

```bash
sudo journalctl -b
```

看 log 發現在 start VM 的時刻有跳一個 error 是寫說 trap 之類的，長得大概很像這行

```
 kernel: kernel BUG at arch/x86/kernel/traps.c:252!
```

拿去搜尋之後搜尋到一個完全不同的東西但是是幾乎一樣的 error message 的類似東西有在討論問題，看起來是在某個版本之後，linux 的 kernel parameter 中 ibt 被預設開啟了，把這個參數手動調成 off 就可以解決這個問題了。

以 systemd-boot 為例，可以在後面加上 `ibt=off` 的參數就可以關掉了。disclaimer: 我也不知道有什麼影響。

```conf
title   Arch Linux
linux   /vmlinuz-linux
initrd  /initramfs-linux.img
options root=PARTUUID=blablablabla rw loglevel=3 quiet ibt=off
```

## Reference

https://github.com/umlaeute/v4l2loopback/issues/476
https://forums.developer.nvidia.com/t/error-in-kernel-boot-kernel-bug-at-arch-x86-kernel-traps-c-252/220443
https://github.com/NVIDIA/open-gpu-kernel-modules/issues/256
https://www.reddit.com/r/archlinux/comments/v0x3c4/psa_if_you_run_kernel_518_with_nvidia_pass_ibtoff/
https://wiki.archlinux.org/title/Kernel_parameters
