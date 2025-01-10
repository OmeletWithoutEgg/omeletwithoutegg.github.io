---
title: "Multipoint Evaluation of Prefix Products"
date: 2025-01-09T23:10:09+08:00
draft: false
mathjax: true
tags: [tutorial, math, fft, matrix]
---

# 一次式前綴積的多點求值與推廣

## Description

給定序列 $a_1, \dots, a_N$。考慮一次式的序列 $x - a_i$，定義其第 $i$ 個前綴積為

$$
f_i(x) = \prod _ {j \leq i} (x - a_j)
$$

接著有 $Q$ 個詢問 $(u_i, v_i)$ 要你回答第 $u_i$ 個前綴積以 $x = v_i$ 代入所得到的值，即 $f_{u_i}(v_i)$。

## Solution

naive 可以做到 $\mathcal{O}(NQ)$。以下介紹一個 $\mathcal{O}((N+Q)\log^2(N+Q))$ 的離線作法。

先問一個問題：我們要怎麼快速的求出 $f_N(x)$ 這個多項式呢？如果用 $f_i(x) = f_{i-1}(x) \cdot (x - a_i)$ 每次直接 $\mathcal{O}(N)$ 乘的話，總共會花上 $\mathcal{O}(N^2)$ 的時間。然而，我們可以建出一棵平衡的二元樹，樹的葉子是這些一次式，如果按照由下到上的順序計算每個節點的小孩的乘積，並使用 FFT 等比較快的多項式乘法的話，總時間就會是 $\mathcal{O}(N\log^2N)$。這是因為使用 FFT 把兩個多項式 $f, g$ 相乘會需要 $\mathcal{O}(k\log k)$ 的時間，其中 $k=\deg (fg)$；而在這棵二元樹中每個節點所存的多項式 degree 會等於該節點的子樹裡面的葉子數量，所有節點的多項式 degree 總和又更進一步的等於每個葉子的深度和（可以想想為什麼），因此只要二元樹夠平衡，深度是 $\mathcal{O}(\log N)$ 的話，總共乘法所需的時間就會是 $\mathcal{O}(N\log ^2N)$。

接著我們來想辦法解決原本的問題。注意到 $f_{u_i}(v) = f_{u_i}(x) \mod (x - v)$，把 $v$ 代進去這個動作相當於 mod 一個一次式。

我們把有關 $u_i$ 的詢問插入到第 $u_i$ 個一次式之後，得到一個長度 $N+Q$ 的序列 $s$，裡面包含了一些一次式和詢問。

考慮兩個長度 $N+Q$ 的多項式的序列 $A_1, A_2, \dots, A_{N+Q}$ 和 $B_1, B_2, \dots, B_{N+Q}$。其中，如果 $s_i$ 是原本的一次式的話，$A_i$ 就設定為該一次式，而 $B_i$ 則為 $1$；而若 $s_i$ 是一個詢問 $(u, v)$，則把 $A_i$ 設為 $1$ 而 $B_i$ 設為 $x - v$。那麼我們最後就是想要對所有 $i$ 知道 $A_1 A_2 \cdots A_{i-1} \mod B_i$ 是多少，不妨令這個值叫 $C_i$。

令 $A_{l, r} = A_l A_{l+1}\cdots A_r$。令 $B_{l, r} = B_l B_{l+1} \cdots B_r$。令 $C_{l, r} = A_1 A_2 \dots A_{l-1} \mod (B_l B_{l+1} \cdots B_r)$。在第一段提到的二元樹上每個節點對應的 $A_{l, r}$ 和 $B_{l, r}$ 都可以直接由下往上快速算出來。並且我們可以列出 $C_{l, r}$ 由上往下的遞推式：
$$
\begin{aligned}
C_{l, m} &= C_{l, r} \mod B_{l, m} \\\\
C_{m+1, r} &= C_{l, r} \cdot A_{l, m} \mod B_{m+1, r} \\\\
\end{aligned}
$$

最後 $C_i = C_{i,i}$，葉子的 $C_{l, r}$ 就是所求的答案。因為每個節點的 $A_{l, r}, B_{l, r}, C_{l, r}$ 的 degree 都是被區間長度給 bound 住的，所以時間複雜度與第一段提到的類似都是兩個 log，但因為葉子數量不是 $N$ 而是 $N+Q$，直接代進去是 $\mathcal{O}((N+Q)\log ^2 (N+Q))$。

這裡我們也需要用到「多項式除法可以做很快」這個性質，具體來說是跟多項式乘法一樣，兩個 degree 大約是 $k$ 的多項式除法可以做到 $\mathcal{O}(k\log k)$。通常來說 ICPC 的 codebook 都應該要有這個操作。

## Examples

### Many Factorials
https://judge.yosupo.jp/problem/many_factorials

> 有 $Q$ 個詢問 $n_i$，每次要你回答 $n_i! \mod 998244353$ 的值。$Q \leq 10^5, n_i < 998244353$

<!-- 原本這題只有 $Q \leq 5$ 的弱化版。 -->

令 $M = 998244353, B \approx \sqrt{M}$。

主要可以分成對於 $i=1,2,\dots,\lfloor \frac{M}{B} \rfloor$ 求 $(iB)!$，以及對於詢問的 $n$ 求 $n \cdot (n-1) \cdots \cdot (\lfloor n/B \rfloor B+1)$ 兩部份。

前者相當於要算出 $(1 \cdot 2 \cdots (B-1) \cdot B)$、$(B+1 \cdots 2B)$ 等等，這等價於計算多項式 $x(x+1)(x+2)\dots (x+B-1)$ 在 $x=1, B+1, \dots$ 的值。可以花總共 $B\log ^2 B$ 左右的時間算出來之後，前綴積就得到 $(iB)!$ 了。

後者可以 reduce 到本次介紹的問題。$a_i = 0, 1, \dots, B-1$，而一個 $n = B \cdot \lfloor n/B \rfloor + (n\mod B)$ 則是對應到詢問 $((-n)\mod B, n)$，花費 $\mathcal{O}((B+Q)\log^2(B+Q))$ 的時間。

總共花費 $\mathcal{O}((B+Q)\log^2(B+Q))$ 的時間。

順便補充一個[小知識](https://judge.yosupo.jp/problem/stirling_number_of_the_first_kind)就是 $s_n(x) = x(x-1)\dots (x-(n-1))$ 這個多項式可以在 $\mathcal{O}(n\log n)$ 時間求得，方法是利用分治以及 Polynomial Taylor Shift，在分治時只需要往一邊的分支跑（也可以想成快速冪）。

### Many Sum of Binomial Coefficients
> 有 $Q$ 個詢問 $n_i, m_i$，每次要你回答 $\binom{n_i}{0} + \binom{n_i}{1} + \cdots + \binom{n_i}{m_i} \mod 998244353$ 的值。$Q, n_i, m_i \leq 10^5$

在本來的 setting 中 $A_i$ 都是不高於一次的多項式，而本題則推廣 $\mathbf{A}_i$ 是一個多項式矩陣。

令 $v_m = \begin{bmatrix}
    \binom{x}{m} \\\\ \sum _ {i\le m} \binom{x}{i}
\end{bmatrix}$。則，

$$
v_m = \begin{bmatrix}
    \binom{x}{m} \\\\ \sum _ {i\le m} \binom{x}{i}
\end{bmatrix}
= \begin{bmatrix}
\frac{x+m-1}{m} & 0 \\\\
\frac{x+m-1}{m} & 1
\end{bmatrix}
\begin{bmatrix}
    \binom{x}{m-1} \\\\ \sum _ {i\le m-1} \binom{x}{i}
\end{bmatrix}
= \begin{bmatrix}
\frac{x+m-1}{m} & 0 \\\\
\frac{x+m-1}{m} & 1
\end{bmatrix}
v_{m-1}
$$

不妨就令
$$
\mathbf{A}_i =
\begin{bmatrix}
\frac{x-i+1}{i} & 0 \\\\
\frac{x-i+1}{i} & 1
\end{bmatrix}
$$

則 $v_m = \mathbf{A} _ m \mathbf{A} _ {m-1} \cdots \mathbf{A} _ 1 v _ 0$，而我們最終所求的就是 $v_m$ 把 $x = n$ 代入之後的值，相當於想要求 $\left( \mathbf{A} _ m \mathbf{A} _ {m-1} \cdots \mathbf{A} _ 1 \right)(n)$。

由於 $\mathbf{A}$ 的度數很低（只有 1），可以套用類似的分治作法來做到 $\mathcal{O}((M+Q)\log^2(M+Q))$ 的時間，其中 $M = \max(m_i)$。

感性上除了矩陣應該還有其他種「上面可以放多項式，且可以快速合併又可以對多項式取模」的物件，不過目前沒有想到符合的例子跟題目。

## Reference

- https://www.mathenachia.blog/yukicoder-2166-usereditorial/#toc11
- https://maspypy.com/%E5%A4%9A%E9%A0%85%E5%BC%8F%E3%83%BB%E5%BD%A2%E5%BC%8F%E7%9A%84%E3%81%B9%E3%81%8D%E7%B4%9A%E6%95%B0-%E9%AB%98%E9%80%9F%E3%81%AB%E8%A8%88%E7%AE%97%E3%81%A7%E3%81%8D%E3%82%8B%E3%82%82%E3%81%AE#toc22
- https://github.com/yosupo06/library-checker-problems/issues/1058
- https://codeforces.com/blog/entry/138113
- https://www.cnblogs.com/zkyJuruo/p/16995141.html
