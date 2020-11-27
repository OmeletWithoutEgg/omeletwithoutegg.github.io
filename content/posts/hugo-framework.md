---
title: "Hugo Framework"
date: 2020-11-25T11:20:47+08:00
tags: [Hugo, blog]
---

# Hugo!
似乎因為casper而嘗試從hexo跳槽到hugo。
hexo似乎是對windows比較友善？檔名都一堆底線之類的
啊hugo好像是對macOS比較友善QQ

## Startup
Hugo沒有預設的theme，所以如果不想無中生有一定要裝一個theme。
我原本用的Hexo Theme Cactus在Hugo也有人維護一個theme，不過feature就沒有那麼多了。
總之試著寫一個markdown然後 `hugo server`
驚訝的發現他超快XDD應該說是Hexo太慢了，我想node.js天生本來就有一些缺點吧。
既然可以拋棄噁心的 `node_modules` 還有底線，而且還可以讓他 generate 的時間變超快，我決定試看看能不能把整個網站從Hexo改成用Hugo寫，並且同時大部份東西仍然保持跟之前相同，例如Repo、網址、code highlight、search/tag feature等等

## 一些遇到的問題
- Hard Line Break
    - 這個蠻可怕的。在用Hexo的時候沒什麼感覺，但是我的Markdown全部都是用直接換行來換行；而Hugo預設不是，也就是說他應該要用兩個空格或是反斜線的方式來換行。這其實是Markdown預設的換行方式，但是真的很不習慣，不知道該怎麼說。而且也不可能一個一個檔案調整XD
    - Solution:
    一開始查到可以在 `config.html` 裡面加
```toml
[blackfriday]
    extensions = ["hardLineBreak"]
```
    不過都沒有效。後來才知道Blackfriday是Hugo原本拿來render markdown的東西，而某次更新之後已經換成Goldmark這個套件了。
    基於我找不到怎麼在Goldmark加上 Hard Line Break 的選項，我選擇改回用Blackfriday render就好。
```toml
[markup]
    defaultMarkdownHandler = "blackfriday"
```
- 沒有search
    - Solution:
    Google了一陣子。中間找到這個使用Fuse.js的一個實作，不知道為什麼是放在討論區：https://gist.github.com/eddiewebb/735feb48f50f0ddd65ae5606a1cb41ae
    雖然蠻快找到，不過我踩了很多雷。
    首先是他寫法是 `define "footerfiles"`，但是我的theme的基底模板沒有`block "footerfiles"`的區塊。所以我目前是把那段script跟他定義的main放在一起。
    再來是mark.js，一直出現 `$(...).mark is not a function`，我也不知道為什麼用 jquery 的 mark.js 就會出事，總之我最後是把 `search.js` 換成上面連結裡面有人提出來的不帶 `jquery` 的版本。CSS直接抄原本Hexo那邊的搜尋框XD
- 各種格式不一樣(日期、TOML v.s. YAML)
    這個其實還好，很快就能看懂TOML，畢竟他是設計給人看的。vim有插件可以幫TOML syntax highlight，如果是vim的使用者要記得學習使用工具wwww
- Code highlight and copy button
    我原本highlight的主題是 `monokai-sublime`，而Hugo是用Chroma這個套件幫程式碼區塊syntax highlight。研究了好久CSS之後終於調成跟原本差不多了www有夠難wwww
    另外原本我有一個Copy按鍵可以Copy整段Code，但是Hugo跟Hexo的程式碼區塊也被render得超不一樣，所以改那部份的JS、CSS跟調整Selector花了一些時間。
- Background Animation
    我在之前就有用Canvas.js讓背景有奇怪的幾何線段，而在Hugo中要再做一遍這個太簡單了，就把code貼到可以include的地方就好。
- mathjax escape
    以為自己快做完的時候發現出大事，好幾篇的LaTeX出事了。經過一些觀察我發現是 `_` 前面沒有空格就可能會出事被解讀成粗體，還有在math裡面的 `\\` 不知道為什麼沒用。
    因為幾乎查不到Hugo或Blackfriday Mathjax的選項或是解決方法，所以我的解法是妥協，在 `_` 前後各加一個空格以示安全，而 `\\`則是換成`\newline`；希望我之後寫文章會記得。由於這些修改都是針對很多文章，因此我是用`grep`跟`sed`批次解決的。

### 小撇步
在本機測試的時候，如果只是為了 `hugo server` 就得耗掉一個terminal的視窗有點浪費，可以用 `hugo server >server.log &`來讓他在背景執行，並且使用 `fg` 把他叫回前台以讓我們停止他。
當然如果是用GUI文字編輯器就沒什麼差了XD

## Travis CI
So hard
不過這東西有點真香
總之就是不用弄髒自己的電腦去安裝build、deploy需要的套件，而且可以讓你的整個專案管理變得很簡單。
參考BB的寫法，想辦法把 `.travis.yml` 弄好之後，看起來他的deploy流程是這樣：

> 有兩個分支，master存md、js、css、html模板等local會存的東西、gh-pages存龐大的靜態檔案。
> 每次遇到master的commit，就嘗試把master build出來的東西塞到gh-pages這個分支，並讓gh-pages作為githug pages。

然後我驚訝的發現這樣我的github repo就變得超乾淨XDD真香
我大概 build 失敗了 10 次才穩定成功@@，中間都是在把從BB那邊抄過來的 `.travis.yml` 調整成新版本中官方建議的寫法，還有各種玩git：搬運repo或是fork、submodule等等，感覺好像稍微對git熟悉了一點。

Travis CI可以有更客製化的Build跟Deploy選項，基本上得自己寫script。
我還有看到BB他們會把Travis CI拿來編譯LaTeX，也就是說本機上為了編譯龐大的Codebook裝一大堆套件絕對不是最好的選擇。

## TODO: 
- [x] search result只有一個？ (Bug, fixed)
- [x] syntax highlight style (OK)
- [x] Copy code button (OK)
- [x] Background Animation (OK)
- [x] Travis CI deploy (Finally done)

## 測試
> This is nobody speaking.

**BOLD**, *italic*, ***ITALIC BOLD***

This is $\LARGE{\text{inline math text}}$.
$$
\text{Display Math with } \LaTeX. \,
I_n =
\left[\begin{matrix}
1 &  & \dots & & 0 \newline
  & \ddots & & &   \newline
\vdots  & & 1 & & \vdots  \newline
  & & & \ddots &   \newline
0 & & \dots & & 1 \newline
\end{matrix}\right]
$$

```python
arr = [int(t) for t in input().split()]
print([x**2 for x in arr])
```

```cpp
#include <bits/stdc++.h>
#define safe std::cerr << __PRETTY_FUNCTION__ << " line " << __LINE__ << " safe\n"
using namespace std;
signed main() {
    safe;
    int a, b;
    cin >> a >> b;
    cout << a + b << '\n';
}
```
