---
title: Sieving-Method
mathjax: true
date: 2019-12-24 12:41:46
tags: [WIP]
---
!待補QQ

# 質數篩與快樂的積性函數

想必大家都精通各種質數篩法，最簡單的$\mathcal{O}(n\sqrt{n})$就不提啦

## $n\log n$篩
``` cpp
for(int i = 2; i <= n; i++) {
	for(int j = i*2; j <= n; j+=i) {
		sieve[j] = 1;
	}
}
```
$\sum \frac{1}{i}$的調和級數是$\mathcal{O}(\log n)$量級的，故複雜度為$\mathcal{O}(n\log n)$
這個寫法也可以很簡單的統計每個數字的因數個數

``` cpp
for(int i = 1; i <= n; i++) for(int j = i; j <= n; j+=i) ++d[j];
```

其中 `d[i]` 代表 `i` 的因數個數
容易發現$\sum\limits _ {i=1}^n d[i]$也是$\mathcal{O}(n\log n)$量級的

## 埃式篩
``` cpp
for(int i = 2; i <= n; i++) if(!sieve[i] && 1LL*i*i <= n) {
	for(int j = i*2; j <= n; j += i) {
		sieve[i] = 1;
	}
}
```
所有質數的倒數和是$\mathcal{O}(\log\log n)$，因此複雜度是$\mathcal{O}(n\log\log n)$，而且常數頗小
另外對所有是合數的$n$來說，$n$的最小質因數$p$都不大於$\sqrt{n}$，因此只要從$p^2$開始篩就能保證所有合數被篩到


## 線性篩
線性篩的想法是想辦法讓範圍內的合數都只被其最小質因數篩到恰好一次

``` cpp
vector<int> primes;
for(int i = 2; i <= n; i++) {
	if(!sieve[i]) primes.push_back(i);
	for(long long p: primes) {
		if(i*p > n) break;
		sieve[i*p] = 1;
		if(i%p == 0) break;
	}
}
```
若$i \cdot p$的最小質因數不是$p$而是$q$，則$q | i$，由code可以發現一定在更之前的迴圈就跳出了
故這樣複雜度能夠保證是$\mathcal{O}(n)$

## 積性函數

!待補QQ
