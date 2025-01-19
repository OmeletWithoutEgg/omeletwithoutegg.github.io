---
title: "cmake: Could NOT find libxxx on Archlinux"
date: 2025-01-19T23:46:42+08:00
draft: false
mathjax: true
tags: [experience]
---

# 在 Archlinux 踩到的 CMake 坑

## Description

最近在修改 TIOJ，但一直沒辦法 native 的在 archlinux 上編譯 [tioj-judge](https://github.com/TIOJ-INFOR-Online-Judge/tioj-judge/)，只能用 docker 跑 ubuntu。於是今天就跳進這個坑裡研究為什麼。

節錄部份錯誤訊息
```
-- The C compiler identification is GNU 14.2.1
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Check for working C compiler: /usr/bin/cc - skipped
-- Detecting C compile features
-- Detecting C compile features - done
Build Type: Release
-- Found PkgConfig: /usr/bin/pkg-config (found version "2.3.0")
-- Checking for module 'libseccomp'
--   Found libseccomp, version 2.5.5
CMake Error at /usr/share/cmake/Modules/FindPackageHandleStandardArgs.cmake:233 (message):
  Could NOT find libseccomp (missing: LIBSECCOMP_LIBRARIES) (found version
  "2.5.5")
Call Stack (most recent call first):
  /usr/share/cmake/Modules/FindPackageHandleStandardArgs.cmake:603 (_FPHSA_FAILURE_MESSAGE)
  build/_deps/cjail-src/cmake/Findlibseccomp.cmake:57 (find_package_handle_standard_args)
  build/_deps/cjail-src/CMakeLists.txt:19 (find_package)
```

也就是說，他在抱怨 `find_library` 找不到 `libseccomp` 這個 library。但是我已經 `sudo pacman -S libseccomp` 了，而且 `/usr/lib/libseccomp.so` 也好好的存在。

`pkg-config` 用到的 `/usr/lib/pkgconfig/libseccomp.pc` 在 archlinux 和 ubuntu 上都是正常存在的，也正確的指向 `/usr/lib/`（在 ubuntu 24.04 上是 `/usr/lib/x86_64-linux-gnu/`）。
接著我跑去看 call stack 裡面的每個檔案用 `message(VAR=${VAR})` 印出來那些 variable，得知 `pkg-config` 的部份應該是有正確的把那些 path 傳給 `find_library`。

## Solution

真的浪費了我好久去 debug，錯誤訊息非常不清楚。最後找到問題的方法是在 `cmake` 參數加上 `-DCMAKE_FIND_DEBUG_MODE=ON`，然後我才發現那段 `find_library` 只搜尋 `.a` 檔案，也就是 static library。這是因為 TIOJ 有一個部份強制寫成靜態編譯，如下節錄所示。

```cmake
# force build with static because sandbox-exec
set(BUILD_SHARED_LIBS OFF)
set(CMAKE_FIND_LIBRARY_SUFFIXES ".a")
```

```cmake
# sandbox exec
# static link it to minimize memory usage; this will lead to some warnings about libc, but it is okay
add_executable(sandbox-exec "src/tioj/sandbox_main.cpp" "src/tioj/sandbox.cpp" "src/tioj/sandbox.h")
target_link_libraries(sandbox-exec CJail::libcjail)
target_compile_options(sandbox-exec PUBLIC -Os -static) # note that later flags will override previous ones
target_link_options(sandbox-exec PUBLIC -static -pthread -Wl,--gc-sections)
install(TARGETS sandbox-exec DESTINATION "${TIOJ_DATA_DIR}/")
```

Archlinux 的官方 repository 甚至於 AUR 一般來說都不提供靜態函式庫。這裡是一些我找到的相關資料。
- https://bbs.archlinux.org/viewtopic.php?id=96228
- https://bbs.archlinux.org/viewtopic.php?id=217335
- https://bbs.archlinux.org/viewtopic.php?id=223376

## Conclusion

所以這就是為什麼 `cmake` 失敗。最好的辦法應該是把 `CMakeLists.txt` 裡面取消靜態編譯。開發環境的不一致還真是麻煩，docker 真的拯救世界。
