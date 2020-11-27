---
title: Fast-IO
date: 2019-12-06 11:16:37
tags: [template, tutorial, fread]
---
# 常用的輸入(出)優化

## cin / cout
因為C++ template的性質，不同變數型別的輸出方式都大同小異，算是實用
競程的時候記得開下面兩個東西

``` cpp
ios_base::sync_with_stdio(0), cin.tie(0);
```

開了之後就不要使用 stdio 裡面的東西啦
另外若非互動題也不要使用 `endl` 之類會flush的函式，請用 `'\n'` 代替

## scanf / printf
常用的也就那些

``` cpp
#include <cstdio>
int main() {
	int x,y;
	long long L;
	scanf("%d%d%lld", &x, &y, &L);
	printf("%lld\n", x+y+L);
	char s[100];
	scanf("%s", s);
	for(int i = 0; s[i]; i++) s[i] = (s[i]-'a'+1)%26+'a';
	printf("%s\n", s);
}
```

值得注意的是 iostream 的空間有點大，所以想要壓空間用 stdio 就對了
另外 `printf` 格式化輸出也常常會在毒瘤題派上用場XD，例如TIOJ 1845

## getchar
`scanf` 和 `cin` 都判了很多case(的感覺)
對於競賽中固定的輸入格式，自己用 `getchar()` 一個一個字元讀比較快

``` cpp
#include <cstdio>
inline int nextint() {
	int x = 0, c = getchar(), neg = false;
	while(('0' > c || c > '9') && c!='-' && c!=EOF) c = getchar();
	if(c == '-') neg = true, c = getchar();
	while('0' <= c && c <= '9') x = x*10 + (c^'0'), c = getchar();
	if(neg) x = -x;
	return x; // returns 0 if EOF
}
```

要印出數字用 `printf` 就好，如果必須輸出很多可以先存到陣列最後再一起印出，輸出似乎不常成為瓶頸。

## fread
快! 還要更快! 如果輸入非常多的時候，我們可以把getchar改成

``` cpp
inline char readchar() {
	const int S = 1<<20; // buffer size
	static char buf[S], *p = buf, *q = buf;
	if(p == q && (q = (p=buf)+fread(buf,1,S,stdin)) == buf) return EOF;
	return *p++;
}
```

原理可能是自己實現緩衝區，對檔案的讀寫一次做多一點會比較快吧
這個超有感， `1e7` 左右的輸入只要不到50ms，有夠扯，例如TIOJ 1093

## unlocked
有些可以在後綴加上unlocked加速的樣子，可是我常常感覺不到有快多少(?)

```
getchar() -> getchar_unlocked()
putchar() -> putchar_unlocked()
fread() -> fread_unlocked()
```
