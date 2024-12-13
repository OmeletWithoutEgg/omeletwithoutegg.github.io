---
title: "Aliens DP 備忘錄"
date: 2024-10-05T23:20:59+08:00
draft: false
mathjax: true
tags: [dp, dp-optimization, tutorial]
---

# Aliens trick 的一些事實列舉與說明

本文主要基於 <https://noshi91.hatenablog.com/entry/2023/11/20/052227> 撰寫。

## Description

令 $X = \mathbb{Z} \cap [L, R]$ 為一非空集合。
考慮下凸函數 $f : X \to \mathbb{Z}$（註：即 $f(x) - f(x - 1) \leq f(x + 1) - f(x)$，可以用 U 型來想像）。
令 $g: \mathbb{R} \to \mathbb{R}, g(p) = \min _ {x \in X}(f(x) + px)$，代表 penalty 為 p 時算出的最佳解。

在以前大家學過的 Aliens trick 當中的設定會是特定的 $f(k)$ 很難算（例如郵局設置問題中設置 $k$ 個郵局的最小花費）而 $g(p)$ 比較好算（例如郵局設置問題中每個郵局多花 $p$ 的最佳解），我們需要二分搜出恰當的 penalty，使得取到最佳解的 $x$ 恰好是 $k$，或至少介在小於 $k$ 和大於 $k$ 之間的分界點。
在二分搜的判定中，會需要計算 $x_p^\* \in \textrm{argmin} _ {x\in X}(f(x) + px)$（註：本文中 argmin 的定義會採用集合版本的），也就是在目前的 penalty 底下的最佳解當中 $x$ 是取值多少，或者可以說是被罰了幾個 penalty。這件事在 tie-breaking 的時候會變得比較麻煩，若 $f(x) + px$ 在多個 $x$ 都可以取到最小值，則我們會需要取最小的這種 $x$（也可以取最大的，但細節會稍微改變）；若無法算出最小的 $x$ 的話就無法直接以此作為二分搜的判定。本文目的為介紹一個不需要還原 $x_p^\*$ 的一個 Aliens trick 寫法。

## Facts

方便起見，定義 $\nabla f(x) = f(x) - f(x - 1)$ 和 $\Delta f(x) = f(x + 1) - f(x)$，分別為 $f$ 的後向差分和前向差分。作為特例，若 $x-1 \not\in X$ 則定義 $\nabla f(x) = -\infty$；類似地，若 $x+1\not \in X$ 則定義 $\Delta f(x) = \infty$。$f$ 的凸性又可以寫成 $\nabla f(x) \leq \Delta f(x)$。

1. $g$ 是上凸函數。
2. 強對偶性：事實上，$f(k) = \max _ {p\in I} (g(p) - pk)$。畫重點！
    其中，$I$ 必須是足夠大的 compact set（不懂的話可以想像 $I$ 就是區間）。足夠大指的是 $[-\Delta f(k), -\nabla f(k)]$ 和 $I$ 的交集非空。以後知道上下界要取多少了！
3. $\textrm{argmin} _ {x \in X}(f(x) + px) = \mathbb{Z} \cap [l_p, r_p]$ 是一個區間。
4. 對於所有整數的 $p$，$l_p$ 和 $r_p$ 就是 $g(p + 1) - g(p)$ 和 $g(p) - g(p - 1)$。
5. 對於所有非整數的 $p$，$l_p = r_p = \frac{g(p) - g(\lfloor p \rfloor)}{p - \lfloor p \rfloor} = \frac{g(\lceil p \rceil) - g(p)}{\lceil p \rceil - p}$，即 $g$ 在每個整數段呈線性。
這是因為 $f$ 的值域是整數而有的特性。

## Explanation

1 和 2 是兩個相關的較有用的事實。由於 $g(p)$ 和 $-kp$ 兩個（對 $p$ 的）上凸函數的和仍是上凸函數，尋找 $g(p) - pk$ 的最大值可以用三分搜、對差分二分搜，或是黃金比例搜來計算。使用強對偶性，便不需要還原 $x_p^\*$ 也可以在 $\mathcal{O}(\log C)$ 次求解 $g(p)$ 的時間以內計算 $f(k)$。
Aliens trick 的上下界也是件需要小心的事情，根據本文中的證明，上下界的範圍只要包含 $f$ 在 $k$ 兩旁的差分的相反數，就可以得到答案。

3, 4, 5 的定位比較接近幾個和 $g$ 有關的小知識，主要是幫助理解和想像 $f$ 與 $g$ 函數的關係。
額外的，由 5 我們可以知道我們如果選擇非整數的 $p$ 則 $\textrm{argmin} _ {x \in X}(f(x)+px)$ 是一元集合，所以例如用 $n + 0.5$ 或是 $n + \epsilon$ 等想法去搜就一定會有一個唯一的 $x_p^\*$，不過這其實幾乎等價於用某種權重在處理 tie-breaking 就是了。

### g 是上凸函數

對於所有 $\alpha + \beta = 1, \alpha \geq 0, \beta \geq 0$，
$$
\begin{align*}
g(\alpha a + \beta b)
& = \min _ {x\in X}\left[f(x) + (\alpha a + \beta b) x\right] \\\\
& = \min _ {x\in X}\left[(\alpha + \beta) f(x) + (\alpha a + \beta b) x\right] \\\\
& = \min _ {x\in X}\left[\alpha(f(x) + ax) + \beta(f(x) + bx)\right] \\\\
& \geq \alpha \min _ {x\in X} (f(x) + ax) + \beta \min _ {x\in X}(f(x) + bx) \\\\
& = \alpha g(a) + \beta g(b)
\end{align*}
$$

$g$ 因此也是連續的。

### 強對偶性

弱的對偶性較易證明。固定一特定的 $k \in X$，對於所有 $p$，根據定義我們有
$$g(p) = \min _ {x\in X} (f(x) + px) \leq f(k) + pk$$
所以便得到弱對偶性 $f(k) \geq \max _ {p\in I} (g(p) - pk)$。弱對偶性在 $f$ 非凸的時候也是正確的。

> 引理 0：給定 $k \in X, p \in \mathbb{R}$，若 $p \in [-\Delta f(k), -\nabla f(k)]$，則 $k \in \textrm{argmin} _ {x\in X}(f(x) + px)$。

證明：移項得 $\nabla f(k) \leq -p \leq \Delta f(k)$。若 $x > k$ 則 $f(x) - f(k)$ 可以寫成 $\sum _ {i=k} ^ {x-1} \Delta f(i)$，又由 $f$ 的凸性可以知道每一項都大於等於 $\Delta f(k)$，所以總和會大於等於 $(x - k) \cdot (-p)$，因此 $f(x) - f(k) \geq (x - k) (-p)$ 移項得到 $f(k) + p k \leq f(x) + p x$。$x < k$ 部份證明類似。

由 $f$ 的凸性以及對 $I$ 的限制，存在一個 $p^\*$ 同時屬於 $I$ 以及引理 0 中提到的區間。由前述引理可以推出
$$
\begin{align*}
f(k)
& = (f(k) + p^\* k) - p^\* k \\\\
& = \min _ {x\in X} (f(x) + p^\*x) - p^\*k \\\\
& = g(p^\*) - p^\* k \\\\
& \leq  \max _ {p\in I} (g(p) - pk)
\end{align*}
$$
因此與弱對偶性合在一起便得到強對偶性 $f(k) = \max _ {p\in I} (g(p) - pk)$。因為 $I$ compact 且 $g$ 是連續的所以等號右側的 $\max$ 是 well-defined。

引理 0 的逆命題也是對的，如下：

> 引理 1：給定 $k\in X, p\in\mathbb{R}$，若 $k \in \textrm{argmin} _ {x\in X}(f(x) + px)$，則 $p \in [-\Delta f(k), -\nabla f(k)]$。

證明：對於右界部份，若 $k - 1 \in X$，則 $f(k - 1) + p\cdot (k - 1) \geq f(k) + pk$ 移項得到 $p \leq -\nabla f(k)$。若 $k - 1 \not\in X$ 則顯然 $p \leq \infty$。左界部份證明類似。

### 取得最小值的 $x$ 是一段區間

注意到 $f(x) + px$ 仍是下凸函數，因此對於所有 $a < b < c$，若 $f(x) + px$ 在 $a, c$ 都可以取得最小值，由凸性可以得知 $b$ 點也會取得最小值。當然，取得最小值的 $x$ 們也不會是空集合，但有可能是退化成恰好一個點的情形。

### 以 g 表示區間的左右界

直覺上，$\textrm{argmin} _ {x\in X}(f(x) + px)$ 就是拿著斜率是 $-p$ 的直線去緊貼著 $f$ 的時候，剛好貼在那條直線上的那些位置。因為 $f$ 是下凸函數，所以剛好貼住的位置是一個區間，隨著 $p$ 變大，這個區間會跟著往左移動，且 $p$ 變大時這個區間和之前的區間最多只會有端點部份重合。以下是較嚴謹的證明。

> 引理 2：若 $k \in \textrm{argmin} _ {x\in X}(f(x) + px)$ 則 $g(p + 1) - g(p) \leq k \leq g(p) - g(p - 1)$。

證明：首先 $g(p) = f(k) + pk$。 由 $g(p + 1)$ 以及 $g(p - 1)$ 的最小性，我們有
$$
\begin{cases}
g(p + 1) = \min _ {x\in X}(f(x) + (p + 1) x) \leq f(k) + (p + 1) k = g(p) + k \\\\
g(p - 1) = \min _ {x\in X}(f(x) + (p - 1) x) \leq f(k) + (p - 1) k = g(p) - k
\end{cases}
$$
移項得證。

接著來證明，若 $p$ 是整數，左邊的等號可以成立。不妨假設 $x_p^\*$ 是 $\textrm{argmin} _ {x\in X}(f(x) + px)$ 中最小的元素。由引理 2 我們已經知道 $g(p + 1) - g(p) \leq x_p^\*$。

對於所有 $\hat{x} < x_p^\*$，由 $x_p^\*$ 的最小性我們有 $f(\hat{x}) + p\hat{x} > f(x_p^\*) + px_p^\*$。特別地，若選定 $\hat{x} = x_p^\* - 1$ 可以得到 $\nabla f(x_p^\*) < -p$。移項得到 $-\nabla f(x_p^\*) > p$。由於 $f$ 的值域和 $p$ 都是整數，這可以改寫為 $-\nabla f(x_p^\*) \geq p + 1$。

由引理 1 有 $p \in [-\Delta f(x_p^\*), -\nabla f(x_p^\*)]$，所以實際上 $p + 1$ 也在這個區間當中，由引理 0 可以知道 $x_p^\* \in \textrm{argmin} _ {x\in X}(f(x) + (p + 1)x)$。然而由引理 2，我們又可以得到 $x_p^\* \leq g(p + 1) - g(p)$。所以實際上 $x_p^\* = g(p + 1) - g(p)$，最小的元素確實就是 $g(p + 1) - g(p)$。右邊的等號證明類似。

### 整數段呈線性

和前一段的直覺一樣，拿著斜率是 $-p$ 的直線去盡量緊貼 $f$，而因為 $f$ 取值皆為整數，我們可以知道只有在 $p$ 也是整數的時候才會貼到 $f$ 的一段線段上；若 $p$ 不是整數，則緊貼在 $f$ 上的結果會是恰好只有一個點可以緊貼在直線上。這時，若 $p$ 稍微改變一點點，那麼除非 $p$ 變成整數了，否則緊貼到的點並不會變化，因此 $g(p)$ 的增加也是線性的。

令 $x_p^\* \in \textrm{argmin}_{x\in X}(f(x) + px)$。
由引理 1 得知 $-\Delta f(x_p^\*) \leq p \leq -\nabla f(x_p^\*)$。
由於 $f$ 的值域是整數，$-\Delta f(x_p^\*)$ 和 $-\nabla f(x_p^\*)$ 也都是整數。若 $p$ 不是整數，則可以進一步得到
$$
-\Delta f(x_p^\*) \leq \lfloor p \rfloor < p < \lceil p \rceil \leq -\nabla f(x_p^\*)
$$

再應用引理 0，可以得知
$$
\begin{cases}
x_p^\* & \in \textrm{argmin} _ {x\in X}(f(x) + \lfloor p \rfloor x) \\\\
x_p^\* & \in \textrm{argmin} _ {x\in X}(f(x) + \lceil p \rceil x) \\\\
\end{cases}
$$

必然地
$$
\begin{cases}
g(\lfloor p \rfloor) &= f(x_p^\*) + \lfloor p \rfloor x_p^\* \\\\
g(p) &= f(x_p^\*) + p x_p^\* \\\\
g(\lceil p \rceil) &= f(x_p^\*) + \lceil p \rceil x_p^\* \\\\
\end{cases}
$$

故線性性質得證。

順便可以證明，若 $p$ 不是整數，則 $|\textrm{argmin} _ {x\in X}(f(x) + px)| = 1$。
由於 $\textrm{argmin} _ {x\in X}(f(x) + px)$ 是一段區間，若沒有退化成一個點的話，一定可以找到 $x_p^\*$ 使得 $x_p^\*$ 和 $x_p^\*+1$ 都取到最小值，即
$$
g(p) = f(x_p^\*) + px_p^\* = f(x_p^\* + 1) + p \cdot (x_p^\* + 1)
$$
然而這代表 $f(x_p^\*+1)-f(x_p^\*) = p \not\in \mathbb{Z}$，與 $f$ 的值域是整數矛盾。所以最小值的位置是唯一的。


## Comparison & Examples

| 方法              | 優點                                                 | 缺點                                   |
|-------------------|------------------------------------------------------|----------------------------------------|
| 還原 penalty 次數 | 容易理解，且只需要 $\log_2 C$ 次求解 $g(p)$          | 需要多維護次數且需要小心 tie-breaking  |
| 對差分二分搜      | 比三分搜快，也很好寫                                 | 需要 $2\log_2 C$ 次的求解 $g(p)$       |
| 三分搜            | 浮點數的情況是一個折衷好選擇                         | 需要約 $3.41 \log_2 C$ 次的求解 $g(p)$ |
| 黃金比例搜        | 後三者中最快的，僅需約 $1.44 \log_2 C$ 次求解 $g(p)$ | 實做較複雜，若要當場實做較困難         |

- [TIOJ 1986 | 郵局設置問題 $\infty$ EXTREME](https://tioj.ck.tp.edu.tw/problems/1986)
  - hint: 這題除了 Aliens 還需要另外一個優化，而且時間其實頗緊所以不一定能用本文的方法
- [CF 739E | Gosha is hunting](https://codeforces.com/problemset/problem/739/E)
  - hint: 這題的值域不是整數而是浮點數，因此有些小性質會不一樣，且不能用對差分二分搜。
- [TIOJ 1727 | 限制特定點度數的最小生成樹](https://tioj.ck.tp.edu.tw/problems/1727)
- [洛谷 P2619 | k-白邊最小生成樹](https://www.luogu.com.cn/problem/P2619)
  - hint: 這題實際上是前一題的 generalization

## References

- <https://noshi91.hatenablog.com/entry/2023/11/20/052227>
- <https://noshi91.github.io/algorithm-encyclopedia/d-edge-shortest-path-monge>
- <https://en.wikipedia.org/wiki/Fenchel%E2%80%93Moreau_theorem>
- <https://zh.wikipedia.org/zh-tw/%E5%B7%AE%E5%88%86>
- <https://twifor.github.io/2021/01/16/%E6%B5%85%E8%B0%88wqs%E4%BA%8C%E5%88%86/>
- <https://taodaling.github.io/blog/2020/07/31/WQS%E4%BA%8C%E5%88%86/>
- <https://www.doc88.com/p-949564862405.html>

## 加註
本來這篇文章想說會短短的，但想說要好好證明一些事情結果就不小心放太多又臭又長的證明了，捨不得刪掉。而且因為懶惰所以引入好多符號，然後正負號選擇也讓有些定理的敘述變得非常不優美，可惜了。
儘管如此這邊的證明還是看起來東缺西漏的，總覺得應該有更簡潔的一勞永逸的方法才對。
若有錯誤歡迎指出。
