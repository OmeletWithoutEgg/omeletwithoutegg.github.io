---
title: bamboofox-ctf
mathjax: true
date: 2020-01-02 15:00:23
tags: [CTF, experience]
---
這次打跨年CTF應該是我第一次打一個正常的CTF吧（？）
感覺好多有趣的題目www
https://ctf.bamboofox.cs.nctu.edu.tw/

# Solved Problems
## Welcome
Joy說看題目給的影片就有flag了
## Web newbie
被作業解掉，好像往source code的註解裡面找就對了
## Land-1
良心題
直接copy全國模擬賽的code，送我們這些有打的人免費分數
Land-2碰了好久一直CE，QQ
## I can't see you
給了一個 `what.rar` ，Joy說不知道密碼不過丟到網路上某個工具就解開了XD(密碼是blind，聽說有人直接猜出來)
之後會看到一張白底有黑點的圖片，對照盲人點字可以拿到flag
## How2decompyle
題目給了一個沒有副檔名的檔案
因為題目名稱裡面有py，嘗試把他丟到google找到的decompyler之類的東西?
不過因為沒有副檔名他不吃，他只吃.py和.pyc(這時我們才知道我們大概拿到.pyc，是byte code XDD)
於是改副檔名再丟一樣的地方就得到原始的.py檔了
讀一下發現怎麼讓他跑出flag之後跑一跑就AC了(?)
## Happy New Year
賽中新增的題目，直接給flag ww
## Tree
作業丟給我的(?)
解壓縮他給的檔案之後發現看起來很欠DFS，確定葉節點是檔案可以直接讀之後就想寫個DFS
不過shell的遞迴我不會，想說用python，不過還是要查套件:(，爛死
``` python
from os import chdir
from glob import glob

def dfs(s):
	s = s[0]
	#print('s = ', s)
	typ = s[-1]
	#print(typ)
	if typ == '+':
		return dfs(glob(s+"/0_*")) + dfs(glob(s+"/1_*"))
	if typ == 'x':
		return dfs(glob(s+"/0_*")) * dfs(glob(s+"/1_*"))
	if typ == 'r':
		#print('path = ', s)
		return int(open(s).read())
for i in range(37):
	chdir("flag["+str(i)+"]/")
	print(chr(dfs(glob("0_*"))), end = '')
	chdir("..")
```
## AlphaGO
題目給了一張圖片，是一張棋盤，上面有一些位置有不同字元
還有一個奇怪的Hint，不過看不懂
和Joy討論之後我丟出是不是「依照AlphaGo某場比賽下子順序看棋盤上的字元」的想法
Joy就把他給AC了XD，通靈死
## oracle
蠻早看這題的，不過靠自己真的想不出來QQ
他有給server.py，所以我們知道他server跑的東西是RSA
可以做兩件詢問: 問flag加密後的東西和n、問一個密文C解密之後的明文mod 3的餘數
並且每次連線的n都會是固定的

解法蠻數學的，參考
https://ctf-wiki.github.io/ctf-wiki/crypto/asymmetric/rsa/rsa_chosen_plain_cipher-zh/#rsa-byte-oracle
``` python
#!/usr/bin/env python3
from Crypto.Util.number import *
import os
import sys
import socket
from fractions import Fraction

host = "34.82.101.212"
port = 20001

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host, port))
print('connect success')

def ask(C):
	s.send(bytes('2\n','utf-8'))
	_ = s.recv(1024)
	s.send(bytes(f'{C}\n','utf-8'))
	raw = s.recv(1024).split()
	#print(raw)
	return int(raw[2])

def main():
	print('main start')
	_ = s.recv(1024)
	s.send(bytes('1\n','utf-8'))
	raw = s.recv(1024).split()
	C = int(raw[2]); N = int(raw[5])
	#exit()

	mp = {}
	for i in range(3):
		mp[-N * i % 3] = i
	ciph3 = pow(3, 65537, N)

	L = Fraction(0, 1)
	R = Fraction(N, 1)
	while R-L > 0.01:
		C = C * ciph3 % N
		K = mp[ask(C)]
		I = (R-L)/3
		L = L + I*K
		R = L + I
		print(L, R)
	print(round(L))
	print(round(R))
	# L,R is plain text

main()
```
這樣就可以得到一個整數
6345976407505107785691848974596122250401442742754095997
然後這邊有三個蠢錯誤
1. 不會用python的os套件，而且忽略了UX的輸出
2. 一開始用浮點數搜尋，搜出來好幾次都不一樣XDD(而且每次都超久，要詢問近700次左右)，後來發現大家都寫分數就直接用分數了...天真的以為python的浮點數能處理300多位
3. 本來丟到網路上轉hex的東西是爛的QQ，用python才得到
```` python
>> hex(6345976407505107785691848974596122250401442742754095997) =
'0x42414d424f4f464f587b53696d506c45305241436c337d'
````
然後就很明顯是兩個一組的ascii了，丟到網路上轉ascii的東西得到flag

# 心得
好多用google的題目(X
而且也好多部分應該要是先備知識的我也一直google XDD
不過有解出題目感覺好有成就感（？）
最後三個人的成績是27名>w<開心
