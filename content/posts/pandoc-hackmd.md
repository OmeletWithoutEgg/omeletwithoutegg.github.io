---
title: "Pandoc HackMD to pdf"
date: 2023-10-02T00:33:55+08:00
draft: false
mathjax: true
tags: [linux, archlinux]
---

# Convert HackMD to PDF via pandoc

HackMD 是一個很好用的線上筆記協作工具，即使沒有重度協作拿來當個雲端 markdown 編輯器也是非常好用。
不過當需要印成紙本或是轉成 pdf 的時候就很麻煩了，有時候 CSS 直接都會跑掉。

Markdown 轉 pdf 一直都是一件百家爭鳴的事情，比較主流的可能是用 typora / obsidian 等等匯出成 pdf。
這邊打算介紹一個我學到的用 `pandoc` 轉 pdf 的方法。

## pandoc

```bash
sudo pacman -S pandoc
```

dependency 有點多，一大堆 haskell 模組。
pandoc 在把 markdown 轉成 pdf 前會某種先轉成 tex 的感覺，所以如果也熟悉 tex 的話會更上手。

## basic

一個簡單的 `.md` 檔案不需要多加什麼參數就可以直接轉成 pdf

```bash
pandoc hw.md -o hw.pdf
```

不過有幾個問題可能會遇到：
- 沒有中文字
- 旁邊留白太多
- 有些語法沒有被翻譯到，例如 `::: info :::`。
- 程式碼區塊 syntax highlighting 問題

以下就來解決以上幾個問題。

## 中文字

在 `.md` 檔案的開頭加上以下的 YAML metadata header。
```yaml
---
babel-lang: chinese-traditional
CJKmainfont: "AR PL UKai TW"
header-includes:
  - \usepackage{xeCJKfntef}
---
```

接著在 command line 指定使用 xelatex
```bash
pandoc hw.md -o hw.pdf --pdf-engine=xelatex
```
就可以讓中文字出現了！這邊我使用的字體是標楷體 `AR PL UKai TW`，在 archlinux 上的 `ttf-arphic-ukai`。

此外有遇到一個奇怪的問題，就是在刪除線裡面包含中文的話會編譯失敗，原因可能跟 latex 刪除線相關的 package 有關。
見 https://github.com/jgm/pandoc/issues/9019 。
這個問題的 workaround 我目前是使用以下的 `lua-filter`
```lua
function Strikeout(elem)
  return pandoc.RawInline('tex', [[\CJKsout{]] .. elem.content[1].text .. [[}]])
end
```

用法是把前述的 code 存成 `replace-cjk-strikeout.lua` 然後加一個參數
```bash
pandoc hw.md -o hw.pdf --lua-filter=./replace-cjk-strikeout.lua
```
> 在 pandoc 轉檔的過程中會產生語法樹，你可以使用 lua-filter 對某些特定種類的節點做修改

## 邊界問題

```yaml
---
geometry: margin=1cm
---
```
忘記從哪裡查來的了

## fenced divs

這個是在解決以下被稱為 `fenced_divs` 的語法預設不會有任何框框的問題。
```markdown
::: info
綠色背景
:::
```

使用以下的 lua-filter 幫每個這種 div 都加上一個 colorbox 就可以了。
```lua
function Div (elem)
  table = {
    info = 'cyan',
    success = 'green',
    warning = 'orange',
    danger = 'red',
  }
  color = table[ elem.classes[1] ] or 'gray'
  return {
    pandoc.RawBlock('latex', '\\begin{tcolorbox}[beforeafter skip=1cm, ignore nobreak=true, breakable, colframe=' .. color .. '!20!white, colback=' .. color .. '!8!white, boxsep=2mm, arc=0mm, boxrule=0.5mm]'),
    elem,
    pandoc.RawBlock('latex', '\\end{tcolorbox}')
  }
end
```

把以上 code 存檔成 `colored-fenced-divs.lua` 接著在使用 pandoc 時 specify 這個 lua-filter。
```bash
pandoc hw.md -o hw.pdf --lua-filter=./colored-fenced-divs.lua
```

## 程式碼區塊

預設來說，pandoc 是會幫程式碼區塊加 syntax highlight 的。
不過如果在程式碼區塊是寫「語言 + `=` + 一些東西」的話，在 HackMD 裡面可能是代表跟行號有關的意思，但在 pandoc 會導致他無法辨識出語言而沒有上 syntax highlighting。
~~~markdown
```javascript=
```
~~~

不過這也簡單，就妥協都用下面這樣就好了（~~越多妥協越簡單~~）
~~~markdown
```javascript
```
~~~

## Conclusion & Reference

HackMD flavour 的 markdown 真的是有夠多 extension，基本上不可能把每個 extension 都花力氣解決，例如 `emoji` 或是一些流程圖的 extension 我個人是完全沒有在用，這邊只是放幾個我常用而且很好解決的問題。

主要的 reference 是 stackoverflow 跟資訊之芽系統組的 docs，因為文件原始碼就是用 pandoc 把 markdown 轉 pdf，我從那邊學來了一些 YAML XD

最後，把本文所有 YAML 合在一起再加上一個 `pdfa: yes` 所得到的我常用的模板如下：

```yaml
---
babel-lang: chinese-traditional
CJKmainfont: "AR PL UKai TW"
pdfa: yes
geometry: margin=1cm
header-includes:
  - \usepackage{xeCJKfntef}
  - \usepackage[breakable]{tcolorbox}
---
```

```bash
pandoc hw.md -o hw.pdf --pdf-engine=xelatex \
    --lua-filter=./replace-cjk-strikeout.lua \
    --lua-filter=./colored-fenced-divs.lua
```

在 pandoc 的參數也可以指定另一個 `.yml` 檔案作為 metadata，不過我個人目前還是習慣直接放在 markdown 的開頭。
