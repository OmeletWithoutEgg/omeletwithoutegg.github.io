---
title: "Qutebrowser 瀏覽器"
date: 2022-03-29T10:13:55+08:00
draft: false
mathjax: true
tags: [arch, linux, qutebrowser, vim]
---

# Qutebrowser: vim-like browser

這是一篇推薦文與介紹文。

已經忘記開始使用 qutebrowser 的契機是什麼了，可能是看到（東東）學長用覺得很酷。
在熟悉 vim 之後，qutebrowser 作為一個「Keyboard-driven」的瀏覽器吸引力會大大提昇，其 UI 簡潔與配置的靈活也讓我愛不釋手

## Installation

https://qutebrowser.org/doc/install.html
在 Arch 下安裝不是難事。

```bash
sudo pacman -S qutebrowser
# Some optional dependencies
sudo pacman -S pdfjs python-adblock python-tldextract \
    python-pygments python-babel 
```

Ubuntu 也一樣是 `sudo apt install qutebrowser` 就可以了，但是版本似乎有點舊，以下提到的有些功能可能沒有或是行為不一樣。

## Keybind 簡介
首先，hjkl 跟 vim 一樣是上下左右。

使用 `:` 就可以進入 command mode，當然一樣可以使用各種快捷鍵來做各種瀏覽器內的操作。
以下是平常最常用的 keybindings！

| command                            | keybinding | 功能                                  |
|------------------------------------|------------|---------------------------------------|
| `:open {url}`                      | `o`        | 在目前的分頁開啟某個 URL              |
| `:open -t {url}`                   | `O`        | 在新分頁開啟某個 URL                  |
| `:tab-close`                       | `d`        | 關閉目前的分頁                        |
| `:undo`                            | `u`        | 重新開啟前一次關閉的分頁或視窗        |
| `:tab-prev`                        | `J`        | 下一個分頁（右邊）                    |
| `:tab-next`                        | `K`        | 上一個分頁（左邊）                    |
| `:back`                            | `H`        | 回到上一頁                            |
| `:forward`                         | `L`        | 回到下一頁                            |
| `:set-cmd-text :open {url:pretty}` | `go`       | 打開網址列（？）                      |
| `:zoom-in`                         | `+`        | 增加縮放倍數                          |
| `:zoom-out`                        | `-`        | 減少縮放倍數                          |
| `:zoom`                            | `=`        | 重置縮放倍數                          |
| `:reload`                          | `r`        | 重新整理                              |
| `:reload -f`                       | `R`        | 強制重新整理                          |
| `:yank`                            | `yy`       | 複製網址列                            |
| `:open -- {clipboard}`             | `pp`       | 打開剪貼簿所複製的網址                |
| `:open -t -- {clipboard}`          | `Pp`       | 在新分頁打開剪貼簿所複製的網址        |
| `:tab-move +`                      | `gJ`       | 把目前的分頁往上（右邊）移動          |
| `:tab-move -`                      | `gK`       | 把目前的分頁往下（左邊）移動          |
| `:q`                               |            | 關閉目前的視窗                        |
| `:quit --save`                     | `ZZ`       | 關閉 qutebrowser （這會關閉所有視窗） |

下面是在瀏覽一個頁面的時候的一些移動方法：

| keybinding | 功能         |
|------------|--------------|
| `gg`       | 跳到最上面   |
| `G`        | 跳到最下面   |
| `<Ctrl-F>` | 向下捲動一頁 |
| `<Ctrl-B>` | 向上捲動一頁 |
| `<Ctrl-D>` | 向下捲動半頁 |
| `<Ctrl-U>` | 向上捲動半頁 |
| `/`        | 向前搜尋     |
| `?`        | 向後搜尋     |

可以在 qutebrowser 中打開 [qute://help/img/cheatsheet-big.png](qute://help/img/cheatsheet-big.png) 看到更多。

### hint
hint 應該可以說是 qutebrowser 的一大特色之一。

在 normal mode 下按 `f` 後，目前視窗中所有元素就會出現一個小提示在旁邊（預設是黃色三角形+黑色 homerow 字母），當按下對應的按鍵之後瀏覽器就會做出「按下那個元素」的操作，而這也是 qutebrowser 的一大優點之一：可以完全不用滑鼠就完成瀏覽器所需的所有功能（當然，滑鼠功能預設還是可以用）。
與 `f` 類似的是 `F`，不同之處在於如果點擊的是超連結會在新分頁開啟頁面。
事實上 `f` 是 `:hint all` 指令的快捷鍵，除了 `f/F` 以外還有許多常用的 hint 組合，例如 `;t/;y/;h` 等等，分別代表「只 hint 所有 input fields」、「複製 hint 選到的元素連結」以及「hover hint 選到的元素」。可以說你沒想到的 qutebrowser 都想到了(X

熟練使用這個機制的話會對這個機制上癮，因為按鍵預設都是 homerow 的字母所以很好按，此外如果是同樣的 html，通常 parse 之後同樣的元素通常會對應到同樣的按鍵組合，例如在 youtube 回到首頁在我目前的電腦上就是 `da`、facebook 回到首頁是 `ga`、instagram 看限動是 `fa` 等等。

## Configuration
config 可以大致分成用 `:set` 設定的變數與用 `:bind` 設定的鍵盤快捷鍵兩部份。

首先，和 vim 一樣，qutebrowser 有許多的 option，可以用 `:set {option} {value}` 來設定一個 option 的 value，此外只要輸入指令就會有非常完整的提示，不用擔心要背下來（？）

一些例子：

| option                                    | 功能                                             |
|-------------------------------------------|--------------------------------------------------|
| `zoom.default`                            | 設定預設的縮放倍數                               |
| `url.searchengines`                       | 設定在 `open` 一個不是網址的東西時的預設搜尋引擎 |
| `content.javascript.can_access_clipboard` | 設定網站可以存取剪貼簿（這樣複製按鈕才能用）     |
| `fonts.default_size`                      | 設定字型預設大小                                 |
| `fonts.web.family.fixed`                  | 設定等寬字體                                     |

還有很多的東西可以客製化，包含各種 tab、statusbar 的顏色，可以調整成自己喜歡的主題。

`:bind` 則是跟 vim 的 `map` 很類似，可以訂製快捷鍵叫出自己需要的功能。以下是一些例子：

| bindkey     | command                                                              | 功能                                                               |
|-------------|----------------------------------------------------------------------|--------------------------------------------------------------------|
| `<Alt-Esc>` | `fake-key <Esc>`                                                     | 因為按 esc 只會進入 normal mode，所以有一個替代的按 esc 的方法。   |
| `;v`        | `hint links spawn mpv {hint-url}`                                    | 可以用 mpv （一個本機的影音軟體）打開一個影片網址，包含 youtube。  |
| `gs`        | `greasemonkey-reload ;; later 1 reload`                              | 重新載入 greasemonkey script。有時候沒載入 YT 就跑出影片廣告很煩人 |
| `zl`        | `spawn --userscript qute-pass`                                       | 使用 qute-pass 的快捷鍵                                            |
| `zb`        | `hint inputs tab-bg --first ;; later 1 spawn --userscript qute-pass` | 使用 qute-pass + 自動跳到 input field 的快捷鍵                     |

另外還有更進階的 configuration 功能，詳細要看 [qute://help/configuring.html](qute://help/configuring.html)，例如其實可以有一個 config.py 的檔案之類的。

## Optional dependencies

### pdfjs
安裝了這個可以在瀏覽器中打開 PDF，跟 chrome 一樣（？）
在下載 PDF 檔案時 qutebrowser 會問你要不要用 pdfjs 打開，按 `<Ctrl-P>` 就會自動下載到 `/tmp` 之類的地方再用 pdfjs 在 qutebrowser 中打開。
現在瀏覽器不能看 PDF 都會被說不及格(X

### python-adblock
安裝這個似乎是可以使用跟 Brave browser 一樣的 adblock 機制（要設定 `content.blocking.method = 'both'`），不過我在 youtube 上看到的廣告還是不少。

### python-tldextract
`qute-pass` 的 dependency。

### python-pygments
似乎是在 `:view-source` 的時候可以 `:view-source --pygments`，會改用 pygments 做 syntax highlight。

### python-babel 
這個真的沒有研究，似乎是跟語言翻譯有關的套件。

## qute-pass
[pass](https://wiki.archlinux.org/title/Pass) 是一個簡單的密碼管理軟體，而 qutebrowser 有內建一個 userscript `qute-pass` 可以把存在 `pass` 裡面的帳號密碼自動填入網站。
雖然有點小麻煩但真的很乾淨（？）

## youtube ads
因為 qutebrowser 的 adblock 沒有使用太複雜的機制，因此對於 youtube 影片式廣告沒什麼辦法，目前我看到的一個解決方案是使用 greasemonkey script。

https://gist.github.com/codiac-killer/87e027a2c4d5d5510b4af2d25bca5b01

# 結語
Give qutebrowser a try!
