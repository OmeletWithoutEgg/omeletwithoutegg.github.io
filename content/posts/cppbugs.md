---
title: "Cppbugs"
date: 2021-01-21T00:11:31+08:00
draft: false
mathjax: true
tags: [cpp, experience]
---

這篇是想放一些神奇的C++語法錯誤
也可能會放基礎的(X
然後可能會是動態更新

# lambda capture
(Update: 2021/1/21)
這似乎是因為capture到值的時候還沒成功建構func這個變數，所以會出問題
```cpp
#include <iostream>
#include <functional>

using namespace std;

signed main() {
    function<void(void)> func = [=]() {
        int x;
        cin >> x;
        cout << "ok " << x << '\n';
        if(x) func();
    };
    func();
}
```

# const reference & implicit conversion
(Update: 2021/1/21)
```cpp
#include <iostream>

using namespace std;

struct Data {
    int x;
    Data(int val = 0) : x(val) {}
    int calc() {
        return x * 2 + 3;
    }
};

istream & operator>>(istream &I, const Data &data) {
    return I >> data.x;
}

int main() {
    Data data;
    cin >> data;
    cout << data.calc() << '\n';
}
```

# vector\<bool\> access with auto deduce type
(Update: 2021/1/21)
```cpp
#include <iostream>
#include <vector>

using namespace std;

int main() {
    const int n = 20, m = 20;
    // n * m grid
    auto check = [&](int x, int y) {
        cout << x*m+y << '\n';
        vector<bool> ok(n * m);
        // do some calc
        return ok[x * m + y];
    };
    cout << check(0, 0) << '\n';
}
```

# abs outside of std
(Update: 2021/8/15)
`std::abs` 有多型，會自己偵測吃進去的是不是 long long，但是 `std` 外面的 `abs` 不會，要用 `llabs`。
```cpp
#include <bits/stdc++.h>

using ll = long long;

signed main() {
    ll n = 5298309920314;
    std::cout << abs(n) << std::endl; // overflow!
    std::cout << llabs(n) << std::endl;
    std::cout << std::abs(n) << std::endl;
}
```
