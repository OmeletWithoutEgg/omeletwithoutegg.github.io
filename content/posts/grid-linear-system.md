---
title: "求解二維網格圖上的線性方程組：關鍵變數法"
date: 2025-02-01T02:47:28+08:00
draft: false
mathjax: true
tags: [linear-algebra, matrix]
---

# 關鍵變數法

## Description

上個例題 https://codeforces.com/problemset/problem/963/E

有一個人在二維網格圖上隨機上下左右走，一開始在原點 $(0, 0)$，每秒有 $p_1, p_2, p_3, p_4$ 的機率分別往上下左右走一格，問期望幾秒會走到跟原點距離超過 $r$ 的點？答案模 $10^9+7$。$p_i = a_i/\sum a_i$ 而 $1 \leq a_i \leq 1000$。

## Solution

令 $f(i, j)$ 代表期望走幾步會停下來，則邊界的 $f(i, j) = 0$，而對於內部的 $f(i, j)$ 則有

$$
f(i, j) = 1 + p_1 f(i - 1, j) + p_2 f(i + 1, j) + p_3 f(i, j - 1) + p_4 f(i, j + 1)
$$

因為變數之間依賴的關係有環所以不能簡單的用 DP 求解。高斯消去要花 $\mathcal{O}(n^3)$ 的時間求解，其中 $n$ 是變數數量，也就是大約 $\pi r^3$ 個，所以總共是 $\mathcal{O}(r^6)$。官解是利用類似 band matrix 的性質做到 $\mathcal{O}(r^4)$。

但其實可以做更好！圓內部的格子點共有 $\mathcal{O}(r)$ 個橫排，我們令每個橫排最左邊的變數是關鍵變數 $x_1, x_2, \dots, x_k$，則每個變數都可以表示成關鍵變數的線性組合，方法是利用以下等式

$$
f(i, j + 1) = \frac{1}{p_4} \left( f(i, j) - 1 - p_1 f(i - 1, j) + p_2 f(i + 1, j) + p_3 f(i, j - 1) \right)
$$

等式右邊每個 $f$ 都是 $k$ 個關鍵變數的某個線性組合，因此推出來的等式左邊也是 $k$ 個關鍵變數的線性組合。可以自然的從左往右推出每個位置，每個位置會花 $\mathcal{O}(r)$ 計算，而位置的數量是 $\mathcal{O}(r^2)$，總共只要花 $\mathcal{O}(r^3)$ 就可以計算出每個位置怎麼用關鍵變數表示。一路推到右邊的邊界之後就會得到 $\mathcal{O}(r)$ 個等式，這樣我們就只要求解一個長跟寬都是 $\mathcal{O}(r)$ 的矩陣了。直接高斯消去就是 $\mathcal{O}(r^3)$。

![](/images/grid-linear-system/circle.png)

## Generalization

IOIC 某天某一題也是這種在二維網格圖上 markov chain 的題（不過不是上下左右動而是在類似三角形的 lattice 上動？$\mathbb{Z}[e^{\frac{2\pi i}{3}}]$ 之類的？），官解一樣給的是 band matrix 的解法。一樣可以令三角形內部最靠邊界的一排當作關鍵變數，就可以在 $\mathcal{O}(r^3)$ 求解了，其中 $r$ 是三角形邊長。

![](/images/grid-linear-system/triangle.png)

這個方法意外的很難推廣？若網格當中存在障礙物或是有邊權為 $0$ 的情況，我們就沒辦法往右推出那個變數，需要把那個變數當作新的關鍵變數。

去查了一下還能不能做更好，查到 refernce 那兩篇（一篇又是 tarjan）。
對於（允許障礙物、邊權為 0 的）網格圖可以用 nested disection 花 $\mathcal{O}(N^{3/2})$ 得到一個只有 $\mathcal{O}(N\log N)$ 個非零元素的矩陣分解，其中 $N$ 是總變數數量；而 tarjan 又加強這個結果到任何有好的 separator 的圖，在任何一般的平面圖上因為有 [Planar separator theorem](https://en.wikipedia.org/wiki/Planar_separator_theorem) 應該可以做得跟上述複雜度一樣好。反正查一查應該沒有查到本文中寫的方法，本文中應該只是一個足夠簡單到可以在競程比賽當中推出來的一個 trick 而已。

## Reference
- https://www.cnblogs.com/p-b-p-b/p/10849869.html
    此文中稱為主元法，但用主元法當關鍵字真的很難找到資料。
- https://epubs.siam.org/doi/10.1137/0710032 
- https://epubs.siam.org/doi/10.1137/0716027 
