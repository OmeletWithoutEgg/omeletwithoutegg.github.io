---
title: "jngen"
date: 2021-01-24T01:17:43+08:00
draft: false
mathjax: true
tags: [template, experience, cpp]
---

# jngen
最近在生107北市賽題目的測資想放到TIOJ上面，其中一題是關於找兩個凸包的兩條內公切線交點。
因為不太知道測資怎麼生，又想到之前東東有提過jngen這個東西，因此就把他拿來生成我需要的凸包了。
我覺得他的函式、方法都很乾淨，然後因為生測資仔細看了一下文件，就想說把他貼到部落格推廣一下（X

# Usage
https://github.com/ifsmirnov/jngen

要使用jngen，你只需要[下載jngen.h](https://raw.githubusercontent.com/ifsmirnov/jngen/master/jngen.h)並引用標頭檔。下載來的標頭檔可以放在 `/usr/include` 之類的地方，或是跟你的C++原始碼相同目錄當中。

```cpp
#include "jngen.h"
#include <iostream>

using std::cout, std::endl;

int main(int argc, char *argv[]) {
    registerGen(argc, argv);
    parseArgs(argc, argv);
    int n, m;
    getPositional(n, m);

    Tree t = Tree::bamboo(n).link(n - 1, Tree::star(m), 0);
    if (getOpt("shuffled", false)) {
        t.shuffle();
    }

    cout << t.printN().add1() << endl;
}
```

下面只會挑這次有用到的主題帶過一些函數，我這次完全沒用到字串、圖論、數學的函式庫。

## Random
jngen跟testlib一樣會使用你執行時傳入的參數做一些hash之類的當作偽隨機的種子，所以如果不是每次呼叫main都用不同參數呼叫，就得乾脆把一個種子在一個generator裡面重複利用。
記得在main裡面呼叫`registerGen(argc, argv)`。

### rnd
`rnd`是一個全域物件，可以呼叫`rnd.next(l, r)`之類的方法來取得隨機數字。這些方法大部分跟testlib相容。

- `rnd.next(int n)` 生成 $[0, n)$ 的隨機數字
- `rnd.next(int l, int r)` 生成$[l, r]$的隨機數字
- `rnd.nextf()` 生成$[0, 1)$的隨機浮點數
- `rnd.wnext(int n, int w)`、`rnd.wnext(int l, int r, int w)` 在$w > 0$的時候會取$w$次隨機的結果取$\max$，在$w < 0$的時候則是取$\min$。
- `rnd.nextp(int n, [RandomPairTraits])`、
    `rnd.nextp(int l, int r, [RandomPairTraits])` 回傳一個pair，兩個數字都介在範圍之內。`RandomPairTraits`是可選參數，像是
    - opair: ordered pair，保證`first <= second`
    - dpair: distinct pair，保證`first != second`
    - odpair, dopair: 保證`first < second`

## Option
跟testlib一樣，他也提供了command-line執行參數的parser。

```cpp
// ./main 10 -pi=3.14 20 -hw hello-world randomseedstring
int main(int argc, char *argv[]) {
    parseArgs(argc, argv);
    int n, m;
    double pi;
    string hw;

    n = getOpt(0); // n = 10
    pi = getOpt("pi"); // pi = 3.14

    n = getOpt(5, 100); // n = 100 as there is no option #5
    pi = getOpt("PI", 3.1415); // pi = 3.1415 as there is no option "PI"

    getPositional(n, m); // n = 10, m = 20
    getNamed(hw, pi); // hw = "hello-world", pi = 3.14

    cout << (int)getOpt("none", 10) << endl; // 10 as there is no "none" option
}
```

呃...沒什麼好說的，一看就懂。如果出了什麼錯誤會報錯，例如找不到這個選項而且沒有預設值，或是轉型出問題。

## Array
這好嗎？這很好。
Array是包裝過後的`std::vector`，重載了輸入輸出的運算子，讓我們不再需要重複撰寫 `cout << a[i] << " \n"[i+1==n]` 這種程式碼。並且，他在輸出的時候可以簡單的增加選項，例如印出陣列長度或是shuffle、sort、reverse、unique等等，都快變成python了。
有頗多方法，首先是生成隨機Array的方法。

- `Array::id(size_t n)`和iota類似回傳依序包含0~n-1的Array。
- `Array::random(size_t n, Args ...args)`回傳每個元素各自以rnd用args參數隨機生成的一個Array。
- `Array::randomUnique(size_t n, Args ...args)` 和前者類似，但回傳元素完全不相異的Array。注意如果生成失敗會throw錯誤。
- `Array::randomf(size_t n, Func func, Args ...args)`回傳每個元素各自以func用args參數生成的一個Array。

接著是型別為Array的變數或是暫時變數後面可以加的一些方法，有點像是形容詞之類的，作者叫output modifier（？）
以下假設該變數叫`a`

- `a.shuffle()`、`a.shuffled()` 前者shuffle自己並回傳reference，後者回傳一個shuffle過的物件。
- `a.sort()`、`a.sorted()`、 `a.unique()`、`a.uniqued()`、 `a.reverse()`、`a.reversed()` 可以類推。
- `a.inverse()` 回傳一個排列的inverse。如果該陣列不是一個排列會throw錯誤。
- `a.choice()`、`a.choice(size_t count)` 隨機取出一個或 `count` 個元素。
- `a.printN()` 印出陣列大小。
- `a.add1()` 把陣列內容+1，在0-base轉1-base有用。
- `a.endl()` 原本每項之間是以空白分隔改為以換行分隔。

還有用`+`、`+=`可以串接Array，`*`、`*=`會重複原本的內容數次，跟python的list有點像。
此外，一樣可以存取begin、end然後用想要的STL做事情。


```cpp
void gen(int n, int c) {
	auto p = Array::id(n).shuffled();
	auto a = Array::random(n, c);
	cout << p.printN() << '\n' << a << '\n';
}
```

## Geometry
`rndg`也是一個全域物件，提供生成幾何物件的方法。
主要分成三大類函數：生成一個隨機點、生成一個隨機凸多邊形、生成$n$個三點不共線的點

- `rndg.point(long long C)`、
`rndg.point(long long min, long long max)`、
`rndg.point(long long x1, long long y1, long long x2, long long y2)` 回傳範圍內隨機的一個整數點，型別是Point。
- `rndg.pointf` 跟 `rndg.point` 類似但回傳浮點數型態的。
- `Point` 型別可以做加減法、內外積（`*`跟`%`運算子）、純量積、字典序比大小、比較是否等於

- `rndg.convexPolygon(int n, long long C)`、
`rndg.convexPolygon(int n, long long min, long long max)`、
`rndg.convexPolygon(int n, long long x1, long long y1, long long x2, long long y2)` 回傳每個點都在範圍內的整數點隨機多邊形。型別是Polygon。
- `Polygon`基本上是繼承一個Point的Array，並且有`shift(), shifted()`方法可以平移整個多邊形，或是`reflect(), reflected()`方法對原點鏡射。

- `rndg.pointsInGeneralPosition(int n, long long C)`、
`rndg.pointsInGeneralPosition(int n, long long min, long long max)`、
`rndg.pointsInGeneralPosition(int n, long long x1, long long y1, long long x2, long long y2)` 回傳$n$個點使得沒有任兩點相同且任三點不共線。複雜度$\mathcal{O}(n^2\log n)$。型別是`TArray<Point>`

## Drawer
拿來畫svg檔案的。沒有一個全域物件，必須自己宣告`Drawer d`。

- `d.point()` 畫點。可以填Point物件，pair或是兩個int
- `d.circle()` 畫圓，最後一個參數是半徑。可以填Point物件，pair或是兩個int
- `d.segment()` 畫線段。可以填兩個Point、兩個pair或是四個int
- `d.polygon()` 畫多邊形。注意他只是連續的線段，所以順序要自己弄好。可以傳Polygon物件，`vector<Point>`，`vector<pair>`等等
- `d.dumpSvg("image.svg")` 把這個畫布上面的東西存到image.svg裡面

# 感想
引用別人的模板真的讓自己的程式碼乾淨很多
像是整理成[這樣](https://github.com/OmeletWithoutEgg/CompetitiveProgramming/tree/master/probs/107TPE/queen)就感覺到一種先進感，也感覺終於稍微活用shell script。
之前原本是用shell script管理整個生測資的流程，後來覺得既然要寫for迴圈為什麼不乾脆放在C++裡面，就搞得像是把C++當成腳本語言在寫。現在這樣分成好幾個資料夾並且用script管理他們的編譯、執行感覺就乾淨多多！

本來是想說這根本完美懶人出題標頭檔吧？
後來出到最後一題才發現有些應該要有東西還是得自己寫QQ
像是隨機的二維陣列吧，或是zip兩個陣列之後變成pair的陣列吧，這些功能都沒有qwq
（更新：隨機的二維陣列其實有很乾淨的寫法）

```cpp
// generates n*m 2d array
Array2d a = Array2d::randomf(n, [&](){ return Array::random(m, maxc); });
```

寫這篇的時候又再查了怎麼生成凸包，發現stackoverflow有一個更正道的作法而不是jngen這樣用橢圓唬爛（？）不過都不知道他們生成的效果怎麼樣，反正我猜北市賽測資不會好到哪裡去啦XD

這篇其實沒有很完整，畢竟他的feature很多，要把整篇document翻完等有空再說吧www而且作者似乎也停更ㄌQQ
