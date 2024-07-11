---
title: "第六學期修課心得"
date: 2024-07-07T21:31:21+08:00
draft: false
mathjax: true
tags: [CSIE]
---

# Sixth semester

在大約一月底我們得知 ICPC 會在四月舉辦。於是這學期我還是盡量把課排少，學期初的時候我原本選了一個國文課，但後來退掉了，學分也剩下 14 學分需要低修單。剩下只有五門課看起來真的超級少的。

## 密碼學導論
學期初的時候去聽了一下覺得可以修，而且資工系一堆人都搶著要修的樣子。三類加簽，所以只要在網路上加選等抽中，雖然是個兩百多人的課但抽中也不難，會有不少人退選。

學期初會先講一些簡單的抽象代數，基本上都是會討論像是 $Z_n$ 或是 $GF_{q^n}$ 這種有好性質的 ring/field，主要是為了 AES 鋪路。
後半學期會講 RSA 以及一些旁通道攻擊的例子，然後還有 ECB/CBC 等加密模式或是像是金鑰分發、certificate authority、bitcoin、區塊鏈這種比較分散的對我來說感覺沒什麼動力學的東西。最後雖然確實有講後量子密碼學，但其實也就是維基百科上查得到的東西而已，沒有得到什麼太有用的知識的感覺。

每個禮拜都有一個小考，雖然只算最高六次但我到學期末都沒湊滿，大概差一兩分。大概到差不多期中考的時候一開始幾個一起來修的資工系同學停修掉了，雖然我沒有停修但後來的小考和上課有點後悔，一直考一些奇怪的細節或是背誦的東西，然後好幾次的問答題我寫了一大篇作文沒拿滿分真的哭。

期中考我有點考爆，拿了個 82 分。期末考考了 91 分，我那時候心想完蛋了這樣考試平均也不到 90 怎麼 A+，但還是太小看作業的分數了。

整學期只有一個作業，大部份都是課本上的題目，加上一些看影片寫心得跟用 sage 做一些超簡單的練習。
課本的題目感覺其實也沒什麼品味，而且有一些題目感覺像是有問題。
作業有一個提早交加分的機制，從大概 16 題裡面選最好的 12 題。我那時候就卷這份作業，想要把全部的題目都在提早交的期限前寫完，雖然最後一些看影片寫心得的部份沒有寫但還是花了蠻多力氣，最後這邊的分數有拿滿；其實我懷疑我又抄題目又用 $\\LaTeX$ 又每題都寫，如果我是助教肯定是心想「這麼長誰想改乾脆直接給滿分好了」(X。

## 人工智慧導論
忘記是上一屆還是這一屆開始是系上必修。

前半學期講了什麼是人工智慧跟一些比較古早的方法，主要是像是 A* 或是 alpha-beta 剪枝等 exhaustive search 以及一些機率的 bayesian inference 之類的東西。
後半學期則是開始談機器學習，講 supervised 和 unsupervised 的一些方法，最後比 HTML（林軒田教授開的 ML）多的東西可能就是 reinforcement learning 吧。

不過我都沒有去上課，唯一一次去 103 教室是期中考的時候。期中考有夠擠，座位連梅花座都做不到，整排都是人。
期中考抱佛腳抱不夠足，而且很好笑的是我到考完才知道原來可以帶大抄進去。考了個差不多是平均的八十幾分。

作業總共有四次的手寫+程式加上一個 final project。
手寫的部份 hw1 和 hw2 都是照定義模擬或計算一些東西，hw3 和 hw4 則是有計算和證明，但幾乎都是 HTML 的子集。
程式作業的部份，hw1 跟 hw2 是從 Berkeley 端來的作業，要用寫一個 [pacman](https://en.wikipedia.org/wiki/Pac-Man) 遊戲的人工智慧。hw1 是寫 A*，hw2 則是 alpha-beta 剪枝，並且需要額外自己設計一個夠好的 evaluating function（heuristic 好難）。
hw3 是各種經典的 regression 跟 classifier，hw4 則是簡單的 PCA 跟用 pytorch 寫一個 autoencoder，都是蠻標準的 task。
從 hw4 開始用 Github Copilot，覺得好好用，要被取代了QQ

final project 跟往年一樣是德州撲克的單挑。
公開的 baseline 有七個，會跟每個 baseline 打 BO5，每次是 20 個 round。額外還有 private 的 baseline，以及和其他學生寫的 agent 比賽的加分項目。
我一開始嘗試使用一些強化學習的方法，但真的完全 train 不起來，波動太大了，baseline 又跑很慢。
然後只好開始各種查資料，各種手寫 if-else 或 evaluating function 的工人智慧，又各種調參。
感覺已經花太多時間在上面了（大概兩個禮拜都純泡在上面），但後面的 baseline 真的很難達到六成以上的勝率，最後 final project 的分數還是得放下，看上帝擲骰子。我最後的成績是公開的 baseline 拿到 33/35，祕密 baseline 6/10，和同學對戰 6+0/10+4，以及 report 54/55。
最後發現雖然期中考考成那樣，但作業分數其實我都有拿到，可能其實也不需要那麼卷也能拿 A+。反正有盡力作到最好了。

## 計算機網路實驗
算是必修之一，計網實或計系實需要選一個修，前一個學期聽別人修計系實很累，所以這學期被問說要不要計網實組隊之後就答應了。

原本對計網實的印象可能跟網服搞混了，以為是一個做網頁的課。
這門課是老師講一點點課，然後主要是做三次的實驗以及做一個 final project。

三次實驗的主題分別是：防火牆+DHCP+NAT、Wireless AP 認證機制、IPv6 mobility。

不得不說，這些實驗真的非常老舊。現在都已經是 2024 年了卻還在用什麼 Ubuntu 16.04 或 14.04 之類的。
然後上課投影片看似會給你詳細步驟，但有時候你會遇到一些奇怪的問題，如果不是你漏了或是做錯什麼步驟，搞不好你把投影片往後翻幾頁就會看到一個 section 專門在講這些坑。當然我們自己也常常給自己一些奇怪的坑，例如 AP 插錯孔，windows 防火牆沒關，DHCP 動靜態 IP 設錯等等。再加上實驗幾乎都叫我們在 virtualbox 裡面做，各種用虛擬機會踩的坑也再踩一次。
實驗目標檢查的點或是 troubleshooting 的一些奇怪坑點也在在顯示這門課的實驗非常老舊。
例如實驗目標說要讓使用者有一個 wifi 使用時間上限，要檢查是不是會定時把人給踢出還有做倒數計時，我們在前端 JS 隨便放一個每次登入開始倒數計時十秒也算成功（照理說應該也要和後端查一下吧？）

Final project 基本上就是做一個月內做得出來的東西。雖然說「請同學結合本學期Lab 1、Lab 2、Lab 3 所學的技術開展期末專題。」，但我們在 proposal 的時候老師一開始理解成另一個方案，然後說這樣比較創新就這樣做。雖然我沒有覺得創新，但反正老師開心重要，我們最後也沒有跟前幾次 lab 有太大的關係，就基本上是我們分工寫一個有前後端的網頁架在 casper 家的機器上，最後是成功拿到 A+。

## 數學之美
以前沒有修過，雖然數美學分已經只能算通識了，但聽說這學期是老師最後一次開，也想說這學期該選點輕鬆的課。

感覺呂學一老師上這堂課的時候很開心，跟大家分享這些數學小知識的語氣都蠻高興的，還會到處走來走去點附近的同學回答問題（很簡單的問題或是開放式問題為接下來的東西鋪墊）。
上課主要的內容就是一些有趣的數學知識跟悖論，例如集合的 cardinality 或是實數是如何建構的，然後 hydra game 跟羅素悖論等等。
我第一次學到這些東西的時間應該是在高三修數學系微積分的時候吧？cardinality 記得是那時候助教課在黑板上講的，ZFC 則是某次跟 AY 吃拉麵的時候聽他有講一點。

跟往常的呂學一老師一樣會有一些你不上課/看投影片不會知道的老師自己發明的名字，例如死神悖論，咖啡牛奶問題或是海怪定理（指 hydra game 一定會結束）。

這次其中一個助教是 HWH，似乎在 Dcard 上評價不錯。

關於算分，沒有作業，有三次考試，每次會是十二題中挑最高的 X 題算分，X 會依照你的系所有沒有必修微積分調整，應該最高是十題。
有些證明是他會問你上課講的證明方法的細節，所以 either 是上課要稍微聽一下或是看投影片有沒有。
然後也有一些奇怪的背誦，例如問你 RSA 是哪三個名字的縮寫（Rivest, Shamir, Adleman），或是希爾伯特的二十三個問題的細節。
還會有一些選擇題例如像是「使圖論中 k-colorable 是 NP 困難的 k，目前已知最低是多少」或是「請問連續統假設在 ZFC 的前提下是一定正確/一定錯誤/都可以/未知」之類的問題。

考試的時候我幾乎都寫到最後，幾次都覺得自己寫得不夠嚴謹，但要再寫更嚴謹就得花更多時間或是紙不夠（把十二題分配在四頁的答案紙好難），所以有時候就只能留下一些自己覺得不太嚴謹的說明。

上課時用的數學其實也偶爾會有我覺得奇怪的地方，例如他解釋所謂死神悖論時定義了所謂 "recurrence" 函數 $c : [0, 1] \to \\{0, 1\\}$

$$
\begin{cases}
    D &=
    \\{ \frac{1}{2^n} : n \in \mathbb{Z}^+ \\}
    \\\\
    c(x) &=
    \begin{cases}
    1 & \text{if } x = 0 \\\\
    0 & \text{if } x \in D \land b(x) = 1 \\\\
    b(x) & \text{otherwise}
    \end{cases}
    \\\\
    b(x) &=
    \min \limits _ {y \in [0, x)} (c(x))
\end{cases}
$$

但這裡我覺得因為實數正常的大小關係不是 well-founded，講 recurrence 感覺有點奇怪。此外 $b$ 的 domain 不能包含 0，否則是對一個空集合取 min；然後 $b(x)$ 取 min 的範圍是一個半開區間，並不一定取得到最小值，是因為 $c(x)$ 的值域是離散的才有保證。

總之這門課可以學到一些沒什麼用但很有趣的數學小知識，如果是個常常在 youtube 上看這種東西的人可能會喜歡這門課。不知道之後會不會再開。

## 圖形演算法特論
kmchao 開的課，主要是在教一些圖論的性質跟演算法。特別會聚焦在樹上，並且主題基本上都是從他以前寫過的一些東西來的。
學期初一講完一些樹的基本性質還有最小生成樹、最短路徑樹之後，就開始講幾個 NP 困難的問題的 approximation。
這堂課是英文授課，並且老師的步調很慢，我期中考和期末考的知識主要都是讀他網站上給的 PDF 來的，再加上厚臉皮跟一些人問。分別都考了九字頭，吃競賽程式的老本。

這門課沒有作業，但是有分組的期末報告，需要選一篇論文做一個大約一小時的分享，論文主題應該主要是限制在圖論。
我們這組依成員看可能算競賽組，選到的論文是在證明某個遊戲的納許均衡的圖一定是一棵樹。果然我還是不太會啃論文，原本感覺應該大家先各自讀完，但是經過大家長導讀之後突然就到分工作環節，然後我也只有特別讀前情提要跟我被分到的部份（介紹一些 lemma）。
因為是英文授課，也有國外的學生，所以我們需要用英文報告，我還蠻緊張的，不過最後我覺得我們報得還可以，也許只是當天報告的另外幾組都讓我們感覺不出來他們在幹嘛。當然我猜可能我們也沒讓他們聽懂我們報告的這篇論文在幹嘛，畢竟要一小時內理解一篇論文也蠻難的。

## 結語
最後這個學期竟然同時是比 ICPC 跟 4.3 的學期。WF 佔用了大概一兩個禮拜的時間，然後我又一直拖延，WF 回來後各種工作和作業都一直在 queue 裡面彷彿處理不完，考試也沒讀精，從學期初開始就默默在我也一直沒做事的 NASA 簡直就是在說我能力不足的主旋律。
放暑假後以為自己要寄了的密碼導和 AI 導意外 A+，也要感謝各種組員，這學期有好多分組期末報告的課。
只有 14 學分似乎在排名上會輸，不過魚與熊掌不可兼得，就別想太多了。