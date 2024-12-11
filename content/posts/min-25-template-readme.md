---
title: "min 25 模板使用說明"
date: 2024-12-10T21:29:00+08:00
draft: false
mathjax: true
tags: [math, number-theory, codebook]
---

# min 25 模板使用說明

前幾個月（WF 之前）忘記為什麼就想去學 min25 篩，然後就把他模版化放進 codebook 裡了。我是看 https://oi-wiki.org/math/number-theory/min-25/ 學的，不過本文不會提到太多細節。

先貼上 code：

```cpp
template <typename U, typename V> struct min25 {
  lld n; int sq;
  vector<U> Ss, Sl, Spre; vector<V> Rs, Rl;
  Sieve sv; vector<lld> quo;
  U &S(lld d) { return d < sq ? Ss[d] : Sl[n / d]; }
  V &R(lld d) { return d < sq ? Rs[d] : Rl[n / d]; }
  min25(lld n_) : n(n_), sq((int)sqrt(n) + 1),
    Ss(sq), Sl(sq), Spre(sq), Rs(sq), Rl(sq), sv(sq) {
    for (lld i = 1, Q; i <= n; i = n / Q + 1)
      quo.push_back(Q = n / i);
  }
  U F_prime(auto &&f, auto &&F) {
    for (lld p : sv.primes) Spre[p] = f(p);
    for (int i = 1; i < sq; i++) Spre[i] += Spre[i - 1];
    for (lld i : quo) S(i) = F(i) - F(1);
    for (lld p : sv.primes)
      for (lld i : quo) {
        if (p * p > i) break;
        S(i) -= f(p) * (S(i / p) - Spre[p - 1]);
      }
    return S(n);
  } // F_prime: \sum _ {p is prime, p <= n} f(p)
  V F_comp(auto &&g, auto &&h) {
    for (lld i : quo) R(i) = h(S(i));
    for (lld p : sv.primes | views::reverse)
      for (lld i : quo) {
        if (p * p > i) break;
        lld prod = p;
        for (int c = 1; prod * p <= i; ++c, prod *= p) {
          R(i) += g(p, c) * (R(i / prod) - h(Spre[p]));
          R(i) += g(p, c + 1);
        }
      }
    return R(n);
  } // F_comp: \sum _ {2 <= i <= n} g(i)
}; // O(n^{3/4} / log n)
```

如果去看我們 [codebook 的連結](https://github.com/1011cychien/R-12-forked-codebook/blob/master/codes/Math/Min25Sieve.cpp) 會看到還有一串中文的註解，以下大概就是仔細的講那一串中文的註解然後隨機補充一些東西。

## Description

這個模板要解決的問題簡單來說就是有一個積性函數 $g$，計算 $\sum _ {i \leq n} g(i)$。因為是積性函數，所以只要給定質數冪的值，即 $g(p^c)$，就可以對所有正整數定義 $g$ 的值。然而為了快速計算 $g$ 還必須滿足一些條件，在學 min25 篩時常常會看到「質數點 $p$ 必須是一個低階多項式」，不過其實可以更一般化。使用這個模板時必須要構造兩個 type $U, V$ 以及函數 $f, h$ 滿足以下條件：

1. $U, V$ 都是環，即在上面可以定義加法、乘法，加法可交換且有反元素（可以做減法），乘法對加法有分配律。
2. 要求 $f: \mathbb{N} \to U$ 是完全積性，即 $\forall a, b \in\mathbb{N}, f(ab) = f(a)f(b)$。
3. $f$ 的前綴和 $F(i) = \sum _ {j \leq i} f(i)$ 可以快速求值。
4. 對於質數 $p$，$g(p) = h(f(p))$。
5. $h: U \to V$ 是一個加法上的同態，即 $h(u_1 + u_2) = h(u_1) + h(u_2)$。
6. 給定 $p, c$ 之後，$g(p^c)$ 可以快速求值。

呼叫 `F_prime` 會對所有 $x \in D_n = \\{\lfloor \frac{n}{i} \rfloor | i=1,2,\dots,n \\}$ 計算 $S(x) = \sum _ {p \text{ is prime}, p \leq x} f(p)$。請注意 $F(x) = \sum _ {i \leq x} f(i)$，和 $S$ 不同。
呼叫 `F_comp` 會對所有 $x \in D_n$ 計算 $R(x) = \sum _ {2 \leq i \leq x} g(i)$。函數回傳的值就是 $R(n)$，也就是最一開始求的值。注意這個值不會把 $g(1)$ 算進去。

以下舉幾個例題說明。

### sum of totient function
大家很熟悉的積性函數 $\varphi(n)$。對於質數冪，$\varphi(p^c) = p^{c-1}(p-1)$，特別的，對於質數 $p$ 有 $\varphi(p) = p - 1$。這滿足所謂低階多項式的條件。讓我們構造一下 $f$

$$
\begin{cases}
f(n) &= (1, n) \\\\
h((s_0, s_1)) &= s_1 - s_0
\end{cases}
$$

其中，$U = \mathbb{Z}^2$ 上的加法跟乘法分別都定義成逐項加跟逐項乘，即 $(a, b) + (c, d) = (a + c, b + d)$ 跟 $(a, b) \cdot (c, d) = (ac, bd)$。可以驗證對於質數 $p$，$h(f(p)) = h((1, p)) = p - 1 = \varphi(p)$。

在 $g(p) = \sum a_i p^i$ 的時候，$U$ 的構造基本上就是一個 tuple 維護 $n^0, n^1, n^2, \dots$，而 $\text{id}_k: n\mapsto n^k$ 正是完全積性並且前綴和很好算的函數。$h$ 則就是把這些冪次用 $a_i$ 線性組合得到 $g$。

### sum of multiplicative function

和 sum of totient function 幾乎一樣，只是 $h$ 乘的系數稍微改一下。稍微放一點片段

```cpp
    min25<Pair, Mint> m(N);
    m.F_prime([](Mint p) -> Pair {
      return {1, p};
    }, [](Mint n) -> Pair {
      return {n, n * (n + 1) / 2};
    });

    Mint ans = 1 + m.F_comp([&](Mint p, Mint e) -> Mint {
      return a * e + b * p;
    }, [&](Pair v) -> Mint {
      return a * v[0] + b * v[1];
    });
```

其中 `Pair` 是一個定義了加法乘法減法等等的 struct，也可以直接用 `std::valarray` 代替，但可能會跑比較慢。

可以看 [這個 submission](https://judge.yosupo.jp/submission/255567) 或是 [另一個 submission](https://judge.yosupo.jp/submission/246709)。

### counting primes
可以只呼叫 `F_prime` 得到質數的個數，此時 $f(n) = 1$ 以及 $F(n) = n$。
可見 https://judge.yosupo.jp/submission/255568 。

### LOJ #6053. 简单的函数
https://loj.ac/p/6053

本題的 $g(p^c) = p \oplus c$。因為質數除了 $2$ 以外都是奇數，所以 $g(p) = p - 1$，除了 $g(2) = 3$。其中一個構造如下：

$$
\begin{cases}
f(n) &= (1, n, [n \text{ is odd}]) \\\\
h((s_0, s_1, s_{parity})) &= s_1 + s_0 - 2 s_{parity}
\end{cases}
$$

注意到 $n \mapsto [n \text{ is odd}]$ 也是一個完全積性函數，並且其前綴和很好計算：介在 $[1, n]$ 的奇數數量正好就是 $\lceil \frac{n}{2} \rceil$。這裡 $U = \mathbb{Z}^3$ 並且類似的定義加法乘法。


### QOJ # 9867. Flowers
這是在 3rd ucup kunming 遇到的題目。原題有一些包裝，但總之就是要計算 $\prod _ {i \leq n} \omega(i)$，其中 $\omega(i)$ 是 $i$ 有幾種相異的質因數。因為 $n\leq 10^{11}$，用 python 打一下可以知道 $\omega(i) \leq 10$。

因為相異質因數個數很小，可以打算對於所有 $k = 1,\dots,10$ 計算有幾個 $i$ 使得 $\omega(i) = k$ 之後再快速冪計算原題要求的答案。為了數有幾個相異質因數，構造 $V = \mathbb{Z}[x]$ 為多項式，而 $g(p^c) = x$，這樣當 $i$ 有 $k$ 個相異質因數，$g(i)$ 就會等於 $x^k$，而 $\sum _ {2\leq i \leq n} g(i)$ 就是我們想要統計的東西。

接著想要構造一個前綴和很好算的 $f$ 使得在質數點 $f$ 和 $g$ 可以通過 $h$ 轉換。從 $\sum  _ {p\in\mathbb{P} _ {\leq n}} g(p) = \pi(n) x$ 可以看出（hint: $\sum _ {p\in\mathbb{P} _ {\leq n}} g(p) = \sum _ {p\in\mathbb{P} _ {\leq n}} h(f(p)) = h\left( \sum _ {p\in\mathbb{P} _ {\leq n}} f(p) \right)$，不限於此題）在 `F_prime` 階段要計算的大概就會是質數數量，不妨構造 $f(n) = 1$ 以及 $h(s) = sx$。

<!-- 最後，要輸出的答案便是 $\prod \limits _ {1 \leq k \leq 10} k ^ {[x^k] R(n)}$ -->

因為 $\omega(i) \leq 10$，所以本題的多項式 degree 也小於等於 $10$，因此我的實做是直接暴力 $10\times 10$ 寫乘法，但實際上也可以用 NTT，或甚至在一開始任選 11 個數字，然後在 min25 篩計算他們帶入多項式的點值的和，最後再用拉格朗日插值或高斯消去等方法得出答案的多項式，不過嫌麻煩就沒有把這個 10 壓掉也是過了。

---

另外一點我想提的是 `F_comp` 有另外一個寫法是用 top-down dfs 甚至不記憶化 的寫法去計算，應該是 OI-wiki 上的所謂 $\mathcal{O}(n^{1-\varepsilon})$ 的作法，大概跟 `F_comp` 想做的事情差不多。把 `F_comp` 滾動掉的那個維度 explicit 的寫出來就會變成下面這樣：

```cpp
  V F_comp_dfs(auto &&g, auto &&h) {
    auto dfs = [&](auto &&self, size_t k, lld x) -> V {
      V ans = h(S(x));
      for (size_t i = k; i < sv.primes.size(); i++) {
        const lld p = sv.primes[i];
        if (p * p > x) break;
        lld prod = p;
        for (int c = 1; prod * p <= x; ++c, prod *= p) {
          ans += g(p, c) * (self(self, i + 1, x / prod) - h(Spre[p]));
          ans += g(p, c + 1);
        }
      }
      return ans;
    };
    return dfs(dfs, 0, n);
  }
```

節錄自 [這個 submission](https://judge.yosupo.jp/submission/255124)。本文的這個 $\mathcal{O}(n^{\frac{3}{4}} \log ^{-1} n)$ 複雜度好像會在中國被分類成洲閣篩？而 dfs 的寫法才被叫做 min25 篩。複雜度雖然是 $\mathcal{O}(n^{1-\varepsilon})$ 但在競程範圍內算是蠻快的，如果 `F_comp` 特別慢的題目，例如 QOJ 那題，會有顯著加速。

## Time Complexity

$\mathcal{O}(n^{\frac{3}{4}} / \log n)$。從程式碼裡面就可以看出來（注意到 `quo` 是從大到小枚舉） `F_prime` 的複雜度是

$$
\sum _ {p \text{ is prime}, p \leq \sqrt{n}} \sum _ {x \in D_n} [p^2 \leq x]
= \sum _ {x\in D_n} \pi(\sqrt{x})
\leq \sum _ {i^2 \leq n} \pi(\sqrt{i}) + \sum _ {i^2 \leq n} \pi(\sqrt{\frac{n}{i}})
\approx \sum _ {i^2 \leq n} \frac{\sqrt{i}}{\ln{\sqrt{i}}} + \sum _ {i^2 \leq n} \frac{\sqrt{\frac{n}{i}}}{\ln{\sqrt{\frac{n}{i}}}}
$$

後續就懶得證了。應該可以在隨意的 $n^c$ 切一刀，一半把分母當成 $1$ 積分也只會是 $O(n^{\frac{3}{4}-\varepsilon})$，另一半則是可以把 $\ln(\cdots)$ 當成 $\log(n)$ 的常數倍。`F_comp` 的複雜度應該也可以證明是一樣的。

空間跟 $D_n$ 集合的大小一樣是 $\mathcal{O}(\sqrt{n})$。

## Caveats

這份程式碼並沒有直接要求 $U, V$ 的加法單位元和乘法單位元（$0, 1$），但都預設空的 vector 會是 $0$，並且因為 $f, g$ 是積性的，定義上應該要滿足 $f(1) = 1_U, g(1) = 1_V$。

另外，完全積性函數這個條件，我懷疑其實也是可以拿掉的。在第一階段（`F_prime`）我們會把包含小質數的數字全部扣掉，這相當於是跟 $f^{-1}$ 做捲積，而當 $f$ 是完全積性函數，inverse 會非常好算：$f_p^{-1}(x) = 1 - f(p)x$（見[貝爾級數](https://zh.wikipedia.org/wiki/%E8%B2%9D%E7%88%BE%E7%B4%9A%E6%95%B8)），若 $f$ 不是完全積性的，inverse 要花點力氣算。不過，我們仍然會需要構造一個前綴和很好算的積性函數 $f$，這是這個演算法的大前提。把完全積性的條件改掉之後可能常數會差一點，而且當初寫的時候沒有想這麼多。

這份程式碼如果 $f,g,h,F$ 都是 $\mathcal{O}(1)$ 的話，大概可以跑 $10^{10}$ 到 $10^{11}$。因為據說有 $\tilde{\mathcal{O}}(\sqrt{N})$ 的演算法了所以就去翻了一堆文章，還是連同樣條件下的 $\mathcal{O}(n^{\frac{2}{3}} \log^{-1}n)$ 的版本也寫不出來。去翻 library checker 的各種 top coder 好像也都是 $\tilde{\mathcal{O}}(n^{\frac{2}{3}})$ 的複雜度的。只有再次學會了杜教篩，寫了一個帶 template 的模板過了 [sum_of_totient_function](https://judge.yosupo.jp/submission/255414)，但跟本文的模板比也只是 192ms 跟 397ms 的差距而已。
