---
title: "Pbds Split Join Is Slow"
date: 2021-07-23T18:16:13+08:00
mathjax: true
tags: [binary-tree, data-structure, cpp, splay-tree]
---

# 幫 pbds 上香
如題。

先說結論：
官網的 [document](https://gcc.gnu.org/onlinedocs/libstdc++/ext/pb_ds/tree_based_containers.html) 寫說 split 跟 join 時間是「poly-logarithm」，但是其實 GNU 的 pbds 預設的 split 是 $\mathcal{O}(N)$ 的，請看[這篇文章](https://gcc.gnu.org/bugzilla/show_bug.cgi?id=81806)。
不過有一些方法可以讓複雜度變回一次 `split` $\mathcal{O}(\log N)$，但是有一點麻煩。

## 前言
Policy-Base Data Structure 簡稱 pbds ，是 GCC 提供的一系列資料結構的 template，而今天要談的是當中的 `tree` 型別。
因為看到別人寫的 pbds 自訂 `metadata_type` 覺得很酷，因此想要來探索探索 pbds 一番。
大概了解 `node_update` 怎麼運作之後，我試著去寫了 [氣球博覽會](https://tioj.ck.tp.edu.tw/problems/1169)，因為需要區間查詢，我使用了 `tree::split(key, other)` 和 `tree::join(other)`，沒想到全部吃 TLE，研究一番之後發現下面這樣的 code 就會執行不完了：

```cpp
#include <bits/extc++.h>
#include <bits/stdc++.h>

using namespace std;

using BST = __gnu_pbds::tree<int, __gnu_pbds::null_type, less<int>,
      __gnu_pbds::rb_tree_tag>;
signed main() {
    ios_base::sync_with_stdio(0), cin.tie(0);
    BST A, B, C;
    int n = 100000;
    for (int i = 0; i < n; i++) {
        int x = rand();
        A.insert(x);
    }

    long long ans = 0;
    for (int i = 0; i < n; i++) {
        BST b, c;
        int l = rand();
        int r = rand();
        if (l > r) swap(l, r);
        // query (l, r]
        A.split(l, B);
        B.split(r, C);

        ans += B.size();

        B.join(C);
        A.join(B);
    }
    cout << ans << '\n';
}
```

## 真正累的地方
因為好奇所以把 `/usr/include/c++/11.1.0/ext/pb_ds/` 翻出來看，真的有夠難看懂，到處 include 又有繼承關係，最後還是不知道為什麼會那麼慢QQ
大概花了我一個小時以上吧？也可能是一個下午。

後來想起來有一個工具可以分析每個函式的執行時間，google一下找到是 `gprof` ，搭配 `gprof2dot` 就找到兇手了。

簡單來說，pbds 預設只有在一個 instance 維護一個 size ，而不是每一個節點維護一個，所以在 split 的時候無法好好維護兩棵樹的大小分別是多少，在目前的 library 當中是用 `std::distance` 計算 iterator 之間的距離以得知兩樹的大小，詳細可以看
        `ext/pb_ds/detail/bin_search_tree_/split_join_fn_imps.hpp`
        （`bin_search_tree_set` / `bin_search_tree_map`是沒有自平衡的二元樹，`tree`都是繼承自這個class）。

## 醜醜的解決方案

其中一個解決的方式是在 metadata 裡面維護 size，並且 overload `std::distance`。
`ext/pb_ds/detail` 裡面所有跟 `tree` 有關的標頭檔只有 `split` 之後維護 size 的地方用到一次，所以不用擔心複雜度多一個 $\log$ 或是影響到樹的內部結構。


### `splay tree`
使用 `splay_tree_tag` 的 `tree` 可以在 $\mathcal{O}(\log N)$ `split` ，但是要注意複雜度均攤的保證是在拜訪任何節點後 splay 那個節點，因為我不知道怎麼把 splay 寫在 `std::distance` 裡面所以只好在 `split` 完之後用 `find` 來間接呼叫 `splay`。

```cpp
#pragma GCC optimize("Ofast")
#include <bits/extc++.h>
#include <bits/stdc++.h>

using namespace std;

using namespace __gnu_pbds;
using BST = tree<int, null_type, less<int>, splay_tree_tag,
      tree_order_statistics_node_update>;
using BST_Itr = BST::iterator;

// overload std::distance for BST for efficiently split
namespace std {
    template<>
    iterator_traits<BST_Itr>::difference_type
    distance(BST_Itr begin, BST_Itr end) {
        if (begin == end)
            return 0;
        auto it = begin.m_p_nd;
        // jump until root
        while (it->m_p_parent->m_p_parent != it)
            it = it->m_p_parent;
        return it->get_metadata();
    }
}

void splayAfterSplit(BST &bst) {
    if (bst.empty()) return;
    bst.find(*bst.begin());
    bst.find(*bst.rbegin());
}

signed main() {
    BST A, B, C;
    int n = 100000;
    for (int i = 0; i < n; i++) {
        int x = rand();
        A.insert(x);
    }

    long long ans = 0;
    for (int i = 0; i < n; i++) {
        int l = rand();
        int r = rand();
        if (l > r) swap(l, r);
        // query (l, r]
        A.split(l, B);
        B.split(r, C);

        splayAfterSplit(A);
        splayAfterSplit(B);
        splayAfterSplit(C);

        ans += B.size();

        B.join(C);
        A.join(B);
    }
    cout << ans << '\n';
}
```

### `rb_tree`
而在 `std::distance` 複雜度是好的前提下，使用 `rb_tree_tag` 的 `tree` `split` 的複雜度應該就會是 $\mathcal{O}(\log^2 N)$ 了，但不知道是兩個 $\log$ 就這麼慢還是有哪裡又有問題了，上面同樣1e5次的`split`+`join`開 `Ofast` 還是要跑大概五秒。

鑑於兩個 $\log$ 無法在氣球博覽會取得 AC ，我們有另外一種可以避免 `split` 而解決區間詢問的方式。
只要在 `metadata` 維護這個子區間的最左端與最右端就能有與遞迴式線段樹類似的寫法了，一次詢問的複雜度應該至多是 $\mathcal{O}(\log N + \log K)$ 吧。（$K$是key的值域）
醜醜又長長的 code 如下：

```cpp
#pragma GCC optimize("Ofast")
#include <bits/stdc++.h>
#include <bits/extc++.h>

using namespace std;
const int maxn = 200025, inf = 1e9;

struct info {
    int ans, mn, mx;
    pair<int,int> lmost, rmost;
    info () : ans(-inf), mn(-inf), mx(inf), lmost(), rmost() {}
    info (int c, int x) : ans(0), mn(x), mx(x), lmost(c, x), rmost(c, x) {}
    friend info operator+(const info &lhs, const info &rhs) {
        if (lhs.ans < 0) return rhs;
        if (rhs.ans < 0) return lhs;
        info res;
        res.ans = max({ lhs.ans, rhs.ans, rhs.mn - lhs.mx });
        res.mn = min(lhs.mn, rhs.mn);
        res.mx = max(lhs.mx, rhs.mx);
        res.lmost = lhs.lmost;
        res.rmost = rhs.rmost;
        return res;
    }
};

template<class Node_CItr, class Node_Itr, class Cmp_Fn, class _Alloc>
struct my_node_update {
private:
    using Key = pair<int,int>;
    info query(Node_CItr it, Key L, Key R) {
        if (it == node_end())
            return info();
        if (L <= it.get_metadata().lmost && it.get_metadata().rmost < R)
            return it.get_metadata();
        Key key = **it;
        if (key >= R)
            return query(it.get_l_child(), L, R);
        if (key < L)
            return query(it.get_r_child(), L, R);
        return query(it.get_l_child(), L, R)
            + info((*it) -> first, (*it)->second)
            + query(it.get_r_child(), L, R);
    }
public:
    typedef info metadata_type;
    void operator()(Node_Itr it, Node_CItr end_it) {
        info res((*it) -> first, (*it) -> second);
        Node_Itr lc = it.get_l_child();
        Node_Itr rc = it.get_r_child();
        if (lc != end_it)
            res = lc.get_metadata() + res;
        if (rc != end_it)
            res = res + rc.get_metadata();
        const_cast<metadata_type&>(it.get_metadata()) = res;
    }
    info query(Key L, Key R) {
        return query(node_begin(), L, R);
    }
    virtual Node_CItr node_begin() const = 0;
    virtual Node_CItr node_end() const = 0;
};

using BST = __gnu_pbds::tree<pair<int,int>, __gnu_pbds::null_type, less<>,
      __gnu_pbds::rb_tree_tag, my_node_update>;
BST tr;

int a[maxn];
signed main(){
    ios_base::sync_with_stdio(0),cin.tie(0);
    int n, q, C;
    cin >> n >> q >> C;
    for (int i = 0; i < n; i++)
        cin >> a[i];
    for (int i = 0; i < n; i++)
        tr.insert({ a[i], i });
    for(int i = 0; i < q; i++){
        int t;
        cin >> t;
        if (t == 0) {
            int x, k;
            cin >> x >> k;
            tr.erase({ a[x], x });
            a[x] = k;
            tr.insert({ a[x], x });
        } else {
            int l, r, k;
            cin >> l >> r >> k;
            auto res = tr.query({ k, l }, { k, r });
            if (res.ans < 0)
                cout << r - l << '\n';
            else
                cout << max({ res.ans, r - res.mx, res.mn - l + 1 }) - 1 << '\n';
        }
    }
}
```

其實這樣的 code length 還有要記得的東西已經長到可以提出「這跟自己寫平衡樹不是差不多嗎？」的疑問了，實在蠻可惜的，號稱 high-performance ，然後寫這麼多東西還是比一大堆人寫的 treap 慢（也可能只是我笨笨才會 code 這麼長 QQ）。

我覺得如果 pbds 沒有這幾個函數或是複雜度很爛倒也不是什麼大問題，畢竟 STL 肥也不是一天兩天的事情了，在競賽自己寫資結也不是不行，但是官網上的說明應該要改掉QQ

# Appendix: metadata
為了怕大家聽不懂來講怎麼什麼是 metadata 還有怎麼自己維護 metadata。
如果想自己研究可以看 [document](https://gcc.gnu.org/onlinedocs/libstdc++/ext/pb_ds/tree_based_containers.html)。

metadata 是我們可以自訂的在每個節點儲存的有關它整個子樹的資訊，方便說明會用以下的問題作為舉例。

> 有 $N$ 個操作，每個操作可能是把一個整數加進集合裡面，或是詢問數字大小介於 $[l, r)$ 之內的數字總和。保證不會有已經在集合裡面的數字被加進去（i.e.數字全部相異）

我們將會使用下面這樣的 `tree`。

```cpp
using namespace __gnu_pbds;
using BST = tree<int, null_type, less<T>, rb_tree_tag, my_node_update>;
```

`my_node_update` 是一個我們自行撰寫的型別：

```cpp
template<class Node_CItr, class Node_Itr, class Cmp_Fn, class _Alloc>
struct my_node_update {
    typedef long long metadata_type;
    void operator()(Node_Itr it, Node_CItr end_it) {
        // ...
    }
    long long query(int x) {
        // ...
    }
    virtual Node_CItr node_begin() const = 0;
    virtual Node_CItr node_end() const = 0;
};
```

其中，`metadata_type` 是每個節點維護的資訊的型別，`Node_CItr` 和 `Node_Itr` 分別是 const 的節點迭代器與節點迭代器，值得注意的是這種迭代器是**指向迭代器的迭代器**，也就是說 `*it` 的型別會是 `tree::iterator` 之類的，兩種迭代器有所不同（`it`與`tree::begin()`型別是不同的！）。
`void operator()(Node_Itr it, Node_CItr end_it)` 方法有點類似 `pull` 的角色，當這個函式被呼叫，保證 `it` 的左小孩與右小孩的 metadata 都已經是正確的了，而你必須重新計算 `it` 的 metadata。`it.get_l_child()` 和 `it.get_r_child()` 分別是 `it` 的左小孩與右小孩，而如果左(右)小孩不存在則會設成與 `end_it` 相同。


我們可以這樣寫：

```cpp
void operator()(Node_Itr it, Node_CItr end_it) {
    long long res = **it;
    Node_CItr lc = it.get_l_child();
    Node_CItr rc = it.get_r_child();
    if (lc != end_it)
        res = lc.get_metadata() + res;
    if (rc != end_it)
        res = res + rc.get_metadata();
    const_cast<metadata_type&>(it.get_metadata()) = res;
}
```

`node_begin()` 會回傳一個代表根的節點迭代器，而 `node_end()` 則是回傳一個代表空節點的節點迭代器（任何葉子節點的小孩都會是 `node_end()`）。
我們希望 `query(x)` 回傳所有 $ < x$ 的數字總和，因此可以撰寫 `my_node_update::query` 如下：

```cpp
long long query(int x) {
    long long result = 0;
    Node_CItr it = node_begin();
    while (it != node_end()) {
        int key = **it;
        if (key < x) {
            result += it.get_l_child().get_metadata();
            result += key;
            it = it.get_r_child();
        } else {
            it = it.get_l_child();
        }
    }
    return result;
}
```

所有 `my_node_update` 的 public 方法都可以在使用 `my_node_update` 的 `tree` 直接使用，因此我們可以直接像下面這樣使用我們定義完的 `BST` 型別。

```cpp
signed main() {
    ios_base::sync_with_stdio(0), cin.tie(0);
    int N;
    cin >> N;
    for (int i = 0; i < N; i++) {
        string type;
        cin >> type;
        if (type == "QUERY") {
            int l, r;
            cin >> l >> r;
            cout << bst.query(r) - bst.query(l) << '\n';
        } else if (type == "ADD") {
            int x;
            cin >> x;
            bst.insert(x);
        }
    }
}
```

# 參考資料/延伸閱讀

https://zouzhitao.github.io/posts/pbds/
https://gcc.gnu.org/bugzilla/show_bug.cgi?id=81806
https://www.luogu.com.cn/blog/Chanis/gnu-pbds
https://github.com/baluteshih/baluext/blob/main/baluext.h

有任何筆誤請通知 m(\_ \_)m
