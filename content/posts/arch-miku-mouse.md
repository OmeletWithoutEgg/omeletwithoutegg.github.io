---
title: "Miku Cursor on Arch Linux"
date: 2020-12-10T17:05:06+08:00
draft: false
tags: [Arch, experience, miku]
---

# 在Arch的初音游標
因為在Windows有下載一個可愛的初音游標，但是之前換成Ubuntu後就沒有把他裝回來，覺得很可惜。
因此現在換成Arch之後，想說應該有一些社群的package可以用了，直接抓來就好，但是怎麼google都google不到？
因此大概花了半天去解決他，想說在這邊做個小筆記以免下次重裝的時候重摸一遍。

1. 找到[巴哈姆特](https://home.gamer.com.tw/creationDetail.php?sn=1760192)上面的原始檔（是.ani跟.cur）
2. 利用[cursor-converter](https://github.com/paddygord/cursor-converter)把.ani和.cur換成x-cursor的icon類型
3. 手動把對應的圖案複製到 `~/.icons/$THEME/cursors` 裡面
   如果不知道哪個檔名是什麼的話，可以先複製別的theme的資料夾，接著用 `xcur2png` 換成 png看某個檔案實際上是對應哪個圖案。
4. 加上 `index.theme`。反正只要有Name就可以了吧我猜

中間踩了各種怪東西XD
我原本先去下載了其他主題，想說看別的主題的游標應該是什麼對應到什麼，尤其是有動畫的。
不過似乎有動畫的游標和沒動畫的檔名一樣QQ
然後有找到一個ani2png，但是畫質會爆炸而且沒有幫忙放到對應的位置（雖然最後也是我們自己放到對應的位置）
接著找到CSDN上面有人說用CursorXP從Windows上面把游標主題包起來，接著在Linux下載一個用來轉換成icon類型的Perl腳本，
會轉換成一個tar.gz然後就可以安裝的樣子了，不過還是偏糟，從Windows上面看就發現畫質還是大小大爆炸了

最後終於走對路，找到github上面一個比較新的repo是把.ani跟.cur轉成linux的x-cursor檔案
真是要感謝他們www

話說我發現其實可以直接把檔案放到[github](https://github.com/OmeletWithoutEgg/miku-cursor-theme)上面，這樣也可以推廣或是找人來修改(X
裡面有好多icon是從breeze主題抄過來的，畢竟應該都是很少看到的icon所以應該不會影響太大，但是想包成AUR或是什麼的時候好像就得在乎一點一致性ㄌ，所以希望放到github上之後有人可以把其他那些icon改成統一的風格owo
