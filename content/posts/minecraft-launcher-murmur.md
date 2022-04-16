---
title: "Minecraft Launcher Murmur"
date: 2022-04-16T17:32:05+08:00
draft: false
mathjax: true
tags: [minecraft, arch, linux, experience]
---

# 抱怨一下 Minecraft Launcher

之前我都是用 [這個 AUR package](https://aur.archlinux.org/packages/minecraft-launcher) 作為 Minecraft launcher，但某個時間點之後發現登入帳號之後下面有一行小字寫說什麼無法成功記住你的登入 session 之類的，下次就必須重新進去那個跑很慢的視窗輸入密碼。
Minecraft 官網上對這個警告的指示是這樣子的：
https://help.minecraft.net/hc/en-us/articles/4408668374925-Secure-Token-Storage-Failure-on-Linux
也就是說，即使不是 GNOME desktop 也叫你要去裝 gnome-keyring 這個套件，照做之後果然可以成功記住我的身份。

又有一陣子很久沒玩，重新打開之後發現他竟然要我輸入 gnome-keyring 的不知道什麼密碼，而且還不能 focus 在其他視窗上讓我查一下密碼到底是啥，必須取消輸入密碼才能點其他視窗，真的雷雷。不過其實那個密碼忘記了也沒怎樣，只是要每次重新登入而已。今天剛好比較閒，查了非常久 gnome-keyring 要怎麼用，看網路上的各個教學跟 archwiki 上寫的都不太一樣，根本不知道要改什麼檔案，不過我得知了正常來說，跳出來的那個視窗要我輸入的密碼跟登入 desktop session 的密碼要是一樣的才對，也就是所謂的「login key」，而不是「Default key」。

而且有一個很奇怪的點是這樣子的：我開機登入 KDE 之後 `ps aux | grep gnome` 會知道說 `gnome-keyring-daemon` 有在跑，然後直接打開 minecraft-launcher 會先跳出紅色 error 過一陣子才成功登進去，多重開機幾次之後他彷彿就被玩壞了一樣沒辦法自動登入了QQ，跑去把一些檔案（`~/.local/share/keyring` 跟 `~/.minecraft/launcher_accounts.json` 之類的）刪一刪改一改才讓他變回正常，但再重開機幾次又變神秘了。

最後覺得放棄使用他才是最好的選擇（所以我也沒研究怎樣正確的設定 gnome-keyring 使用 login key 而不是 default key），缺點只是每次要重新登入。才突然想到我可以去 AUR 看有沒有人在講有關的解決方式，意外翻到 [polymc](https://aur.archlinux.org/packages/polymc) 這個 package，popularity 竟然比原本的還多，安裝之後發現他的 UI 看起來不錯，所以我就想說乾脆來研究 polymc 怎麼用。

首先第一件事就是要登入一個 microsoft 的帳號（mojang 的帳號之前就被強制 migrate 了），在 polymc 中也是有非常清楚的指示，照做之後遇上了年齡不足之類的警告，跑去翻我的 microsoft 帳號發現我這個帳號明明就已經超過 18 歲了啊@@
然後查了一大堆資料都說要去微軟官方的帳戶設定調整 Xbox 設定檔，但直接點進去只被告知沒有足夠的權限修改設定。就結果來說是因為雖然微軟帳號本身年齡夠了，但在申請 Xbox 帳號或是某個環節當初填的是兒童帳戶的身份，只好再花一堆時間找怎麼設定。

找得到的文章都是長這樣，罐頭回覆一堆
https://answers.microsoft.com/en-us/xbox/forum/all/i-cant-play-online-because-how-my-microsoft/b10fe53f-ac24-4dfb-b956-ff93f3e261e5
https://answers.microsoft.com/zh-hans/windows/forum/all/xbox/cffa87f6-4e0b-47d6-b077-d86e8956a8a0
https://answers.microsoft.com/zh-hant/windows/forum/all/%E5%B0%87%E5%85%92%E7%AB%A5%E5%B8%B3%E6%88%B6/9fa1acc4-30c1-43f0-bdcf-6c071f3c91d7
（我用的關鍵字是「This Microsoft account is underaged and is not linked to a family.」、「microsoft xbox 帳號 權限」跟「此 Microsoft 帳號未成年，也未連結到家庭群組。」之類的）

總之這樣搞一搞讓我覺得 microsoft 真的有夠雷 = =
後來的解決方式是我用另外一隻 email 信箱開一個 microsoft 帳號，然後邀請自己成為 [家庭](https://account.microsoft.com/family) 中有權限的人就可以點進去 [Xbox 設定檔](https://account.xbox.com/en-us/Settings) 了。

（本來覺得只會有兩三行的文章被我流水帳成這樣了好神奇）
