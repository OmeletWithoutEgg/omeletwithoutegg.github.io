---
title: "Fzf fuzzy finder - best shell history picker"
date: 2022-09-08T21:26:22+08:00
draft: false
mathjax: true
tags: [arch, linux, vim]
---

# FZF fuzzy finder

`fzf` 是一個通用的模糊搜尋（fuzzy find）工具，用 go 寫成。
很久以前就聽過它了，但以為自己不太需要這種東西。

前陣子在尋找類似於 [zsh-history-substring-search](https://github.com/zsh-users/zsh-history-substring-search) 的工具，也就是我可以打一些關鍵的字之後讓 zsh 從歷史紀錄裡面找類似的指令幫我貼到 shell 裡面。

而這個功能我認為我目前找到用起來最順手的就是 `fzf` 的 history widget 了。

## 安裝

可以用 linux distro 提供的 package manager 安裝

```bash
sudo pacman -S fzf
```

```bash
sudo apt-get install fzf
```

```bash
brew install fzf
```

或者也可以透過 vim 的 plugin manager 作為一個 vim 的 plugin 安裝。

```vim
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
```

（我個人比較不喜歡這樣的方法）

要在 shell 當中使用以下提到的快捷鍵的話，你必須在 `.bashrc/.zshrc` 當中 source 由你選擇的安裝方法提供的 keybind script。
以 Archlinux 來說會被放在 `/usr/share/fzf/key-bindings.zsh`，而用 `vim` 安裝的應該會放在 `~/.fzf.zsh` 之類的。

## 簡單用法

`fzf` 比較一般化的用法是用別的程式的輸出 pipe 到 `fzf`，然後 `fzf` 會跳出一個 TUI 介面讓我們模糊搜尋，按下 enter 應該等於是選擇該行項目，會被印到標準輸出當中。
例如 `curl XXXXX.content.pkg | fzf` 之類的，就會把使用者在 `fzf` 選定的選項用標準輸出印出來。

## history widget
按 `CTRL+R` 用 `fzf` 會由新到舊列出打過的指令，可以打一些字過濾指令或是用 `CTRL+J/CTRL+K` 上下移動
然後按 Enter 就會把該條指令貼到 shell prompt。

## CTRL-T widget
模糊搜尋當前目錄的所有檔案（遞迴尋找）
使用情境：例如 `vim XXX` 突然不知道要開什麼的話

## ALT-C widget
用 `fzf` 切換到當前目錄以下的目錄（遞迴尋找）

## double asterisk
在任何指令中（通常是在打路徑時）填入兩個星號再按 tab 就就會用 `fzf` 嘗試自動完全成或是補全大部分。

# 結語
推薦大家都 `fzf` 因為這真的是一個很有料的 CLI app，而且他的 history widget 應該是我體驗過蠻好的歷史補全的東西。
一個小缺點就是他的 history widget ，沒有 syntax highlight 而且我在 `fzf` 的自訂 keybind 中 accept/abort 會有些小 bug。
寫這篇時很想睡覺歡迎抓錯字或是亂寫…
