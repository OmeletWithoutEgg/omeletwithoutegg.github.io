---
title: "BSUIR Cherry Orchard"
date: 2021-09-12T00:05:19+08:00
mathjax: true
tags: [math, geometry]
---

https://codeforces.com/problemset/gymProblem/101193/J

這題是上禮拜團練沒人寫的某一題，因為我一直覺得自己的想法是對的所以花了好久來寫這題。
網路上也找不太到題解:P

# Cherry orchard

## Description
左下角和右上角分別是 $(0,0)$ 和 $(1,1)$ 的正方形裡面有 $n$ 個點
現在隨機在正方形的兩條不同的邊各選一個點，並畫出一條直線把這 $n$ 個點分成兩部份。
請問兩部份中點數的 min 的期望值是多少？
$n \leq 50$

## Solution
有一個比較聰明的解與一個很複雜的解。先來講我一開始想到的比較複雜的解。

考慮枚舉所有點對，可以得到所有可能的分法（把點分成兩部份的方法），對於每種分法想辦法計算選到這種分法的機率。

先蓋好兩部份的凸包。枚舉隨機選到的其中一個點所在的邊 $E$ ，不失一般性可以當作他是正方形左邊那條邊。

假設我們已經選好上面一個點 $P$ ，那可以「和 $P$ 連成直線，把 $n$ 個點切成這兩個凸包」的 $Q$ 會是另一條邊上的一個範圍。
這個範圍和 $P$ 與兩個凸包的切線有關，可以枚舉兩個凸包的上下關係， $P$ 只會切到上面那個凸包的下凸包與下面那個凸包的上凸包。

$E$ 上可以分成 $\mathcal{O}(n)$ 個區間，每個區間內切到下凸包的點和切到上凸包的點是固定的。
接下來是最後也是最難的部份：對於 $P=(0,y)$ 來說，假設他切到上面那個凸包的 $A$、下面那個凸包的 $B$，那 $\overrightarrow{PA}$ 和 $\overrightarrow{PB}$ 中間的區域就是 $Q$ 可以在的區域，對於另外三條邊來說是一段區間，而這樣的區間左右界會是只跟 $y$ 有關的一個函數。
雖然他題敘沒有講清楚選中點的機率分佈是不是連續均勻分佈，但大概可以假設是，因此如果 $P=(0,y)$ 對應到的區間長度是 $f(y)$ ，最後的答案就是 $\int _ 0 ^ 1 f(y)$。

仔細計算之後可以發現：
對於對邊來說，區間左右界都是被截斷的線性函數，因此很好積分，只是要討論一下大小。
對於鄰邊來說，區間左右界都是被截斷的 $H+\frac{A}{x-K}$ ，考慮被截斷的範圍不可能包含 $K$ 因此也是可以簡單的積分成 $\log$ 之類的東西。
因為我不知道怎麼處理截斷（跟 $0,1$ 取 $\min,\max$）所以把所有討論都寫出來了，長到不行Orz
另外我有些地方現在看起來都是在讓code更醜，例如把所有座標乘 1000 倍再做事或是硬要用 `complex` 算計幾。

現在來講聰明的解！我是從 binsjl 的 submission 大概理解的，所以也可能有錯
先選定一個邊 $E$，一樣可以假設他是正方形左邊那條邊，那麼我們可以算出「所有點對形成的直線」以及「右上右下兩個點與所有點形成的直線」和 $E$ 交點，把 $E$ 分成 $\mathcal{O}(n^2)$ 個區間。
對於一個區間來說，隨便選定裡面一個點當作原點 $O$，把給定的 $n$ 個點極角排序順序都是一樣的。
真的隨便選定一個點當原點極角排序之後，可以得出在這個區間內如果選定了 $P=(0,y)$，對應的另一條邊的區間長度的函數長怎樣，一樣跑去積分就可以了，似乎邊界條件還自動被解決了，一整個短到驚訝(?)

## AC code
因為是比較複雜的那個解，所以醜的不像話。

```cpp
// An AC a day keeps the doctor away.  #pragma GCC optimize("Ofast")
#include <bits/stdc++.h>
#ifdef local
#define safe std::cerr<<__PRETTY_FUNCTION__<<" line "<<__LINE__<<" safe\n"
#define debug(args...) qqbx(#args, args)
#define orange(args...) danb(#args, args)
using std::cerr;
template <typename ...T> void qqbx(const char *s, T ...args) {
    int cnt = sizeof...(T);
    ((cerr << "\e[1;32m(" << s << ") = ("), ..., (cerr << args << (--cnt ? ", " : ")\e[0m\n")));
}
template <typename T> void danb(const char *s, T L, T R) {
    cerr << "\e[1;32m[ " << s << " ] = [ ";
    for (int f = 0; L != R; ++L) cerr << (f++ ? ", " : "") << *L;
    cerr << " ]\e[0m\n";
}
#else
#define safe ((void)0)
#define debug(...) ((void)0)
#define orange(...) ((void)0)
#endif // local
#define all(v) begin(v),end(v)

using namespace std;

using ld = long double;
using Point = complex<int>;
using Pointf = complex<ld>;
const ld eps = 1e-9;
const int C = 1000;
const long long INF = 1e18;

template <typename T> vector<T> join(const vector<T> &A, const vector<T> &B) {
    vector<T> result(A.size() + B.size());
    merge(A.begin(), A.end(), B.begin(), B.end(), result.begin());
    return result;
}
template <typename T>
T dot(complex<T> a, complex<T> b) {
    return real(conj(a) * b);
}
template <typename T>
T cross(complex<T> a, complex<T> b) {
    return imag(conj(a) * b);
}

ld solve(vector<Point> p);
mt19937 rng(2103);
ld naive(vector<Point> _p) {
    vector<Pointf> p;
    for (auto pt: _p) p.emplace_back(real(pt), imag(pt));
    struct Line {
        Pointf st, dir;
        Line (Pointf A, Pointf B) : st(A), dir(B - A) {}
        Pointf random() const {
            ld x = uniform_real_distribution<ld>(0, 1)(rng);
            return st + dir * x;
        }
    };
    static Line lines[] = {
        Line(Pointf(0, 0), Pointf(0, C)),
        Line(Pointf(0, C), Pointf(C, C)),
        Line(Pointf(C, C), Pointf(C, 0)),
        Line(Pointf(C, 0), Pointf(0, 0))
    };
    const int EX = 1000000;
    int ans = 0;
    for (int i = 0; i < EX; i++) {
        int a, b;
        do {
            a = uniform_int_distribution<int>(0, 3)(rng);
            b = uniform_int_distribution<int>(0, 3)(rng);
        } while (a == b);
        Pointf A = lines[a].random();
        Pointf B = lines[b].random();
        int ac = 0, cc = 0;
        for (auto pt: p) {
            ld C = cross(pt - A, B - A);
            if (C < 0)
                ++ac;
            else if (C > 0)
                ++cc;
        }
        ans += min(ac, cc);
    }
    return ans / ld(EX);
}

signed main() {
    ios_base::sync_with_stdio(0), cin.tie(0);
    int n;
    cin >> n;
    vector<Point> p(n);
    for (int i = 0; i < n; i++) {
        ld x, y;
        cin >> x >> y;
        p[i] = Point(round(x * C), round(y * C));
    }
    debug(naive(p));
    Point center(500, 500);
    ld ans = 0;
    for (int dir = 0; dir < 4; dir++) {
        ans += solve(p);
        for (auto &pt: p)
            pt = (pt - center) * Point(0, 1) + center;
    }
    ans /= 12;
    cout << fixed << setprecision(10) << ans << '\n';
}

ld solve(vector<Point> p) {
    int n = p.size();

    sort(p.begin(), p.end(), [](Point &a, Point &b) {
        return make_pair(real(a), imag(a)) < make_pair(real(b), imag(b));
    });

    vector<pair<vector<int>, vector<int>>> part;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            Point N = p[j] - p[i];
            vector<int> online[2], halfplane[2];
            bool ok = true;
            for (int k = 0; k < n; k++) {
                Point prod = conj(N) * p[k];
                if (prod.imag() < cross(N, p[i])) {
                    halfplane[0].push_back(k);
                } else if (prod.imag() > cross(N, p[i])) {
                    halfplane[1].push_back(k);
                } else if (prod.real() <= dot(N, p[i])) {
                    online[0].push_back(k);
                } else if (prod.real() >= dot(N, p[j])) {
                    online[1].push_back(k);
                } else {
                    ok = false;
                    break;
                }
            }
            if (!ok)
                continue;
            part.emplace_back(join(online[0], halfplane[0]), join(online[1], halfplane[1]));
            part.emplace_back(join(online[0], halfplane[1]), join(online[1], halfplane[0]));
        }
    }
    for (auto &[f, s]: part) {
        if (f > s)
            swap(f, s);
    }
    sort(part.begin(), part.end());
    part.erase(unique(part.begin(), part.end()), part.end());

    safe;

    const auto buildConvexHull = [](const vector<Point> &d) {
        if (d.size() == 1)
            return d;
        vector<Point> s(d.size() * 2);
        int o = 0;
        for(int i = 0; i < int(d.size()); i++) {
            while(o>=2 && cross(d[i]-s[o-2],s[o-1]-s[o-2]) <= 0)
                o--;
            s[o++] = d[i];
        }
        for(int i=int(d.size())-2, t = o+1;i>=0;i--){
            while(o>=t && cross(d[i]-s[o-2],s[o-1]-s[o-2]) <= 0)
                o--;
            s[o++] = d[i];
        }
        s.resize(o-1);
        return s;
    };

    const auto calc = [](vector<Point> L, vector<Point> R) {
        const auto getUpperHull = [](vector<Point> & P) {
            assert (!P.empty());
            auto it = min_element(P.begin(), P.end(), [](Point a, Point b){ return real(a) != real(b) ? real(a) < real(b) : imag(a) > imag(b); });
            rotate(P.begin(), it, P.end());
            auto jt = max_element(P.begin(), P.end(), [](Point a, Point b){ return real(a) != real(b) ? real(a) < real(b) : imag(a) < imag(b); });
            // debug(P.size(), jt - P.begin());
            P.erase(next(jt), P.end());
        };
        const auto getLowerHull = [](vector<Point> & P) {
            assert (!P.empty());
            reverse(P.begin(), P.end());
            auto it = min_element(P.begin(), P.end(), [](Point a, Point b){ return real(a) != real(b) ? real(a) < real(b) : imag(a) < imag(b); });
            rotate(P.begin(), it, P.end());
            auto jt = max_element(P.begin(), P.end(), [](Point a, Point b){ return real(a) != real(b) ? real(a) < real(b) : imag(a) > imag(b); });
            // debug(P.size(), jt - P.begin());
            P.erase(next(jt), P.end());
            reverse(P.begin(), P.end());
        };
        const auto interpolate = [](Point a, Point b, int x) -> ld {
            // real(a + (b-a)t) == x
            // t = (x - real(a)) / real(b-a)
            // imag(a + (b-a)t) = imag(a) + imag(b-a) * t
            ld t = (x - real(a)) / ld(real(b - a));
            return imag(a) + imag(b-a) * t;
            // return (imag(a) * (real(b) - x) + imag(b) * (x - real(a))) / ld(real(b) - real(a));
        };
        const auto intergral = [&interpolate](ld l, ld r, Point a, Point b) -> ld {
            l = clamp<ld>(l, 0, C);
            r = clamp<ld>(r, 0, C);
            if (l >= r)
                return 0;
            ld res1 = 0, res2 = 0;
            // linear
            do {
                ld tl = l, tr = r;
                ld A1 = 1 - C / ld(real(a)), B1 = C * imag(a) / ld(real(a));
                ld A2 = 1 - C / ld(real(b)), B2 = C * imag(b) / ld(real(b));
                if (real(a) == real(b)) {
                    if (B1 >= B2) {
                        break;
                    }
                } else if (A1 < A2) {
                    // (A2 - A1)y > B1 - B2
                    tl = max(tl, (B1 - B2) / (A2 - A1));
                } else if (A1 > A2) {
                    // (A1 - A2)y < B2 - B1
                    tr = min(tr, (B2 - B1) / (A1 - A2));
                } else {
                    exit(3);
                }
                {
                    // 0 < A1y + B1 < A2y + B2 < C
                    // -B1 / A1 > y
                    ld R = min(tr, -B1 / A1);
                    // y > (C - B2) / A2
                    ld L = max(tl, (C - B2) / A2);
                    // (A2 - A1) y + (B2 - B1)
                    if (L < R)
                        res1 += (A2 - A1) * (R*R - L*L) / 2 + (B2 - B1) * (R - L);
                }
                {
                    // A1y + B1 < 0 < A2y + B2 < C
                    // y > -B1 / A1
                    // -B2 < A2y -> y < -B2 / A2
                    // y > (C - B2) / A2
                    ld L = max({ tl, -B1 / A1, (C - B2) / A2 });
                    ld R = min(tr, - B2 / A2);
                    if (L < R)
                        res1 += A2 * (R*R - L*L) / 2 + B2 * (R - L);
                }
                {
                    // 0 < A1y + B1 < C < A2y + B2
                    // y < -B1 / A1
                    // y > (C - B1) / A1
                    // y < (C - B2) / A2
                    ld L = max(tl, (C - B1) / A1);
                    ld R = min({ tr, -B1 / A1, (C - B2) / A2 });
                    if (L < R)
                        res1 += -A1 * (R*R - L*L) / 2 + (C-B1) * (R - L);
                }
                {
                    // A1y + B1 < 0 < C < A2y + B2
                    // y > -B1 / A1
                    // y < (C - B2) / A2
                    ld L = max(tl, -B1 / A1);
                    ld R = min(tr, (C - B2) / A2);
                    if (L < R)
                        res1 += C * (R - L);
                }
            } while (false);
            // non-linear
            do {
                // H + A / (X - K)
                ld L1 = real(a) * imag(a) / ld(C - real(a)) + imag(a);
                ld L2 = real(b) * imag(b) / ld(C - real(b)) + imag(b);
                ld tl = l, tr = r;
                if (real(a) == real(b)) {
                    if (imag(a) >= imag(b))
                        break;
                } else if (real(a) < real(b)) {
                    tl = max(tl, interpolate(a, b, 0));
                } else if (real(a) > real(b)) {
                    tr = min(tr, interpolate(a, b, 0));
                }
                ld H1 = real(a), A1 = real(a) * imag(a), K1 = imag(a);
                ld H2 = real(b), A2 = real(b) * imag(b), K2 = imag(b);
                // y <= L1 && y <= L2 -> C - C
                {
                    // y > L1 && y > L2
                    ld L = max({ tl, L1, L2 });
                    ld R = tr;
                    // H1 + A1 / (X - K1) < H2 + A2 / (X - K2)
                    // H1 (X-K1)(X-K2) + A1(X-K2) < H2(X-K1)(X-K2) + A2(X-K1)
                    if (L < R)
                        res2 += (H2 - H1) * (R - L) + A2 * (log(R - K2) - log(L - K2)) - A1 * (log(R - K1) - log(L - K1));
                }
                {
                    // C - (H1 + A1 / (X - K1))
                    // y > L1 && y < L2
                    ld L = max(tl, L1);
                    ld R = min(tr, L2);
                    if (L < R)
                        res2 += (C - H1) * (R - L) - A1 * (log(R - K1) - log(L - K1));
                }
                {
                    ld L = max(tl, L2);
                    ld R = min(tr, L1);
                    assert (L >= R);
                }
            } while (false);
            ld res = res1 + res2 * 2;
            return res / (C * C);
        };
        getUpperHull(L);
        getLowerHull(R);
        // orange(all(L));
        // orange(all(R));
        int n = L.size(), m = R.size();
        vector<pair<ld,bool>> evt;
        for (int i = 0; i+1 < n; i++) {
            ld y = interpolate(L[i], L[i+1], 0);
            if (i)
                assert (y >= evt.back().first);
            evt.emplace_back(y, 0);
        }
        for (int i = 0; i+1 < m; i++) {
            ld y = interpolate(R[i], R[i+1], 0);
            if (i)
                assert (y >= evt.back().first);
            evt.emplace_back(y, 1);
        }
        sort(evt.begin(), evt.end());
        int it = 0, jt = 0;
        ld last = -INF, res = 0;
        for (auto [y, type]: evt) {
            res += intergral(last, y, L[it], R[jt]);
            last = y;
            if (type == 0) {
                ++it;
            } else {
                ++jt;
            }
        }
        res += intergral(last, INF, L[it], R[jt]);
        return res;
    };

    ld res = 0;
    for (const auto &[f, s]: part) {
        vector<Point> L, R;
        for (int id: f) L.push_back(p[id]);
        for (int id: s) R.push_back(p[id]);
        L = buildConvexHull(L);
        R = buildConvexHull(R);
        res += (calc(L, R) + calc(R, L)) * min(f.size(), s.size());
    }
    return res;
}
```

