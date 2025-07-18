---
title: TIOJ-1283
date: 2020-01-25 23:37:00
tags: [TIOJ, dp, dp-optimization]
author: Sean Liu
mathjax: true
---
<! -- ### Author: Sean Liu -->

# 超大畫框設置

https://tioj.ck.tp.edu.tw/problems/1283

## Description
在一個「漸進式框架」當中，你想要找到一個最大面積的矩形位置放置你最喜愛的一幅畫。

當然地，畫框必須掛正，所以矩形的四個邊都必須與框架的邊平行或垂直。

所謂的「漸進式框架」，指的是任何一個水平線截出的框架區段是連續，並且由上往下該區段只會往右移動，如下圖

![](description.png)

## Solution
這個是蕭梓宏在超級久之前講的四邊形優化題目，筆者發現已經過了一年多了還沒AC就想說來寫看看好了！這一題不難想到，對於每一個在下面的線，都計算是哪一條在上面的線和它搭配會有最佳，再取$\max$就好了。不過，這樣需要$O(MN)$的時間，頗爛。

不過呢，還可以觀察（且證明）一個性質，就是：倘若$L(x)$為下面的線中第$x$條線所對應到的最佳（面積最大）的上面的線的編號，則$L(x + 1) \geq L(x)$！有了這個性質，大概就可以維護一個`deque`，裡面放一堆東西$(L, R, I)$來維護說：上面第$I$條線可以轉移下面第$L$到第$R$的線為最佳。一開始只有一個$(0, M, 0)$，然後每次進來一個上面的線段就開始判斷（假設目前`deque`中最後面的元素為$(L, R, I)$，且目前我在第$X$條）：

* 若$X$和$L$的矩形比$I$和$L$的矩形還大，這代表$(L, R, I)$這個區間可以完全不要了，`pop`掉
* 若$X$和$M - 1$的矩形比$I$和$M - 1$的矩形還小（也就是最後一個），則代表我永遠贏不了那一條線，我就直接`break`了，反正贏不了
* 否則，開始二分搜說我到哪裡可以贏$(L, R, I)$，也就是說，找一個最小的$m$使得$m$和$I$的矩形小於或等於$m$和$X$的矩形

維護完之後，再掃一次$M$條線取$\max$就好了！ 

## AC code
感覺寫完到AC的時間還不會很久，但是中間有一堆小細節被卡（還有二分搜寫錯、被卡`long long`、$N, M$要除以二、面積計算出錯等有趣環節），幸好沒有太大的問題！

``` cpp
#include <iostream>
#include <deque>
#define int long long int
#define ericxiao ios_base::sync_with_stdio(0);cin.tie(0);
using namespace std;

const int maxN = 1e5;

struct Line{
    int h, l, r;
    Line(){}
    Line(int h, int l, int r): h(h), l(l), r(r){}
} line, ups[maxN], downs[maxN];

struct Seg{
    int l, r, id;
    /*
        l, r: from 0 ~ M - 1, bottom
        id: 0 ~ N - 1, top
    */
    Seg(){}
    Seg(int l, int r, int id): l(l), r(r), id(id){}
} current;

inline int Abs(int x){
    return (x < 0) ? -x : x;
}

inline int area(Line u, Line d){
    return (u.r - d.l) * (d.h - u.h); //Don't ABS here :(
}

deque<Seg> trans;

int N, M, r, d, cx, cy;

signed main(){
    ericxiao;
    cin >> N;
    N /= 2;
    cx = cy = 0;
    for(int i = 0; i < N; i++){ // - | - |
        cin >> r >> d;
        ups[i] = Line(cy, cx, cx + r);
        cx += r;
        cy += d;
    }
    cin >> M;
    M /= 2;
    cx = cy = 0;
    for(int i = 0; i < M; i++){ // | - | - | - | -
        cin >> d >> r;
        downs[i] = Line(cy + d, cx, cx + r);
        cx += r;
        cy += d;
    }
    for(int i = 0; i < N; i++){
        while(trans.size()){
            int id = trans.back().id;
            if(area(ups[id], downs[trans.back().l]) <= area(ups[i], downs[trans.back().l])) trans.pop_back();
            else break;
        }
        if(trans.size()){
            int id = trans.back().id, L = trans.back().l, R = trans.back().r, MID;
            if(area(ups[id], downs[M - 1]) > area(ups[i], downs[M - 1])) continue;
            while(L + 1 < R){
                MID = (L + R) / 2;
                if(area(ups[id], downs[MID]) <= area(ups[i], downs[MID])) R = MID;
                else L = MID;
            }
            trans.back().r = L;
            trans.push_back(Seg(L, M, i));
        } else {
            trans.push_back(Seg(0, M, i));
        }
    }
    int ans = 0;
    for(int i = 0; i < M; i++){
        while(trans.size() && trans.front().r <= i) trans.pop_front();
        ans = max(ans, area(ups[trans.front().id], downs[i]));
    }
    cout << ans << endl;
}
```
