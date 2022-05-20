---
title: "Arch Install 202202"
date: 2022-02-08T08:30:33+08:00
draft: false
mathjax: true
tags: [arch, linux, pacman, KDE, plasma, grub]
---

# 安裝 arch

這篇文章是分享與紀錄我在筆電上裝 arch-linux 的過程，其實要裝還是直接看 arch wiki 最快XD 不過那個頁面沒有講怎麼裝 bootloader 與桌面環境。
<!-- 選用的桌面環境是 KDE （plasma）。-->

## 製作開機隨身碟（Live USB）
下載 .iso 檔案，並將其寫入 USB 當中（假設 USB 是 /dev/sdb）。
```bash
dd bs=4M if=~/Downloads/archlinux-2022.02.01-x86_64.iso of=/dev/sdb && sync
```

## 使用隨身碟開機
通常在開機時按下某個按鍵可以進入選擇開機媒介的選單，例如我現在這台 ASUS 的筆電就是在出現 logo 時按 F2 就會出現選單，在 boot 的地方可以選擇用
 usb 開機。

在使用隨身碟（使用 live 環境）開機時會有 .iso 裡面自帶的套件可以用，例如 vim、iwd、zsh 等等指令，但這些套件在安裝完成的 arch 裡面不會自動附上。

### 確認啟動模式
```bash
ls /sys/firmware/efi/efivars
```
如果指令沒有報錯，則系統在 UEFI 模式下啓動。如果目錄不存在，系統可能以 BIOS 或 CSM 模式啓動。

### 連上網路
使用 iwctl 連上 Wi-Fi 網路
```bash
iwctl
[iwd]# device list
[iwd]# station DEVICE scan
[iwd]# station DEVICE connect SSID
```
其中 DEVICE 是你的網路介面裝置的名稱

可以用 ping 確認連線狀態
```bash
ping archlinux.org
```

### 更新系統時間
```bash
timedatectl set-ntp true
```

### 切割與格式化硬碟
把你的硬碟分區，至少要切出用來當 root（```/```）跟 boot（```/boot```）的兩塊，其中 boot 要至少 512 MB。非常推薦把（```/home```）也切成獨立的一塊，到時候重裝的時候比較方便。如果是 BIOS 的話則不需要切出 `/boot` 分區。

另外還可以切一塊來當作 swap，我自己切大約 2G（？）
假設你的硬碟是 ```/dev/sda```，那麼可以用 ```fdisk /dev/sda``` 來修改與查詢分割區。

`fdisk` 按 n 會新增一個分區，接著會要輸入分區編號、First Sector、Last Sector、分區類型，其中 Last Sector 可以打 +{N}G 來設定磁碟大小，其他參數都可以預設就好。

按 p 會顯示目前的分區狀態，按 d 則是可以刪除分區。

基本上 ```fdisk``` 指令按 m 就可以獲得很多提示，此外在下 w （儲存）指令之前都不會真正的修改分割區，因此 w 要小心一點下。

接著就是要格式化每個切割出來的分區。
格式化一般的 linux 檔案系統（通常是 ext4）的指令如下，假設要格式化的是 ```/dev/sda3``` 與 ```/dev/sda4``` 分區，分別當作根分區（root partition）與 home 分區。

```bash
mkfs.ext4 /dev/sda3
mkfs.ext4 /dev/sda4
```

swap 分割區可以用 ```mkswap``` 格式化。
```bash
mkswap /dev/dev/sda2
```

一個 EFI 系統分區通常是用 FAT32 格式化
```bash
mkfs.fat -F 32 /dev/sda1
```

### 掛載處理好的硬碟
將根分區掛載到 ```/mnt```，其他對應的硬碟分區也掛載到對應的掛載點。
例如：
```bash
mount /dev/sda3 /mnt
mkdir /mnt/{home,boot}
mount /dev/sda1 /mnt/boot # mount /dev/sda1 on boot
mount /dev/sda4 /mnt/home # mount /dev/sda4 on home
swapon /dev/sda2 # enable swap
```

### 安裝
使用 ```pacstrap``` 指令在 /mnt 安裝以下三個 package
```bash
pacstrap /mnt base linux linux-firmware
```

再次注意 base 軟體包中不包含 live 環境中的所有工具，因此像是 ```vi```、```git``` 等基礎設施（？）可以記得安裝。

## 配置系統
接下來我們會換根成 /mnt 並對裡面的文件做一些修改

首先把 fstab 文件放到 ```etc/fstab```
```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

正式把 /mnt 當成我們的新根，進入新系統。
```bash
arch-chroot /mnt
```

接下來，可以看到 console 最前面有 (chroot) 字樣，表示你的操作現在只會看得到並且只會影響原本的 /mnt，也是新的 /。

### 時區
```bash
ln -sf /usr/share/zoneinfo/Asia/Taipei /etc/localtime
```

執行 hwclock
```bash
hwclock --systohc
```

### locale
編輯 ```/etc/locale.gen```，取消註釋 en_US.UTF-8 UTF-8 和其它需要的 locale，然後執行以下指令來生成它們：
```bash
locale-gen
```

在 ```/etc/locale.conf``` 設定
```bash
LANG=en_US.UTF-8
```

### host name
編輯 ```/etc/hostname``` 成自己喜歡的名字（？）
順帶一提前面所說的編輯只可以用已經安裝在新根的軟體，例如 vi 之類的。
```bash
pacman -S vi
```

### 設定 root 密碼
```bash
passwd
```

## 安裝 bootloader

我使用的 bootloader 是 GRUB。若是 UEFI 的話：
```bash
pacman -S grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg
```

若是 BIOS 則可以

```bash
pacman -S grub
grub-install --target=i386-pc /dev/sda # 可以是原本 root partition 同樣的硬碟
```



## 安裝 KDE (plasma) 桌面環境

```bash
pacman -S xorg plasma sddm networkmanager
pacman -S kate dolphin git zsh konsole openssh gvim # 一些我常用的基礎東東（？）
```

途中的選項我都是選預設的。

安裝完成後，記得啟用 sddm 與 networkmanager 的 service
```bash
systemctl enable sddm
systemctl enable NetworkManager
```
注意不要同時啟用 iwd 與 NetworkManager 兩個網路 service，否則打架會讓你的 sudo 動不了很難受…

### 增加非 root user 以及給予 sudo

```bash
useradd USER -m
passwd USER
```

編輯 sudoer 的設定檔，把

```text
%sudo   ALL=(ALL:ALL) ALL
```

這行的註解取消掉，讓 sudo 這個 group 的人可以使用 sudo。

接著
```bash
groupadd sudo
usermod -aG sudo USER
```

會需要新增一個 user 是因為 plasma 不允許 root 直接登入桌面環境，而讓其有 sudo 權限是因為做任何事情像是裝套件都會需要有 sudo 權限。

## 結束！
退出 chroot（exit 或 Ctrl + D），並 ```reboot```
一切搞定，可以去用 GUI 改 KDE 的一些設定，像是 theme、工作列或是觸控版方向（？）
還有可以裝一個 web browser，我自己常用 google-chrome，可以用 AUR 安裝。

```bash
git clone https://aur.archlinux.org/google-chrome.git
cd google-chrome
makepkg -si # build the package, install dependencies, install itself
```
