---
title: TIOJ-1171-LCT
date: 2019-12-14 23:50:21
tags: [template, tree, link-cut-tree]
---
# 動態樹的奮鬥

為了這題的Link-Cut-Tree解我花了不只一整天XD
壓常實在是神奇的事，把 `long long` 改成 `int` 再加上幾個 `pragma` 終於成功壓過唯一奇怪的那筆= =
而且 `push` 竟然還不能用遞迴寫，到底三小
LCT怎麼這麼可撥XD
不過壓過去那筆之後其他筆的執行時間加起來超少，值得了

註: 模板是參考日月卦長那裡的，大概不會有時間會為這篇補上解說吧，大家自己google

``` cpp
#pragma g++ optimize("Ofast")
#pragma loop_opt(on)
#include <cstdio>
#include <bitset>
#include <algorithm>
using namespace std;
typedef long long ll;
const int N = 100025;
inline char readchar() {
    const static int B = 1<<20;
    static char buf[B], *p, *q; // p,q would be initialized with nullptr
    if(p == q && (q=(p=buf)+fread(buf,1,B,stdin)) == buf) return EOF;
    return *p++;
}
inline int nextint() {
    int x = 0, c = readchar();
    while('0'>c || c>'9') c = readchar();
    while('0'<=c&&c<='9') x = x*10 + (c^'0'), c = readchar();
    return x;
}

// \sum{cnt[p] * w[p]}
struct LinkCutTree {
    // Splay
    struct node {
        ll ws, sum;
        int laz, cnt, w;
        int ch[2], pa;
    } S[N];
    bool isroot(int x) { // is the root of the splay tree
        return S[S[x].pa].ch[0]!=x && S[S[x].pa].ch[1]!=x;
    }
    void add(int i, int d) {
        if(!i) return;
        S[i].laz += d;
        S[i].cnt += d;
        S[i].sum += S[i].ws * d;
    }
    void down(int i) {
        if(!i || !S[i].laz) return;
        add(S[i].ch[0],S[i].laz);
        add(S[i].ch[1],S[i].laz);
        S[i].laz = 0;
    }
    int stk[N];
    void push(int i) {
        int p = 0;
        stk[p++] = i;
        while(!isroot(i)) stk[p++] = i = S[i].pa;
        while(p) down(stk[--p]);
        //if(!isroot(i)) push(S[i].pa);
        //down(i);
    }
    void pull(int i) {
        S[i].ws = S[S[i].ch[0]].ws + S[S[i].ch[1]].ws + S[i].w;
        S[i].sum = S[S[i].ch[0]].sum + S[S[i].ch[1]].sum + ll(S[i].cnt) * S[i].w;
    }
    void rot(int x) {
        int y = S[x].pa, z = S[y].pa;
        int d = (S[y].ch[1] == x);
        S[x].pa = z;
        if(!isroot(y)) S[z].ch[S[z].ch[1]==y] = x;
        S[y].ch[d] = S[x].ch[!d];
        if(S[y].ch[d]) S[S[y].ch[d]].pa = y;
        S[x].ch[!d] = y, S[y].pa = x;
        pull(y), pull(x);
    }
    void splay(int x) {
        push(x);
        while(!isroot(x)) {
            int y = S[x].pa;
            if(!isroot(y)) {
                int z = S[y].pa;
                if(S[z].ch[0]==y ^ S[y].ch[0]==x) rot(x);
                else rot(y);
            }
            rot(x);
        }
    }
    // LCT
    int access(int x) {
        int last = 0;
        while(x) {
            splay(x);
            S[x].ch[1] = last;
            pull(x);
            last = x;
            x = S[x].pa;
        }
        return last;
    }
    ll query(int v){
        return S[access(v)].sum;
    }
    void modify(int v,int d) {
        add(access(v),d);
    }
} LCT;
bitset<N> color;
ll sumd,sumc;
ll dis[N];
signed main() {
    int n = nextint(), q = nextint();
    for(int i = 1; i < n; i++) {
        int a = nextint()+1;
        int b = nextint()+1;
        int w = nextint();
        //LCT.addEdge(a,b,w);
        //LCT.addEdge(b,a,w);
        dis[b] = dis[a] + w;
        LCT.S[b] = {w,0,0,0,w,0,0,a};
        //LCT.pull(b);
    }
    while(q--) {
        int t = nextint();
        int x = nextint()+1;
        if(t == 2) {
            printf("%lld\n", sumd + sumc*dis[x] - 2*LCT.query(x));
        }else if(!color[x]) {
            color[x] = true, LCT.modify(x,1), sumc++, sumd += dis[x];
        }
    }
}
```
