---
title: "又是 Arch Install：在 HP 筆電上面雙系統與 secure boot"
date: 2022-08-31T17:16:20+08:00
draft: true
mathjax: true
tags: [arch, linux, pacman, KDE, plasma, grub, systemd-boot, secure-boot]
---

# 緣由
這麼快的時間就發下一篇 archlinux 的文，我真的覺得我越來越是 `BTW I use arch` 的人了XD
不過這次裝 archlinux 也是有理由的，因為我從 NPSC 拿到的筆電的電池壞掉了，如果沒有插著電就會直接關機，想說就順便換了一台新的筆電。因為奇怪的堅持不想用 Mac，選了選之後最後是挑 HP pavilion plus 14。

上次因為是想要整台變成 Linux 所以比較不用煩惱一些問題，這次我希望能夠雙系統 Windows 並且可以玩一些遊戲，會需要有 secure boot 的功能所以也有比較不同的設定；此外這次也有碰到各種不同的問題，作為紀錄以及希望能幫助有遇到類似問題的人就發一篇文吧 :P

# 流水帳
## 事前需要的材料
不一定要用但我有用到

- USB device * 2 （一支會要灌 iso 進去讓資料整個不見，另一支是拿來備份一些小東西的）
- 可以上網的手機 & 電腦 & wifi-AP
- 電源線

## 大綱
首先直接跑 Windows 安裝引導把 Windows 用正常的方式安裝好，接著使用 USB 開機的方式啟動 live environment，在各種 trial-and-error 之後終於把各種硬體問題排除，最後再裝 Desktop Environment 與各種 GUI/CLI apps。

## prepare installation medium
請參考 [archwiki](https://wiki.archlinux.org/title/USB_flash_installation_medium#Using_win32diskimager)

1. 將一支可以清空的隨身碟插在可以上網的電腦當中
2. 下載 [archlinux_iso](https://archlinux.org/download/)。假設下載的 iso 檔放在 `$HOME/Downloads/archlinux-2022.08.05-x86_64.iso`。
3. 將 iso 檔寫入隨身碟。
    如果是 linux 的話，可以看插入前後 `/dev/` 多了什麼東西去看隨身碟對應的 character device 是什麼，這邊假設是 `/dev/sda` 並使用 `dd` 指令寫入。
    ```bash
    sudo dd bs=4M if=$HOME/Downloads/archlinux-2022.08.05-x86_64.iso of=/dev/sda status=progress
    ```
    如果是 windows 可以用 Rufus 等等。

## In Windows

### Windows 安裝
下一步、下一步、下一步。

### 關閉「快速啟動」（fast startup）
打開「控制台」的「電源選項」，選擇「變更目前無法使用的設定」並取消勾選「開啟快速啟動」。

### 儲存bitlocker recoverykey
bitlocker 這件事是 ZCK 有提過的，於是我就上網查，發現似乎不用把 bitlocker 關掉，
但是應該要把 bitlocker recoverykey 備份下來，幸好有備份（？）某個時間點還真的有跳出來。

P.S. 寫完這篇的前面這部份一段時間後，剛剛需要用的時候差點以為自己把他刪掉了，真是嚇死人，奉勸大家這個東西要好好備份。

### 確認開機模式
現在的電腦應該都是 UEFI 模式了，不過可以確認一下。
按 `Win + R` 執行 `msinfo32`，檢查 BIOS 模式是「UEFI」還是「Legacy BIOS」

### 分割磁碟
現在的電腦應該都是 GPT 吧 oao
按 `Win + X`，選擇磁碟管理並分割出一塊給 Arch 用的空間（所謂「壓縮磁碟機」）。
預設可能會有好幾個分區，例如 EFI、Microsoft reserved、Windows recovery environment 等等，
不用動其他的分區，只切最大的那塊（通常就是 C 槽）切出一塊空間給 Arch。

## In BIOS interface
這台 HP 的 BIOS 介面跟之前我那台 ASUS 不一樣，有一點不習慣。
在開機的時候按一些功能鍵就會打開 BIOS setup 的介面。

- F10：調整 BIOS 設定
- F9：進入 boot menu。
- F2/F3：進入系統診斷/測試

### 關閉 Secure Boot
因為 Arch 官網的 Live ISO 應該是不支援 Secure boot 的，所以必須要把 boot option 當中的 secure boot 先暫時關掉。

### 開機順序
在這個 BIOS 介面當中有四種 boot 的選項，先把 USB 開機調到最上面才可以用剛剛燒錄的 Live USB 開機。

----

## In Live Environment
在使用 Live USB 開機之後，會進入熟悉的 archiso 畫面。
最精彩的各種問題…

### 網路
第一步當然就是確認網路連線了，我在這邊遇到了第一個大問題就是這個 Live ISO 沒有偵測到我這台 HP 的網卡，
第一次遇到這種問題，經過各種搜尋之後得知：
1. 沒有偵測到網卡大概是因為驅動程式的問題
2. 要先上網才比較好裝驅動程式，但這台筆電又沒有乙太網路線的接孔（當然可能可以外接各種線解決）
幸好有一種對我比較方便的方法是用手機接 USB 分享網路（Andriod tethering），只要把手機接到電腦上就可以用手機分享的網路上網。
（見 reference \[5\] \[6\]）

把手機接到電腦上，在 Andriod 手機上選擇用 USB 分享行動網路，就可以用 `ip link` 看到 介面名稱了。使用 `dhcpcd` 連上網路。
```bash
ip link
dhcpcd enp0s20f0u1 # result of ip link
```

接著用這個勉強的手機 5G 網路趕快下載一些基本的套件還有所需要的驅動程式

### 萬年流程

```bash
ping archlinux.org
timedatectl set-ntp true
```

#### 分割磁碟
使用 `fdisk`, `gdisk`, `cfdisk` 等工具將剛剛在 Windows 切割的一大塊磁碟再細分，切出 2G 的 swap 以及分別拿來當 `/home` 與 `/` 的分區。
注意不要刪除原本 Windows 建的那些分區，此外也不需要額外建一個 EFI system partition，直接用原本的就好了。
（見 [archwiki](https://wiki.archlinux.org/title/Dual_boot_with_Windows#UEFI_systems)）

### 格式化
在我的系統上，硬碟是 `/dev/nvme0n1`，因為 Windows 原本就有四個分區 `/dev/nvme0n1p1` 到 `/dev/nvme0n1p4`，所以我拿來當 `/`，`/home` 跟 swap 的分區就是從 5 開始編號了。我選用經典的 ext4 格式。

```bash
mkfs.ext4 /dev/nvme0n1p5
mkfs.ext4 /dev/nvme0n1p6
mkswap /dev/nvmepn1p7
```

#### mount 磁碟分區
把剛剛所切割好的磁碟分區放進 linux 檔案系統裡面，讓裡面的資料真正的變成我們系統上的資料夾，這件事稱作 mount。
我實在不太會解釋 mount 是做什麼的，總之我們要把切來當 `/` 和 `/home` 的磁碟分區放到 `/mnt/` 和 `/mnt/home`。

```bash
mount /dev/nvme0n1p5 /mnt/
mount /dev/nvmepn1p6 /mnt/home --mkdir
swapon /dev/nvmepn1p7
```

有人會注意到 archwiki 上有叫我們建一個 `/boot` 的分區，不過因為是雙系統，所以直接使用 windows 原本的 EFI 分區就可以了，在我的電腦上是 `/dev/nvme0n1p1`。

```bash
mount /dev/nvme0n1p1 /mnt/boot --mkdir
```

#### pacstrap time
下一步就是下載所有需要的套件到硬碟上了。因為手機網路特別爛，所以可以先用 `reflector` 或是 `rankmirrors` 等工具來設定使用離自己比較近、速度比較快的鏡像源（mirror）。

```bash
pacman -S reflector
vim /etc/xdg/reflector/reflector.conf # --sort rate 意思是按速度 --country 可以選 Taiwan
systemctl start reflector
```

```bash
pacstrap /mnt base linux linux-firmware git curl gvim base-devel
```

### In Chroot
因為平常直接使用 `root` 使用者比較不安全之類的緣故，安裝 AUR 和使用 KDE plasma 都要另外開一個非 `root` 的正常使用者。
先順便 `genfstab`，再在安裝好的系統 chroot 之後新增一個非 `root` 使用者，設定密碼以及設為 sudoer。

```bash
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
useradd -m omelet
groupadd sudo
usermod -aG sudo omelet
passwd omelet
vim /etc/sudoers # uncomment the %sudo line, :w! to save
```

一些參考 [archwiki](https://wiki.archlinux.org/title/Installation_guide) 的基本設定

```bash
ln -sf /usr/share/zoneinfo/Asia/Taipei /etc/localtime
hwclock --systohc
vim /etc/locale.gen # uncomment en_US.UTF-8 and zh_TW.UTF-8
locale-gen
vim /etc/hostname # your hostname
vim /etc/locale.conf # LANG=en_US.UTF-8
```

因為已經有一個有密碼的 sudo user 了，所以就不讓 `root` 有可以登入的密碼。

接著安裝 AUR helper yay。

```bash
sudo -iu omelet
git clone https://aur.archlinux.org/yay-bin.git
cd yay-bin && makepkg -csi
exit
```

### 繼續處理驅動程式

#### 查看網卡型號
用 root 權限執行

```bash
lspci -vnnk | grep -i --context=20 net
```
得知這台的網卡型號是 `realtek` 的 `[10ec:b852]`。
查了一堆資料，最後找到應該可以用 `rtl8852be` 這個 kernel module。
(見 reference \[7\])
正好這也有被放在 AUR 上，因此直接用 `yay` 安裝。很感謝維護這個 module 的人。

```bash
yay -S rtl8852be-dkms-git # run as normal user
```

#### 解決音效卡驅動問題
這是在安裝桌面環境之後才發現的不過就放到這邊來講。
`lspci -vnnk` 之後發現好像有寫需要一些 kernel module 而且沒有 load 到。

同樣 google 了一下，得知應該是要安裝 `sof-firmware`，使用 `pacman` 安裝。
（見 reference [8]）

```bash
pacman -S sof-firmware
```

----

### 離開 live environment 之後的網路
雖然離開 live environment 之後還是可以用 tethering 、`dhcpcd` 的方式上網，不過只要網卡有設定好，理論上重開機之後執行 `ip link` 就會跳出除了 `lo` 之外的一個無線網卡介面（我的是 `wlo1`），再搭配一個正常的 wireless network daemon 就可以了。
可以用 `iwctl`、`networkmanager` 等，這邊用的是 `networkmanager`。

```bash
pacman -S networkmanager
systemctl enable networkmanager
```

重開機之後，要連上 AP 可以用 `sudo nmtui`。

### bootloader & secure boot
原本選用 GRUB，裝好 GRUB 之後第一次打開 Windows，才發現想玩的遊戲需要 secure boot。我想也是為了防作弊之類的吧（？）
研究了一下如何同時雙系統又 secure boot，看起來 GRUB 似乎是很難設定 secure boot，最後決定把 bootloader 換成 systemd-boot，雖然介面是更加的醜陋，不過不太常會需要去 access 那個介面，所以我就妥協了。

#### systemd-boot
請參考 [archwiki](https://wiki.archlinux.org/title/Systemd-boot)

請確保是 UEFI 開機模式，然後用 root 權限（還在 chroot 裡面）執行
```bash
bootctl install
```

接著有兩個地方要設定，第一個是要新增開機選單有哪些 entry，第二個是要設定開機選單的選項。
新增一個 `$esp/loader/entries/arch.conf` 的檔案，內容是

```text
title   Arch Linux
linux   /vmlinuz-linux
initrd  /initramfs-linux.img
options root=PARTUUID=XXXXXXXXXXXXXXXXXX rw loglevel=3 quiet
```

如果剛剛 `mount` 的時候是照著上面所說的 `mount`，那麼 `$esp` 應該就當成是 `/boot` 就可以了。
基本上 options 我是從 GRUB 那邊的設定抄來的，PARTUUID 可以用 `blkid /dev/xxx` 得到。

如果還想要再加入其他開機選項，例如在 options 或是 initrd 有不同設定的話，可以再新增其他檔案。
很方便的是不用做任何設定，`windows` 和 `reboot into UEFI firmware` 就會自動被加進開機選單了。

而開機選單的選項，也就是 `$esp/loader/loader.conf`，我試了幾個，最後還是決定用預設的（`loader.conf` 空白）就好。
`timeout` 預設是 0，也就是說除非開機時按著一些按鍵不然不會進入開機選單而是直接用預設的 `arch.conf` 開機，也比較不會看到那醜死人的畫面，賞心悅目。

#### secure boot
原本查到看起來超麻煩，直到找到了 `sbctl` 這個工具。
（雖然我是先找到 `sbctl`，再試 GRUB，最後才換成 systemd-boot 的）

大致上是照著 reference \[10\] 的方式，然後我記得有一篇文章是講說遇到權限不足的話要去 UEFI firmware 那邊調整，基本上在這邊會需要重開機，在 UEFI firmware 介面刪掉原本的 secure boot key，接著在 disable secure boot 的情況下進來 arch ，然後做這些簽名之後重開機再 enable secure boot。
記得可能會需要 bitlocker recoverkey！

```bash
pacman -S sbctl 

sbctl create-keys
sbctl enroll-keys --microsoft

# sign all the files that let `sbctl verify` fail
sbctl sign -s /boot/EFI/Linux/linux.efi
sbctl sign -s /boot/EFI/Linux/fallback.efi
sbctl sign -s /boot/EFI/systemd/systemd-bootx64.efi
sbctl sign -s /boot/EFI/Boot/bootx64.efi
sbctl sign -s /boot/EFI/Microsoft/bootmgfw.efi
sbctl sign -s /boot/EFI/Microsoft/bootmgr.efi
sbctl sign -s /boot/EFI/Microsoft/memtest.efi
...

sbctl verify
sbctl status
sbctl list-files

# Verify that the sbctl pacman hook works on a kernel upgrade.
# Ensure that the string "Signing EFI binaries..." appears.
pacman -S linux
```

### 桌面環境
這可以等到確定可以不靠 tethering 上網之後再裝，畢竟很肥又不是最優先的。
我選擇繼續使用 KDE，最近嘗試了一些比 KDE 輕量很多的 Tiling Window Manager，但老實說很多事情都搞不定，沒有一個整合好的 DE 所有東西都要自己設定真的蠻麻煩的，比如說游標在 KDE 進系統選單修改後就直接可以了，但其實是要把同樣的一個游標主題設定放到 `.gtkrc` 或是 `.config/gtk*` 之類的地方，然後我怎麼搞就是搞不定。
KDE 對我來說最大的缺點就是他一開就吃了不少記憶體，但換成 WM 也只是少 1G 左右，在換新電腦這件事的前提下，我已經不再需要擔心記憶體的問題了（希望）

而且我並沒有感受到 Tiling 或是 Workspace 這種概念很有用，我甚至在 KDE 或 Windows 上面都不會使用第二個 Desktop（我自己感覺等同於 i3 或 awesomeWM 的 workspace）。
keyboard-driven 或是 highly customizable 我也沒有感覺很特別。非 KDE 預設的快捷鍵我新增了兩組，分別是用 `ctrl + alt + t` 去開 terminal以及用 `ctrl + alt + r` 去使用 `rofi` 開啟應用程式。`rofi` 真的蠻 fancy 的，用起來很舒服。

以下是部份我有安裝的 package。
```bash
pacman -S plasma-meta
pacman -S --needed \
           git zsh openssh gvim \
           wezterm \
           dolphin ark kate \
           mpv gwenview okular spectacle \
           qutebrowser \
           rofi pass
```

----

# 結語
就像欣穆老師說的一樣，原本可能很簡單的過程，每個人都可能遇到各種不同的軟硬體、環境問題，排除這些問題我覺得蠻有成就感的。
雖然真的很耗費時間。

此外現在還有一些未知的問題，具體來說，KDE 預設的 Screen Energy Saving 設定中，螢幕過一定時間就會關閉，之前我都是只要有動觸控版或是鍵盤，螢幕就會重新打開，但現在不是很聽話。在影片暫停時讓螢幕關閉，再按空白鍵，可以發現影片會繼續播放（有聲音），但螢幕好像遲遲無法開啟；如果把亮度調整為 0 也會出現相同的症狀， ~~初步懷疑是因為 intel graphics 之類的東西，不是很懂 @@ 如果有人願意看到這裡還知道怎麼解決這個問題的話，歡迎來幫助我(X~~ 後來查到好像是 OLED 螢幕的問題，很高興竟然在前一兩個禮拜這個問題 upstream  已經有 fix 了，靜候它被加進 ArchLinux repository 的佳音。（見 reference \[12\] \[13\])

# reference

- [1] https://wiki.archlinux.org/title/Dual_boot_with_Windows
- [2] https://rupru8.pixnet.net/blog/post/349765618-%E9%9B%99%E7%B3%BB%E7%B5%B1
- [3] https://www.hp.com/us-en/shop/tech-takes/how-to-enter-bios-setup-windows-pcs
- [4] https://medium.com/hunter-cheng/%E5%A6%82%E4%BD%95%E5%9C%A8windows-10%E7%B3%BB%E7%B5%B1%E5%AE%89%E8%A3%9Dlinux%E9%9B%99%E7%B3%BB%E7%B5%B1-85ed07813270

----

- [5] https://unix.stackexchange.com/questions/423256/arch-ip-a-only-shows-lo
- [6] https://unix.stackexchange.com/questions/567882/wifi-menu-not-working-during-installation-of-arch-linux-no-wifi-interface-is-sh
- [7] https://askubuntu.com/questions/1412450/network-driver-for-realtek-10ecb852
- [8] https://bbs.archlinux.org/viewtopic.php?id=273328

----

- [9] https://wiki.archlinux.org/title/USB_flash_installation_medium

----

- [10] https://saligrama.io/blog/post/upgrading-personal-security-evil-maid/#enrolling-your-key-into-secure-boot
- [11] https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot#sbctl

----

- [12] https://bugs.kde.org/show_bug.cgi?id=447475
- [13] https://gitlab.freedesktop.org/drm/intel/-/issues/3657
