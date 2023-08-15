---
title: "關於凸函數的 (min, +) 捲積"
date: 2023-08-15T17:22:59+08:00
draft: false
mathjax: true
tags: [dp-optimization, greedy, adhoc]
---

# $(\min, +)$ convolution: convex-arbitrary

因為最近打 ICPC WF 的題目遇到這個東西，所以想來寫一篇部落格。如果怕被暴雷題目的自己小心。
先放兩個 yosupo library checker 的模板題連結。
https://judge.yosupo.jp/problem/min_plus_convolution_convex_convex
https://judge.yosupo.jp/problem/min_plus_convolution_convex_arbitrary

## Description
兩個序列 $a_0,a_1,\dots,a_n$ 和 $b_0, b_1, \dots, b_n$ 的 $(\min,+)$ 捲積是一個序列 $c_0,c_1,\dots,c_{2n}$ 滿足
$$
c_k = \min_{i+j=k} (a_i + b_j)
$$

對於一般的這個問題，目前似乎沒有任何 $O(n^{2 - \epsilon})$ 的演算法 ($\epsilon > 0$)

不過如果 $a, b$ 兩個序列都是凸的話，就可以很輕鬆的求出 $c$ 序列。
更一般的，只要 $a$ 是凸的，就算 $b$ 不是凸的也可以快速在 $O(n\log n)$ 求出 $c$ 序列。

一個序列 $x_0, x_1,\dots, x_n$ 是凸的如果他的差分遞增，即 $x_{i+1}-x_i \leq x_{i+2}-x_{i+1}$。
可以想像如果把 $x_i$ 表示要拿 $i$ 個物品的成本，那 $x_i$ 是凸的就代表拿越多東西會因為邊際效應單位成本會越來越貴的感覺。

## Solution
$a, b$ 都是凸的 case 很單純，首先 $c_0=a_0+b_0$，然後 $a, b$ 的差分都由小到大排序好了，我們把他們直接像 merge sort 裡面那樣 merge 就可以得到 $c$ 的差分了。這也是在說 $c$ 也會是一個凸的序列。
證明很簡單所以允許我跳過。

接下來是只有 $a$ 是凸的而 $b$ 的不是的情況。
以結論來說就是轉移點單調，$k$ 遞增的時候最好的 $b_i$ index 也會遞增，即

$$
\operatorname{argmin}_ \limits i(b_i+a_{k-i}) \leq \operatorname{argmin}_ \limits i(b_i+a_{k+1-i})
$$

注意這邊的 $\operatorname{argmin}$ 如果有多個最小值我們取最小的 index $i$。

### 證明

令
$\operatorname{argmin}_ \limits i(b_i+a_{k-i}) = x$
$\operatorname{argmin}_ \limits i(b_i+a_{k+1-i}) = y$
設 $x>y$
明顯 $x, y$ 都不大於 $k$。
$$
\left\\{
\begin{matrix}
b_x+a_{k-x} & < & b_y+a_{k-y} \\\\
b_y+a_{k+1-y} &\leq& b_x + a_{k+1-x} \\\\
\end{matrix}
\right.
\implies
\left\\{
\begin{matrix}
b_x - b_y & < & a_{k-y} - a_{k-x} \\\\
b_x - b_y &\geq& a_{k+1-y} - a_{k+1-x} \\\\
\end{matrix}
\right.
$$

但由凸性可以知道 $a_{k-y} - a_{k-x} \leq a_{k+1-y} - a_{k+1-x}$，所以矛盾，$x$ 必須 $\leq y$。

### 演算法
對 $k$ 分治應該是最單純的。假設目前要求解 $k \in [kl, kr]$ 的答案，並且我們已經知道他們的轉移點只會來自 $[il, ir]$，
那麼我們問出 $km=\lfloor \frac{kl+kr}{2} \rfloor$ 的轉移來源 $i_{opt}$ 之後，我們就可以知道 $[kl, km-1]$ 的轉移來源只會來自 $[il, i_{opt}]$；$[km+1, kr]$ 的轉移來源只會來自 $[i_{opt}, ir]$。

設區間 $[kl, kr]$ 的長度是 $x$，$[il, ir]$ 的長度是 $y$ 的話，時間複雜度的遞迴式子就是

$$
T(x, y) = T(x/2, a) + T(x/2, b) + O(y), \text{where } a + b = y+1
$$
解出來應該是 $T(x, y) = O(x + y\log x)$

<!--
assume O(y) term is c2 * y
c1*(floor(x/2) + a * log(floor(x/2)))
c1*(ceil(c/2)  + b * log(ceil(c/2)))
+ c2 * y
<= c1 * x + y * (log(x)+1+c2)
-->

用 SMAWK 可以作到線性的樣子。

## AC code

其實轉移點單調分治優化通常都很好寫，只是要搞清楚有單調性的是什麼東西。
很容易想像出一個 case 是最佳解隨著 $k$ 遞增時，在 $a_i$ 選的元素的 index 會一直上升又下降。

```cpp
// An AC a day keeps the doctor away.
#include <bits/stdc++.h>
using namespace std;

signed main() {
    cin.tie(nullptr) -> sync_with_stdio(false);
    int n, m;
    cin >> n >> m;
    vector<int> a(n), b(m);
    for (int i = 0; i < n; i++)
        cin >> a[i];
    for (int j = 0; j < m; j++)
        cin >> b[j];
    vector<int> c(n + m - 1);

    const auto dc = [&](auto self, int l, int r, int jl, int jr) {
        if (l > r) return;
        int mid = (l + r) / 2;
        int best = numeric_limits<int>::max();
        int from = -1;
        for (int j = jl; j <= jr; j++) {
            int i = mid - j;
            if (i < 0 || i >= n) continue;
            if (best > a[i] + b[j]) {
                best = a[i] + b[j];
                from = j;
            }
        }
        c[mid] = best;
        self(self, l, mid-1, jl, from);
        self(self, mid+1, r, from, jr);
    };
    dc(dc, 0, n-1+m-1, 0, m-1);

    for (int i = 0; i < n+m-1; i++)
        cout << c[i] << (i+1==n+m-1 ? '\n' : ' ');
}
```

這是模板題的 code 就是了

## 例題

結果我找不到那題，只記得很類似 TIOJ 奧步戰術這題但要對所有 $k$ 輸出。
https://tioj.ck.tp.edu.tw/problems/1318

> 有 $N$ 個題目，每個題目最高得兩分。一開始每題得分都是零，把第 $i$ 個題目從零分變成一分需要花 $a_i$ 的時間，把第 $i$ 個題目從一分變成兩分需要花 $b_i$ 的時間。當然，不能直接跳到兩分，也就是說拿 $b_i$ 之前必須要拿 $a_i$。保證 $a_i, b_i > 0$。
> 對於每個 $0 \leq k \leq 2N$ 的 $k$ 請輸出總得分 $k$ 分需要至少花多少時間。

$k$ 固定的話，可以按照 $b_i$ 排序，必定是一個前綴取 $a_i$ 一個後綴取 $a_i+b_i$。
所以可能可以慢慢掃用一個資料結構裡面放所有前綴的 $a_i$ 和 後綴的 $a_i+b_i$，接著每次查第 $k$ 大（後綴的人名次要佔兩名）。
不過沿著這個思路很難做到對所有 $k$ 輸出答案。

把題目分成兩類，一類是 $a_i \leq b_i$，另一類是 $a_i > b_i$。
設 $f_x$ 是從第一類的題目中得 $x$ 分所需要花的最小總時間。可以發現 $f_x$ 是凸的，基本上最佳策略就是把 $a_i, b_i$ 混在一起 sort 之後從小拿到大。
另外一種想法是 $f_x$ 就是把一堆長度 $2$ 的凸序列捲積在一起，所以他自然也是凸的。
所以如果我們能快速求出 $g_y$ 代表在第二類題目中得 $y$ 分所需要的最少時間，那我們就可以在 $O(n\log n)$ 做 $f$ 和 $g$ 的 $(\min, +)$ 捲積去得到最終的答案。

觀察可以發現，在第二類題目當中得 $y$ 分的最佳解當中最多只會有一個題目是得恰好一分的，不然如果有兩個，那不如改成寫其中一題兩分的。
所以對於偶數的 $y = 2t$，一定是拿滿前 $t$ 小的 $a_i+b_i$。
對於 $y=2t+1$，可以知道如果拿掉那個得恰一分的題目，剩下的也是拿前 $t$ 小的 $a_i+b_i$。所以按照 $a_i+b_i$ 排的話，$y=2t+1$ 的最佳解可能是「前 $t$ 小的 $a_i+b_i$ 加上後面 $N-t$ 個題目當中 $a_i$ 最小的」或是「前 $t+1$ 小的 $a_i+b_i$ 去掉前 $t+1$ 個題目當中 $b_i$ 最大的」。

## 結

最近幾天一直在跟 Voronoi Diagram 玩以及耍廢，感覺有點太混了（？
