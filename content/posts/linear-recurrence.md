---
title: "線性遞迴淺淺談"
date: 2021-02-13T16:28:29+08:00
draft: false
mathjax: true
tags: [template, math]
---

本篇將會介紹快速求線性遞迴數列某項的方法，以及Berlekamp-Massey演算法和一些在矩陣上的應用。
主要是一個整理資料還有學習筆記的功能，還有老實說這東西算是偏門又毒瘤，追求實用的人不要看XD。

# Fast Linear Recurrence
首先先來介紹如何快速求線性遞迴。

## 定義
> 已知序列 $ \langle a_n \rangle $ 滿足遞迴關係 $ \displaystyle \forall i \geq k, a_i = \sum _ {j=0} ^ {k-1} s _ j a _ {i-1-j} $ ，並且已經給定 $s$ 跟 $a_0, a_1, \dots, a _ {k-1}$
> 現在想要求 $ a_n $ 的值，其中 $ 1 \leq k \leq 5000, 0 \leq n \leq 10^9 $

許多人大概會很快想到矩陣快速冪，複雜度是 $ \mathcal{O}(k^3 \log n) $。但我們要更快！

## 通靈
定義一個函數 $G$，對於形式冪級數 $f(x) = \sum c_i x^i, G(f) = \sum c_i a_i$ 。
顯然$G(f \pm g) = G(f) \pm G(g)$。
根據 $s$ 構造一個多項式 $S$

$$
S(x) = x^k - \sum _ {i=0} ^ {k-1} s_i x^{k-1-i}
$$

可以發現 $G(S) = 0$，因為代進去正好是 $a_i - \sum\limits _ {j=0} ^ {k-1} s _ j a _ {i-1-j} = 0 $。
而且，平移之後也會滿足遞迴關係，所以 $G(Sx) = G(Sx^2) = \dots = 0$。
由上面兩條可以得知，對於任何多項式$f$都有$G(Sf) = 0$。

我們想求的第$n$項，正好就是$G(x^n)$，不妨取 $\displaystyle f = \lfloor \frac{x^n}{S} \rfloor$，則$G(x^n) = G(x^n - Sf) = G(x^n \mod S)$。
上述$\lfloor \frac{x^n}{S} \rfloor$ 和 $x^n \mod S$ 分別是多項式帶餘除法的商和餘數。

## 結論
證明也很快。
總而言之，只要求得$x^n \mod S$（注意這個東西的degree是$\mathcal{O}(k)$），再帶進$G$就能得到 $a_n$！
可以對$n$做類似快速冪的事情，每次算$x^{n/2} \cdot x^{n/2} \mod S$之類的，如果是mod質數的話，甚至可以利用FFT或是NTT來快速多項式帶餘除法作到總複雜度 $\mathcal{O}(k\log k \log n)$，不過超出今天的篇幅所以這邊只放$\mathcal{O}(k^2 \log n)$的寫法。
老實說$\mathcal{O}(k^2)$的$\mod S$比想像中好寫，只要從大到小不斷把$x^k$換成$ \sum\limits _ {i=0} ^{k-1} s_i x^{k-1-i}$ 就好

```cpp
template <typename T>
T fastLinearRecurrence(vector<T> a, vector<T> s, int n) {
    if (n < (int)a.size()) return a[n];
    if (s.empty()) return 0;
    // a 是前 k 項， s是遞迴關係，
    // a[i] = \sum s[j] * a[i-j-1]
    vector<T> r = {1}; // 1
    vector<T> e = {0, 1}; // x;
    auto mul = [&s](vector<T> a, vector<T> b) {
        // return a * b % (x^k - s)
        vector<T> c(a.size() + b.size() - 1);
        for (size_t i = 0; i < a.size(); i++)
            for (size_t j = 0; j < b.size(); j++)
                c[i+j] += a[i] * b[j];
        for (size_t i = c.size()-1; i >= s.size(); i--)
            for (size_t j = 0; j < s.size(); j++)
                c[i-j-1] += c[i] * s[j];
        c.resize(s.size());
        return c;
    };
    while (n) {
        if (n & 1)
            r = mul(r, e);
        e = mul(e, e);
        n >>= 1;
    }
    T sum = 0;
    for (size_t j = 0; j < r.size(); j++) sum += r[j] * a[j];
    return sum;
}
```

上面的`T`可以是`double`或是自定義的同餘算術型別。

不過這其實有點不太實用。通常這種線性遞迴數列的遞迴式基本上長度都是超小的常數，而需要交給電腦推的遞迴式通常都是形如$v _ i = A^i v _ 0$的形式，也就是說有很多個狀態要一起考慮，沒辦法想成單一變數的線性遞迴形式，矩陣快速冪的通用性還是比較高。後面也許會提到這種東西要怎麼算得比矩陣快速冪還快，不過如果$A$不是稀疏的也只是少一個$\log$而已。

# Berlekamp-Massey 演算法
這東西可神奇了，可以說是弱化版的OEIS。不過還有很多神奇的應用。
以下簡稱Berlekamp-Massey演算法為BM演算法。

## 定義
> 給定一個序列 $ a_0, a_1, \dots, a _ {n-1} $ ，請找出一個階數最小的線性遞迴關係 $ \langle s _ i \rangle $ ，
> 使得 $ \forall i \geq k, a_i = \sum\limits _ {j=0} ^ {k-1} s _ j a _ {i-1-j} $。其中 $k$ 即是此線性遞迴關係的階數。

當然，求出來的遞迴關係可能不是是唯一解，也不知道能不能對應到原本的遞迴式。
不過可以證明，如果已知遞迴式的階數最多是 $k$ 的話，只要取前 $2k$ 項求解得到一個遞迴關係之後，任何更長的前綴都會吻合該關係，也就是說該關係是整個無限數列的最短遞迴式。
證明請看2019 IOI中國國家隊論文...

## 步驟
BM演算法包含了一些迭代法跟greedy的思維。我們由短到長逐步考慮每個前綴 $[0 .. i]$ ，假如第 $i$ 個數字加進去之後和舊的遞迴關係不吻合，我們就修正該遞迴關係。一開始遞迴式 $s$ 初始化為空。
修正的部份可以分成兩個case：

1. 不是第一次修正。
    假設這次誤差叫做 $\varepsilon$ 好了，也就是 $a_i - \sum _ {j=0} ^ {k-1} s _ j a _ {i-1-j} = \varepsilon$
    因為不是第一次修正，所以設之前有一次是在加入第 $i'$ 個數字後修正的，該次修正之前的遞迴式為$s'$，誤差為 $\varepsilon'$。也就是說，$a _ {i'} - \sum _ {j=0} ^{k'-1} s' _ j a _ {i'-1-j} = \varepsilon'$
    可以發現，$\frac{\varepsilon}{\varepsilon'} (a _ x - \sum _ {j=0} ^ {k'-1} s' _ j a _ {x-1-j})$是一個僅在 $x = i'$ 是 $\varepsilon$，其他位置是 $0$ 的序列。在 $s'$ 前面補 $0$ ，使得前面的項都不會被影響到，而第 $i$ 項恰好對到 $\varepsilon$ 那一項，如此兩者相消就能讓第 $i$ 項的誤差變為 $0$ 。也就是說，如果當前的 $s$ 出錯了，我們就會把 $s$ 加上「之前某次的 $s'$ 乘上若干倍再平移」以修正該次的誤差。
    總之就是取前面算過的東西拿來消掉新加入的項的誤差啦。至於 $i'$ 的取法似乎是要讓要補的 $0$ 盡量少，最後的結果才會是最短的遞迴式。
    在下面的 code 中， `bestPos`維護的是最好的 $i'$ ； `best` 維護的是最好的 $s'$ ，取負號之後前面補 $1$ ，然後除以 $ \varepsilon' $
2. 第一次修正
    表示 $i$ 是第一個非零元素，將 $s$ 修正為 $i+1$ 個 0 ，表示前 $i+1$ 項應該會是在給定的 $k$ 項之中。
    `best` 更新成單項式 $1 / \varepsilon$

總之code雖然很簡潔，但好難懂...
複雜度是 $\mathcal{O}(n^2)$。

```cpp
template <typename T>
vector<T> BerlekampMassey(vector<T> a) {
    auto scalarProduct = [](vector<T> v, T c) {
        for (T &x: v) x *= c;
        return v;
    };
    vector<T> s, best;
    int bestPos = 0;
    for (size_t i = 0; i < a.size(); i++) {
        T error = a[i];
        for (size_t j = 0; j < s.size(); j++) error -= s[j] * a[i-1-j];
        if (error == 0) continue;
        if (s.empty()) {
            s.resize(i + 1);
            bestPos = i;
            best.push_back(1 / error);
            continue;
        }
        vector<T> fix = scalarProduct(best, error);
        fix.insert(fix.begin(), i - bestPos - 1, 0);
        if (fix.size() >= s.size()) {
            best = scalarProduct(s, - 1 / error);
            best.insert(best.begin(), 1 / error);
            bestPos = i;
            s.resize(fix.size());
        }
        for (size_t j = 0; j < fix.size(); j++)
            s[j] += fix[j];
    }
    return s;
}
```

## BM 演算法的應用！
方便起見，接下來會用SLR簡稱「最短遞迴式」。
終於來到我最想分享的部份。前面code可以直接當模板抄啦，就跟Dinic一樣神秘。 
但是重點在於怎麼活用BM演算法。BM演算法對於矩陣，尤其是稀疏矩陣的相性特別好。
這裡大部分都是IOI 2019中國國家隊的論文來的www

### 向量/矩陣的SLR
一些 $n$ 維向量 $ \\{ v_0, v_1, \dots, v _ {n-1} \\} $ 的SLR怎麼求？答案是隨機生成一個向量 $u$ 跟他做內積，改求 $ \\{ u^T v_0, u^T v_1, \dots, u^T v _ {t-1} \\} $ 的 SLR。可以證明乘上 $u$ 之後，SLR不變的機率至少是 $1 - \frac{n}{p}$ （$p$ 是模的質數）。類似的，一些 $m \times n$ 矩陣 $ \\{ A_0, A_1, \dots, A _ {t-1} \\} $ 的 SLR 求法就是生成隨機向量 $u, v$ 拿去左邊右邊乘，改求 $ \\{ u^T A_0 v, u^T A_1 v, \dots, u^T A _ {t-1} v \\} $的SLR。正確的機率似乎至少是 $1 - \frac{n+m}{p}$ 。
證明用到了一個我完全不會的 Schwartz-Zippel 引理。哪那麼衰XD

### 稀疏線性方程組
求解 $Ax = b$ 即是想得到 $x = A^{-1}b$ 。考慮 $ \\{ A^0b, A^1b, A^2b \dots, \\} $ 的SLR，可以得知
$ A^kb = \sum _ {i=0} ^ {k-1} s _ {k-1-i} A^ib $。兩邊同乘 $A^{-1}$ 並移項之後可以得出
$$
A^{-1}b = -\frac{1}{s _ {k-1}}(A^{k-1}b - \sum _ {i=1} ^ {k-1} s _ {k-1-i} A^{i-1}b)
$$
注意到 $s _ {k-1} \neq 0$，否則他就不可能是最短。
如果 $A$ 是稀疏的，裡面有 $e$ 個非零元素，那麼依序推出 $ A^0b, A^1b, \dots, A^{2n-1}b$ 就只需要 $\mathcal{O}(n(n+e))$。
IOICAMP似乎有一題可以用這個搶topcoder

### 稠密的轉移矩陣
在前面某一段有提到，轉移長度如果不是很小的常數的話，常常會寫成像是 $v_i = A^iv_0$ 的形式，其中 $A$ 是 $n$ 階方陣而 $v_i$ 是 $n$ 維向量，我們想求的是 $v_k$。
直接利用矩陣快速冪的方法是 $n^3 \log k$ 的。不過，我們只需要求出前 $2n$ 項的SLR，再利用前述的 fast linear recurrence 就能得到第 $k$ 項。（不過可能要稍微改寫一下求出$x^k \mod f$之後帶進$G$的部份）可以依序求出 $v_0, v_1, \dots, v _ {2n-1}$，複雜度 $\mathcal{O}(n^3)$，後面的fast linear recurrence複雜度大概是 $\mathcal{O}(n^2\log k)$之類的。
例題可以去試試TIOJ 1892 owo

### 矩陣的最小多項式
一個 $n\times n$ 方陣 $A$ 的最小多項式是 degree 最小的 $p$ 使得 $p(A) = 0$ 。By Cayley Hamilton theorem，特徵多項式正好也是一個多項式 $p$ 使得 $p(A) = 0$ ，所以最小多項式的 degree 至多是 $n$。
如何求？最小多項式 $p(A) = \sum c_i A^i$ ，可以發現只要求 $ \\{ A^0, A^1, A^2, \dots \\} $ 的 SLR 就能得到最小多項式。又，最小多項式至多 $n$ 項，故取前 $2n$ 項計算即可得到答案。

### 稀疏矩陣行列式
給定一個稀疏矩陣$A$想求$\det(A)$。事實上只要求得特徵方程式的常數項就可以得到行列式。
根據 wiki 上 Cayley Hamilton 定理的頁面，最小多項式是特徵多項式的因式，但他們可能不相等，不過他們的根集合是相同的，問題只是特徵多項式裡可能有重根。因此我們把$A$乘上一個隨機的對角矩陣$B$，可以證明$AB$沒有重根（特徵多項式與最小多項式相等）的機率至少是 $1 - \frac{2n^2 - n}{p}$。似乎同樣又是Schwartz-Zippel。
總之，求得 $AB$ 的特徵多項式 $p$ ，並設 $p$ 的領導係數是 $1$ （如果不是就除掉），那麼 $\det(AB)$ 就是 $(-1)^{|A|} \cdot p(0)$ 也就是 $p$ 的常數項差一個正負號。 $\det(A) = \det(AB) / \det(B)$ 就完成了。
這個是之前打BambooFoxCTF google and copy過別人的XD現在才來完整了解作法


# Reference
https://codeforces.com/blog/entry/61306
https://www.cnblogs.com/zzqsblog/p/6877339.html
https://github.com/enkerewpo/OI-Public-Library/blob/master/IOI%E4%B8%AD%E5%9B%BD%E5%9B%BD%E5%AE%B6%E5%80%99%E9%80%89%E9%98%9F%E8%AE%BA%E6%96%871999-2019/%E5%9B%BD%E5%AE%B6%E9%9B%86%E8%AE%AD%E9%98%9F2019%E8%AE%BA%E6%96%87%E9%9B%86.pdf

註：我遞迴、遞推等等用詞都搞不太清楚，不過我猜不重要吧XD
越來越毒的感覺了，該把路矯正回來喇ww
不知道會有多少人仔細看？抓typo不要鞭太用力QQ
