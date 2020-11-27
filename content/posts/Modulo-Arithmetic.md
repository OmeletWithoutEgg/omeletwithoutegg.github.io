---
title: Modulo-Arithmetic
mathjax: true
date: 2019-12-30 13:25:22
tags: [tutorial, math]
---
# 同餘算數

## 定義
$$m | (a-b) \Leftrightarrow a \equiv b \pmod m$$
或者說$a,b$同餘於$m$

## 基本性質
當一個題目要求答案模一個數字$m$時
通常我們都可以不用先算出一個很大的答案再取模
利用下面的規則能夠在計算的過程中一邊取模(加減乘不會改變等價關係)
設
$$
\left \{
\begin{matrix}
a_0 \equiv a_1 \pmod m\newline
b_0 \equiv b_1 \pmod m 
\end{matrix}
\right .
$$
則易得到
$$
\left \{
\begin{matrix}
a_0 \pm b_0 \equiv a_1 \pm b_1 \pmod m\newline
a_0b_0 \equiv a_1b_1 \pmod m
\end{matrix}
\right .
$$

## 模逆元

在一般實數的除法時，如果我們想知道除以$a$的結果，可以看成乘上倒數$1/a$
也就是說找一個$x$使得$ax = 1$
而在模$m$的情況下，我們同樣也可以用一個使得$ax \equiv 1$的$x$來代替除以$a$的運算，稱為模逆元
(如果常常打CF的話應該常常看見上面模逆元的敘述)
求取模逆元$x = a^{-1}$只要把同餘關係改寫成$ax = my+1$就可以用擴展歐幾里得求解了
注意$a,m$必須互質才會有模逆元

例: 如果要求

$$
\frac{a}{b} + \frac{c}{d} = \frac{ad+bc}{bd}
$$

由於

$$
(ab^{-1} + cd^{-1}) \cdot bd \equiv ad+bc \pmod m
$$

也就是說$ab^{-1} + cd^{-1}$是和$\frac{ad+bc}{bd}$等價的東西

## 冪次們
從$a \equiv b \pmod m$不可推出$k^a \equiv k^b \pmod m$！
不過依照歐拉定理可以化簡冪次上的東西

由歐拉定理

$$
(a, n) = 1 \Leftrightarrow a ^ {\varphi(n)} \equiv 1 \pmod n
$$

可以知道

$$
a \equiv b \pmod {\varphi(n)} \Leftrightarrow k^a \equiv k^b \pmod n
$$

假如$n$是質數的話還可以用來求模逆元
因為對質數$p$來說$\varphi(p) = p-1$，$a^{p-1} \equiv 1 \pmod p$
故$a^{-1} \equiv a^{p-2}$(注意0還是沒有模逆元)