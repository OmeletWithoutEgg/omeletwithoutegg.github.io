---
title: TIOJ-1202
mathjax: true
date: 2020-02-09 11:37:43
tags: [TIOJ, data-structure]
---
# 重疊的天際線

https://tioj.ck.tp.edu.tw/problems/1202

## Description
地平線上有許多房子，而這些房子在夕陽的照射之下形成有趣的輪廓，我們稱之為天際線(Skyline)。為了方便起見，你可以假設所有的房子都是一個位在2D平面上的矩形，並且有一條邊貼在這個假想2D平面上的X軸。

一棟建築可以用三元數組$(L_i, H_i, R_i)$來表示，依序代表該建築物的左界座標、高度、右界座標。
下圖中的八棟建築就是用此方法表示就是
$(1,11,5), (2,6,7), (3,13,9), (12,7,16), (14,3,25), (19,18,22), (23,13,29), (24,4,28)$。

![](description.gif)

一個天際線也可以用類似的「X-遞增序列」表示出來，例如上面的八棟建築合併之後上方右圖的天際線可表示為：
$(1, 11, 3, 13, 9, 0, 12, 7, 16, 3, 19, 18, 22, 3, 23, 13, 29, 0)$

請你寫一個程式，給你這些房子的位置，請你把它們形成的天際線描述出來。
對於每一筆測試資料，請按照題目以及範例輸出格式輸出天際線的樣子。
請注意，最後一個數字一定是0。也請不要輸出多餘空白。

## Solution
考慮所有矩形的邊界上的點，我們只要確定這些點的最大高度就能夠描述這個天際線
更進一步的話題目要求的格式甚至只需要考慮左界這個點
因此我們維護一個 `multiset`
從左到右考慮所有邊界，對於任一個建築物的高度$H$，都在$L$的時候加進 `multiset` 裡面然後在$R$的時候刪掉
如果這個點的高度和前一次的答案一樣就不需要加進答案裡面

注意輸出格式QQ，一開始還吃WA好幾次

## AC code
``` cpp
#include <bits/stdc++.h>
#define ff first
#define ss second
#define pb emplace_back

using namespace std;

signed main() {
    ios_base::sync_with_stdio(0), cin.tie(0);
    int n;
    while(cin >> n && n) {
        map<int, array<vector<int>,2>> mp;
        multiset<int> ms{0};
        vector<pair<int,int>> ans;
        for(int i = 0; i < n; i++) {
            int L, H, R;
            cin >> L >> H >> R;
            mp[L][0].push_back(H);
            mp[R][1].push_back(H);
        }
        for(const auto &V: mp) {
            int p = V.ff;
            const auto &in = V.ss[0];
            const auto &ou = V.ss[1];
            for(int h: in) ms.insert(h);
            for(int h: ou) ms.erase(ms.find(h));
            int H = *--ms.end();
            if(ans.empty() || ans.back().ss != H) ans.pb(p,H);
        }
        for(int i = 0; i < ans.size(); i++)
            cout << ans[i].ff << ' ' << ans[i].ss << (i+1 == ans.size() ? '\n' : ' ');
    }
}
```