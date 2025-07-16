---
title: "量子刷題"
date: 2025-07-15T17:06:52+08:00
draft: false
mathjax: true
tags: [quantum]
---

# 推銷 qcoder.jp

[qcoder](https://www.qcoder.jp/en) 是一個專注在量子演算法的 Online Judge 平台。

和 codeforces 上的 Microsoft Q# Coding Contest 有點類似，不過在 qcoder 上是使用 python 的 `qiskit` 套件。我個人覺得這比較親民，畢竟我不會安裝 Q# 的環境但 qiskit 很簡單就可以弄起來了（？）

qcoder 裡面並沒有直接的題目列表，想要練習的話可以點開過去比賽的題目寫。比賽的題目大致上會按照字母 + 數字編號，同一個字母代表是同一個大題。通常一個大題內的難度是有按照順序排好的，此外過去問都有完整的 editorial，所以我認為很適合學習，應該很適合正在修量子資訊與計算的人（？），特別是裡面會出現不少「只要你有從頭到尾學過經典演算法就高機率會」的題目，例如 Grover's algorithm 的細節。
註：此經典非彼經典

qcoder 評測時並非使用真正的量子電腦，而是（消耗指數量級資源的）模擬。因此實際上題目的 qubit 數並不太多，通常在 5 到 10 左右。在一般的競程當中一個很重要的點是要壓時間複雜度，避免 TLE；而在 qcoder 有一些題目是要求你構造出的 circuit 深度不能超過某個限度，也就是說除了要求「正確的」構造一個 circuit 以外，也可能要求要「有效率」。

## 如何安裝 qiskit

首先要有 `python` 且可以 `pip install`。如果條件允許的話，建議可以創一個 [virtual environment](https://docs.python.org/zh-tw/3.13/library/venv.html)

```bash
python3 -m venv myenv
. myenv/bin/activate
```

```bash
pip install qiskit
```

## 參考資料

- <https://www.qcoder.jp/en/qa>
  - [網頁式遊戲 qubit factory](https://www.qubitfactory.io/)
  - [IBM 對量子計算的介紹](https://learning.quantum.ibm.com/course/basics-of-quantum-information)
  - [IBM 對 qiskit 的 docs](https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.circuit.Gate)
- [Announcement: Microsoft Q# Coding Contest – Summer 2020](https://codeforces.com/blog/entry/77614)
  - 2018, 2019, 2020 分別各有 warm round 跟正式賽。我有在其中一個 round 幸運抽到一件 T-shirt，可惜 2021 以後好像沒了。
- 一個有用的 [量子電路模擬器](https://algassert.com/quirk)，可以拿來手玩。

## 結

最近剛好要開始久違的 [一個 round](https://www.qcoder.jp/en/contests/QPC005) 了，時間是 7/27，趕緊把這篇拖延好久的推銷文寫了。
順帶一提，比賽是有獎品的！第一名會拿到 10000 yen 的 amazon 禮品卡（詳細規則請見網站），不過必須要住在日本才有領獎資格。

