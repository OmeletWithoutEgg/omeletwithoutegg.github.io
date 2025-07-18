---
title: TIOJ-1950
date: 2019-12-13 23:26:11
tags: [TIOJ, binary-tree, splay-tree]
mathjax: true
---
# 小向的試煉 2-3：轉！(Rotate!)
https://tioj.ck.tp.edu.tw/problems/1950

## Description
給定長度$N$的排列，問「以交換任意兩個數字的方式排序這個序列需要多少次數」
另外有$M$次修改，每次修改會交換數字$i$和數字$j$的位置，請輸出$M+1$行代表一開始和每次修改過後的答案

## Solution
已經知道每個數字應該被放到哪裡了，所以我們可以想到一個排序方法
每次看某個位置$i$的數字$x$，如果和$i$不同的話就把$x$放到位置$x$的地方，再繼續對原本放在位置$x$的地方的數字做同樣的事
可以發現這樣會形成好幾個「環」，例如範測的$(1, 4, 2, 5, 3)$會形成兩個環
$$
\begin{pmatrix}
1
\end{pmatrix}
\begin{pmatrix}
4 & 5 & 3 & 2
\end{pmatrix}
$$
或是$(1, 6, 4, 5, 3, 2)$會形成三個環
$$
\begin{pmatrix}
1
\end{pmatrix}
\begin{pmatrix}
6 & 2
\end{pmatrix}
\begin{pmatrix}
4 & 5 & 3
\end{pmatrix}
$$

也就是說，每個環代表第一個元素要放到第二個元素的位置，第二個元素要放到第三個元素的位置...以此類推
一個大小$L$的環需要的交換次數是$L-1$，所以把$1\dots n$的排列排序好所需的時間就是$n-($環的個數$)$
用數學一點的講法就是一個置換可以分解成好多不相交的輪換(?)而且方法是唯一的喔

考慮一下交換了兩個數字會發生什麼事: 
如果他們在同一個「環」裡面，那那個環就會被切成兩個環
反之則會讓兩個環合在一起，變成一個「環」
示意圖大概就是這樣

![](cycles.png)

要怎麼辦到這件事呢？快速把元素之間連接或者切斷，我們會想到使用鏈結串列，但是這樣無法判斷他們是否在同一個環裡面
退而求其次可以使用二元樹來維護，用$\mathcal{O}(\log n)$獲得可以剪切又可以黏貼序列的神力(?)
我選擇用splay來實作，詳細的原理自己google OwO

## AC code
``` cpp
//   __________________
//  | ________________ |
//  ||          ____  ||
//  ||   /\    |      ||
//  ||  /__\   |      ||
//  || /    \  |____  ||
//  ||________________||
//  |__________________|
//  \###################\
//   \###################\
//    \        ____       \
//     \_______\___\_______\
// An AC a day keeps the doctor away.

#pragma g++ optimize("Ofast")
#pragma loop_opt(on)
#include <bits/extc++.h>
#ifdef local
#define debug(x) (cerr<<#x<<" = "<<(x)<<'\n')
#else
#define debug(x) ((void)0)
#endif // local

using namespace std;
typedef int64_t ll;
constexpr ll N = 100025, INF = 1e18, MOD = 998244353, K = 64, inf = 1e9;

struct Splay {
    struct node {
        int ch[2],pa;
        int lf[2];
        // lf[0] is the leftmost element of this splay, lf[1] is the rightmost
    } T[N];
    void pull(int i){
        T[i].lf[0] = T[i].ch[0] ? T[T[i].ch[0]].lf[0] : i;
        T[i].lf[1] = T[i].ch[1] ? T[T[i].ch[1]].lf[1] : i;
    }
    bool isroot(int x){return T[x].pa==0;}
    bool dir(int x){return T[T[x].pa].ch[1] == x;}
    void rot(int x) {
        int y = T[x].pa, z = T[y].pa, d = dir(x);
        T[x].pa = z;
        if(!isroot(y)) T[z].ch[dir(y)] = x;
        T[T[x].ch[!d]].pa = y, T[y].ch[d] = T[x].ch[!d];
        T[x].ch[!d] = y, T[y].pa = x;
    }
    int splay(int x) {
        while(!isroot(x)) {
            int y = T[x].pa;
            if(!isroot(y)) {
                if(dir(x) ^ dir(y))
                    rot(x);
                else
                    rot(y);
            }
            rot(x);
        }
        return T[x].lf[0];
        //like DSU, present a tree with unique element(leftmost)
    }
    // (A..., x, B...) -> (A...) + (x, B...)
    int cut(int x) {
        splay(x);
        int res = T[x].ch[0];
        T[T[x].ch[0]].pa = 0, T[x].ch[0] = 0, T[x].lf[0] = x;
        return res;
    }
    // (A..., x, B...) + (C..., y, D...) -> (x, B...C..., y, D...A...)
    void link(int x, int y) {
        if(!x || !y || splay(x) == splay(y)) return;
        x = T[x].lf[1], y = T[y].lf[0];
        splay(x), splay(y);
        T[y].pa = x, T[x].ch[1] = y;
        splay(y);
    }
    int poke(int x,int y) {
        if(splay(x) == splay(y)) {
            // (A..., x, B..., y, C...) -> (x, B...) + (y, C...A...)
            int a = cut(x);
            link(x,a);
            cut(y);
            return -1;
        }else {
            // (A..., x, B...) + (C..., y, D...) -> (x, B...A..., y, D...C...)
            int a = cut(x);
            int b = cut(y);
            link(x,a);
            link(y,b);
            link(x,y);
            return 1;
        }
    }
    void init(int n) {
        for(int i = 1; i <= n; i++)
            T[i].lf[0] = T[i].lf[1] = i, T[i].pa = T[i].ch[0] = T[i].ch[1] = 0;
    }
    /*void dfs(int i) {
        if(!i) return;
        dfs(T[i].ch[0]);
        cout << i << ' ';
        dfs(T[i].ch[1]);
    }
    void dbg(int n) {
        //return;
        cout << "===\n";
        for(int i = 1; i <= n; i++) if(isroot(i)) dfs(i), cout << '\n';
        cout << "===\n\n";
    }*/
} cycles;
int n,q,v[N],vis[N],pos[N],ans;
signed main() {
    ios_base::sync_with_stdio(0), cin.tie(0);
    cin >> n >> q;
    cycles.init(n);
    for(int i = 1; i <= n; i++) cin >> v[i], pos[v[i]] = i;
    for(int i = 1; i <= n; i++) if(!vis[i]) {
        int last = 0;
        for(int x = i; !vis[x]; x = pos[x]) {
            if(last) ans += cycles.poke(v[last],v[x]);
            vis[x] = 1;
            last = x;
        }
    }
    cout << ans << '\n';
    //tr.dbg(n);
    //return 0;
    while(q--) {
        int a,b;
        cin >> a >> b;
        ans += cycles.poke(a,b);
        cout << ans << '\n';
        //tr.dbg(n);
    }
}
```