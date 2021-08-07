---
title: "Debug Template"
date: 2021-08-08T00:28:51+08:00
mathjax: true
tags: [template, experience]
---

# 除錯模板的重要
這是一篇很短的廢文。

當你發現你寫出的程式有 bug 的時候，就會是你花上很多時間的時候。
尤其是在打 OI 的情況下，付出一點點時間讓 debug 變更簡單是有必要的。

```cpp
// An AC a day keeps the doctor away.
#pragma GCC optimize("Ofast")
#include <bits/stdc++.h>
#ifdef local
#define safe std::cerr<<__PRETTY_FUNCTION__<<" line "<<__LINE__<<" safe\n"
#define debug(args...) qqbx(#args, args)
#define orange(args...) danb(#args, args)
using std::cerr;
template <typename ...T> void qqbx(const char *s, T ...args) {
    int cnt = sizeof...(T);
    ((cerr << "\e[1;32m(" << s << ") = ("), ...,
         (cerr << args << (--cnt ? ", " : ")\e[0m\n")));
}
template <typename T> void danb(const char *s, T L, T R) {
    cerr << "\e[1;32m[ " << s << " ] = [ ";
    for (int f = 0; L != R; ++L) cerr << (f++ ? ", " : "") << *L;
    cerr << " ]\e[0m\n";
}
#else
#define safe ((void)0)
#define debug(...) ((void)0)
#define orange(...) ((void)0)
#endif // local
#define all(v) begin(v),end(v)

using namespace std;

signed main() {
    ios_base::sync_with_stdio(0), cin.tie(0);
    int a[] = {3, 6, 9};
    vector<int> b;
    orange(all(a));
    orange(all(b));
    debug(1, 2, 3);
}
```

利用 C++17 的 fold expression 可以讓 code 變得超級短。 `"\e[1;32m"` 是代表綠色的代碼，可能在 windows 上不能用。當然，GDB 等等也是一個選擇，自己習慣最重要。

> 其實我只是想說，`orange` = `output range` 這個命名比 `pary` 好多了 XD
> 昨天好幸福 嘻嘻
