---
title: "Barrett Reduction & Montgomery Multiplication"
date: 2025-07-22T22:08:42+08:00
draft: false
mathjax: true
tags: [tutorial, math, number-theory]
---

# Barrett Reduction 與 Montgomery Multiplication


[^table]: 從 [uops.info](https://uops.info/table.html) 抓來的 Icelake 架構的 latency 與 throughput。因為 fusion、out-of-order execution、pipeline 等等的存在，單一指令的效率很難用一個數字衡量，所以僅供參考。發現除法實際上沒那麼慢（？）
| instruction | latency | cycles per instruction | description | URL                                                                                                                        |
|-------------|---------|------------------------|-------------|----------------------------------------------------------------------------------------------------------------------------|
| ADD/SUB     | 1       | 0.25                   | 加減法      | [ADD](https://uops.info/table.html?search=ADD&cb_lat=on&cb_tp=on&cb_ICL=on&cb_doc=on&cb_base=on)                           |
| SHR         | 1       | 0.5 ~ 1.0              | 右移        | [SHR](https://uops.info/table.html?search=SHR&cb_lat=on&cb_tp=on&cb_ICL=on&cb_measurements=on&cb_base=on)                  |
| MUL/IMUL    | 3 ~ 8   | 1.0                    | 乘法        | [MUL/IMUL](https://uops.info/table.html?search=MUL&cb_lat=on&cb_tp=on&cb_ICL=on&cb_measurements=on&cb_base=on&checkbox=on) |
| DIV/IDIV    | 10 ~ 18 | 2.0 ~ 10.0             | 除法        | [DIV/IDIV](https://uops.info/table.html?search=DIV&cb_lat=on&cb_tp=on&cb_ICL=on&cb_measurements=on&cb_base=on&checkbox=on) |

對競程有點經驗的人應該都要知道除法是一個很慢[^table]的操作。
不過，如果是除以 $2^k$ 的話就很簡單了，只要一個 shift 操作就能完成。
Barrett reduction 和 Montgomery multiplication 分別用了不一樣的方法，給定一個正整數 $M$，針對 $M$ 做一些預處理之後，我們可以不用任何除法指令，只用較少的乘法、加減法與 shift 來完成「兩個數字相乘之後模 $M$」的操作。

## 記號的定義

- 對於兩個整數 $u, v$，$u \equiv v \pmod M$ 的意思是 $(u - v)$ 是 $M$ 的倍數。
- 對於整數 $u$，$u \bmod M$ 是使得 $u\equiv v \pmod M$ 且 $v \in [0, M)$ 的唯一的 $v$。
- $[l, r)$ 指的是 $l \leq x < r$ 的所有整數 $x$。
- 對於一個實數 $z$，$\lfloor z \rfloor, \lceil z \rceil, \lfloor z \rceil$ 分別是向下取整、向上取整、四捨五入的意思。

下文假設我們預先知道 $M$，而當要計算 $a \cdot b \bmod M$ 之前都先算好完整的乘積 $x = a \cdot b$，其中 $0 \leq a, b < M$ 而 $0 \leq x < M^2$。可以想像 $M = 998244353$，於是 $a, b, M$ 可以用一個 `int32_t` 存，而 $x$ 必須要用 64 個 bit，也就是 `int64_t`。

## Barrett reduction

要計算 $x \bmod M$，可以先計算 $q = \lfloor x / M \rfloor$ 之後計算 $r = x - q \cdot M$。

但這樣計算 $q$ 我們也需要一次除法指令。試著用一個分數 $\frac{d}{R}$ 來近似 $\frac{1}{M}$，其中限制 $R$ 是一個 $2$ 的冪次 [^0]，因為現代的 CPU 一般使用二進位儲存數字，除以 $2$ 的冪次再取整是一個不用除法指令也可以很快做到的操作。

[^0]: 在手算的時候我們通常是用十進位，所以 $R$ 也可以取 $10$ 的冪次

於是與其計算 $q$，我們改計算
$$
\tilde{q} = \left\lfloor \frac{x \cdot d}{R} \right\rfloor
$$

如果 $d$ 恰好等於 $R / M$ 的話那麼 $\frac{d}{R} = \frac{1}{M}$，完全沒有誤差，但 $d$ 需要是個整數，所以一般會取 $\lfloor R / M \rfloor$ 或 $\lceil R / M \rceil$。因為我們事先知道 $M$，所以 $d$ 的值可以預處理。

### 誤差分析

設 $\frac{d}{R} = \frac{1}{M} + \varepsilon$，則
$$
\tilde{q} = \left\lfloor x \cdot \frac{d}{R} \right\rfloor =
\left\lfloor x \cdot \left(\frac{1}{M} + \varepsilon\right) \right\rfloor =
\left\lfloor \frac{x}{M} + x \cdot \varepsilon \right\rfloor
$$

如果取 $d = \lfloor R / M \rfloor$ 且取 $R$ 夠大使得 $x < R$，那麼 $\varepsilon = \frac{\lfloor R / M \rfloor - (R / M)}{R}$，因此

$$
\begin{cases}
-1 < \lfloor R / M \rfloor - (R / M) \leq 0
\newline
0 \leq \frac{x}{R} < 1
\end{cases}
\implies -1 < x \cdot \varepsilon \leq 0
$$

所以我們用近似算出來的 $\tilde{q}$ 和正確值 $q$ 至多差 $1$，也就是說 $\tilde{q}$ 一定是 $q$ 或 $q - 1$。因此，$(x - \tilde{q} \cdot M)$ 的範圍是 $[0, 2M)$，我們需要在最後做一次 conditional subtraction [^1] 來校正餘數到 $[0, M)$。如果 $M$ 大約是 1e9 量級的話，那麼 $R$ 取 $2^{64}$ 便足夠保證 $x < M^2 < R$ 了。以下是一段範例程式碼 [^2]。

[^1]: conditional subtration 是指 `r >= M ? r - M : r`。丟上 godbolt.org 測試的結果是通常會被編譯成 `sub` 加上 `cmov`。

[^2]: 這裡寫 `-1ULL / t_M` 而不是 `(u128(1) << 64) / t_M`，但兩者有差的情形應該只有 `t_M` 是 $2$ 的冪次的時候，而那樣的情況 $q, \tilde{q}$ 的差距是 $1$，一個 conditional subtraction 仍然足夠。如果寫 `(u128(1) << 64) / t_M` 的話，$M = 1$ 時 $d = 2^{64}$ 就沒辦法用 `uint64_t` 存了。

```cpp
struct Barrett {
  using u32 = uint32_t;
  using u64 = uint64_t;
  using u128 = __uint128_t;
  u32 M;
  u64 d; // R := 2^{64}; d := floor(R / M)
  Barrett(u32 t_M) : M(t_M), d(-1ULL / t_M) {}
  u32 reduce(u64 x) const { // x % M
    // we need a 128-bit multiplication here to calculate q
    u64 q = (u128(d) * x) >> 64;
    u64 r = x - q * M;
    return r >= M ? r - M : r;
  }
};
```

### 取更大的 $R$: 精準除法

再次注意到
$$
\tilde{q} = \left\lfloor \frac{x}{M} + x \cdot \varepsilon\right\rfloor
$$
如果我們可以保證 $0 \leq x \cdot \varepsilon < \frac{1}{M}$ 的話，那麼因為加上一個小於 $\frac{1}{M}$ 的正數不會改變向下取整的值，所以 $\tilde{q}$ 就會是完全精確的，不需要最後的 conditional subtraction。

改取 $d = \lceil R / M \rceil$ 可以使 $\varepsilon \geq 0$，將 $R$ 取到更大可以使得 $x \cdot \varepsilon < \frac{1}{M}$。然而要注意如果 $R$ 取太大的話，64-bit register 會裝不下 $d$。

### 編譯器會幫你做？

如果模的數字是一個編譯期就能確定的常數，那麼 GCC 事實上就會幫我們把除法指令優化成乘法加上 shift。我們來觀察一下以下這段簡單的程式碼丟到 <https://godbolt.org> 上選擇 `x86-64 GCC 15.1` 開啟 `-O2` 選項編出來的結果：

```cpp
#include <cstdint>

const uint32_t mod = 998244353;

uint32_t modmul(uint32_t a, uint32_t b) {
    return static_cast<uint32_t>(1ULL * a * b % mod);
}
```

```asm
modmul(unsigned int, unsigned int):
        movabs  rax, -8525806094425994177
        mov     esi, esi
        mov     edi, edi
        imul    rdi, rsi
        mul     rdi
        mov     eax, edi
        shr     rdx, 29
        imul    rdx, rdx, 998244353
        sub     eax, edx
        ret
```

以上這段組合語言可以解釋為取 $M = 998244353, R = 2^{93}, d = \lceil R / M \rceil$ 做 barrett reduction，$29$ 這個數字的來由是 $93 - 64 = 29$，因為 x86-64 的 `mul` 指令會把乘出來的 128-bit 乘積的上下 64-bit 分開放在兩個 register，所以直接取上半部就等於已經右移 64-bit 了。不過編譯器在這邊採用的策略應該更加複雜一點，尤其是 conditional subtraction 基本上不會出現。以下是我找到的一些資料。

- <https://stackoverflow.com/questions/41183935/why-does-gcc-use-multiplication-by-a-strange-number-in-implementing-integer-divi>
- <https://homepage.divms.uiowa.edu/~jones/bcd/divide.html>

因為編譯器做得蠻不錯的，所以 Barrett Reduction 的使用場景比較會是在 $M$ 是執行期才知道的數，而不是編譯時就知道的常數。

### Signed 與 Unsigned

世界上存在兩種流派，一種是把 $x \bmod M$ 的值域限制在 $[0, M)$，另一種則是限制在 $[-M/2, M/2)$。前者稱為 unsigned 而後者稱為 signed。前述的 Barrett reduction 以及程式碼都是 unsigned 派的，而如果是 signed 版本的話，可以把 floor 改成 round，也就是改算 $\tilde{q} = \left\lfloor (x \cdot d) / R \right\rceil$。除了把最外層的 floor 改成 round 或者把 $d$ 從 floor 改取 ceil 之類的改動以外，比較一般化的表述可以看[英文維基百科](https://en.wikipedia.org/wiki/Barrett_reduction)。

---

## Montgomery Multiplication

Montgomery multiplication 的思路則跟 Barrett reduction 不太一樣。比起計算 $x \bmod M$，我們來計算 $x \cdot R^{-1} \bmod M$ 吧！其中 $R^{-1}$ 是 $R$ 在 $\mathbb{Z} _ M$ 下的模逆元。

如果我們可以找到一個 $\ell$ 使得 $x + \ell \cdot M \equiv 0 \pmod R$ 的話，那麼
$$
y = \frac{x + \ell \cdot M}{R}
$$
就會是一個整數。也就是說，我們直接（在整數或者實數上）除以 $R$ 就可以得到 $y$。不難驗證 $y \equiv x \cdot R^{-1} \pmod M$。

$\ell$ 要怎麼找呢？移項一下得到 $\ell \cdot M \equiv -x \pmod R$，不妨取 $\ell = x \cdot (-M^{-1}) \bmod R$，其中 $M^{-1}$ 指的是在 $\mathbb{Z} _ R$ 下的模逆元。雖然算模逆元需要花一些功夫，不過 $(-M^{-1}) \bmod R$ 可以在預處理時計算。

接著來證明一下 $y$ 夠小。如果 $R$ 取得夠大使得 $x < MR$ 的話，則 $\frac{x}{R} < M$；同時 $\frac{\ell}{R} < 1$，所以
$$
y = \frac{x + \ell \cdot M}{R} = \frac{x}{R} + \frac{\ell}{R} \cdot M < M + M < 2M
$$

因此，若我們事先得到 $M$ 之後做好預處理，那麼計算 $x \cdot R^{-1} \bmod M$ 只需要一次乘法、一次 $\bmod R$ 的乘法、一次加法、一次除以 $R$，以及一個 conditional subtraction。

### 如何用 $\textrm{redc}(x)$ 湊出乘法取模運算

定義函數 $\textrm{redc}: [0, MR) \to [0, M); x \mapsto \left(x \cdot R^{-1} \bmod M\right)$。我們已經知道怎麼快速計算 $\textrm{redc}$ 了。

在 $0 \leq a, b < M$ 的前提下，我們要怎麼用 $\textrm{redc}$ 計算 $a \cdot b \bmod M$ 呢？

注意到若 $c \equiv a \cdot b \pmod M$，則 $cR \equiv (aR) \cdot (bR) \cdot R^{-1} \pmod M$。也就是說，
$$
\textrm{redc}((aR \bmod M) \cdot (bR \bmod M)) = (cR \bmod M)
$$

這時候就可以引入「Montgomery form」的概念（也有人叫 Montgomery domain）。方便起見令函數 $f(x) = xR \bmod M$。一個數字 $x$ 的 Montgomery form 就是 $f(x)$，而

$$
a \cdot b \bmod M = f^{-1}(\textrm{redc}(f(a) \cdot f(b)))
$$

也就是說，模 $M$ 下的乘法等於是先把 $a, b$ 都轉成 Montgomery form 之後做 `redc`，再從 Montgomery form 轉回真正的答案。而 $f$ 以及 $f^{-1}$ 的計算事實上也可以由 $\textrm{redc}$ 湊出來。
$$
\begin{cases}
f(x) &=& \textrm{redc}(x \cdot (R^2 \bmod M))
\newline
f^{-1}(x) &=& \textrm{redc}(x)
\end{cases}
$$
其中 $R^2 \bmod M$ 可以預處理。注意以上述方法計算 $f(x)$ 時需要保證 $x < R$。

如果每次做乘法取模都把數字轉成 Montgomery form、$\textrm{redc}$ 之後再轉回來，那麼通常不會省下太多時間。通常來說，進行連續的乘法時 Montgomery Multiplication 會更有優勢（例如：快速冪、NTT 等等），因為我們只需要在最初與最後做 Montgomery form 的轉換。

注意到，把兩個數字各自的的 Montgomery 的相加減會等於先做相加減之後再轉成 Montgomery form，也就是
$$
\left(f(a) \pm f(b)\right) \bmod M = f((a \pm b) \bmod M)
$$
所以算加減法不需要牽涉到 Montgomery form 的轉換。

### 缺點

Montgomery multiplication 一個很大的缺點就是需要 $R, M$ 互質，因為需要計算 $M^{-1}$，而且需要 $R^{-1}$ 的存在。通常來說 $R$ 會挑選 $2$ 的冪次，所以 $M$ 就只能是奇數。

以下是一段參考實作，針對 32-bit 以下的 $M$ 我們取 $R = 2^{32}$ 便足夠了。裡面計算 $M^{-1} \bmod R$ 的方法是使用 Hensel lifting，在此省略不談。

```cpp
struct Mont { // Montgomery multiplication
  using u32 = uint32_t;
  using u64 = uint64_t;
  constexpr static int W = 32, logW = 5;
  u32 mod, neg_minv, R1, R2;
  Mont(u32 t_mod) : mod(t_mod) {
    assert(mod % 2 == 1);
    neg_minv = 1;
    for (int j = 0; j < logW; j++)
      neg_minv *= 2 - neg_minv * mod;
    assert(u32(neg_minv * mod) == 1);
    neg_minv = -neg_minv;
    const u64 R = (u64(1) << W) % mod;
    R1 = static_cast<u32>(R);
    R2 = static_cast<u32>(R * R % mod);
  }
  u32 redc(u32 a, u32 b) const {
    u64 x = u64(a) * b;
    u32 l = u32(x) * neg_minv;
    u32 y = (x + u64(l) * mod) >> W;
    return y >= mod ? y - mod : y;
  }
  u32 from(u32 x) const { return redc(x, R2); }
  u32 get(u32 a) const { return redc(a, 1); }
  u32 one() const { return R1; }
};
```

### mulhi 的加速

有些CPU 架構存在類似這樣的指令：$\textrm{mulhi}(\cdot, \cdot)$ 取兩個 $w$-bit 的整數的乘積（乘積有 $2w$-bit）並只回傳乘積的上半 $w$-bit；$\textrm{mullo}(\cdot, \cdot)$ 則是下半部。$R$ 取 $2^w$ 的話，可以寫成
$$
\begin{cases}
\textrm{mulhi}(u, v) &=& \left\lfloor \left(u \cdot v\right)/R \right\rfloor
\newline
\textrm{mullo}(u, v) &=& (u\cdot v) \bmod R
\end{cases}
$$

這可以帶來什麼好處呢？有另一種實做 $\textrm{redc}(a \cdot b)$ 的方法是取 $\ell$ 使得 $x \equiv \ell \cdot M \pmod R$，接著算
$$
y = \frac{x - \ell \cdot M}{R} = \frac{a \cdot b - \ell \cdot M}{R}
$$

我們可以知道 $x$ 和 $\ell \cdot M$ 的下半 $w$-bit 實際上是完全一樣的，也就是說相減之後除以 $R$ 會等於除以 $R$ 之後再相減。

$$
\begin{align*}
y &= \left\lfloor \frac{a \cdot b}{R} \right\rfloor - \left\lfloor \frac{\ell \cdot M}{R} \right\rfloor
\newline
&=
\textrm{mulhi}(a, b) - \textrm{mulhi}(\ell, M)
\end{align*}
$$

而 $\ell$ 的計算則是
$$
\ell = x \cdot M^{-1} \bmod R = a \cdot b \cdot M^{-1} \bmod R
$$
但如果我們這邊直接把 $\ell$ 展開成 $\textrm{mullo}(\textrm{mullo}(a, b), M^{-1})$ 的話，這樣其實等於是把 $a, b$ 的完整乘積都算出來而已。所以通常這個加速的使用場景是在「不只 $M$ 事先知道，$b$ 也事先知道」（例如 NTT），這樣我們就可以預處理 $b' = bM^{-1} \bmod R$ 並改計算
$$
y = \textrm{mulhi}(a, b) - \textrm{mulhi}(\textrm{mullo}(a, b'), M)
$$

注意這種算法的話，$y$ 的範圍實際上會是 $[-M, M)$，因此校正到 $[0, M)$ 會需要一個 conditional addition。

## Barrett Reduction 與 Montgomery Multiplication 的比較

假設模數 $M$ 是 $w$-bit 的，也就是 $M < 2^w$。

| 方法                      | 需要多長的乘法 | 優點         | 缺點                                  |
|---------------------------|----------------|--------------|---------------------------------------|
| Barrett reduction         | $2w$ 乘 $2w$   | 概念比較簡單 | 需要比較長的乘法                      |
| Montgomery multiplication | $w$ 乘 $w$     | 易 vectorize | 對奇數不能使用、需要改較多程式碼 [^3] |

[^3]: 以效率的觀點來看，最好是中途計算全部改用 Montgomery form。需要在心裡掌握程式碼在哪個時間點時，哪些變數是 Montgomery form。（當然可能某種 class 可以幫忙包裝）

若以 $M$ 是 32-bit 來看的話，Barrett reduction 需要用到 `__uint128_t` 的乘法：兩個 64-bit 的數字乘出 128-bit 的結果，對應的組合語言是 `mul` 這個 instruction。但 Montgomery 可以全部在 `uint64_t` 內做完。而若 $M$ 是 64-bit 的話，Barrett 都需要手寫 256-bit 乘法了，Montgomery 可以用 `__uint128_t` 做。Montgomery multiplication 所需乘法比較短，更容易 vectorize (SIMD)。

除了 Barrett reduction 和 Montgomery multiplication 以外當然還有其他演算法，例如 div2by1，但本篇不打算介紹。另外，[英文維基](https://en.wikipedia.org/wiki/Barrett_reduction)也有寫到，在某種觀點下 Barrett reduction 和 Montgomery multiplication 是一樣的，這也有在後量子密碼學的課上提到。

## 習題（？）

- <https://yukicoder.me/problems/no/2440>
- 在 [Discrete Logarithm](https://judge.yosupo.jp/problem/discrete_logarithm_mod)、[Factorize](https://judge.yosupo.jp/problem/factorize) 應用 Barrett reduction 跟 Montgomery multiplication
- 把 [Convolution](https://judge.yosupo.jp/problem/convolution_mod) 壓到比 atcoder library 還快

## Other References

- 後量子密碼學的課程
- 2020 年 IOIC 講義
- [宋佳兴 论现代硬件上的常数优化（国家集训队2024论文集）](https://github.com/enkerewpo/OI-Public-Library/blob/master/IOI%E4%B8%AD%E5%9B%BD%E5%9B%BD%E5%AE%B6%E5%80%99%E9%80%89%E9%98%9F%E8%AE%BA%E6%96%87/%E5%9B%BD%E5%AE%B6%E9%9B%86%E8%AE%AD%E9%98%9F2024%E8%AE%BA%E6%96%87%E9%9B%86.pdf)
- <https://www.wikipedia.org/>
  - <https://en.wikipedia.org/wiki/Montgomery_modular_multiplication#Montgomery_form>
  - <https://zh.wikipedia.org/wiki/%E8%92%99%E5%93%A5%E9%A9%AC%E5%88%A9%E7%AE%97%E6%B3%95>
- <https://yosupo.hatenablog.com/entry/2024/03/26/010251>
- <https://gist.github.com/simonlindholm/51f88e9626408723cf906c6debd3814b>
