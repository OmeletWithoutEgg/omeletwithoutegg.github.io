---
title: "Vim-fern"
date: 2025-03-10T23:21:06+08:00
draft: false
mathjax: true
tags: [vim, linux, experience]
---

# 推銷 vim-fern

推銷用 [vim-fern](https://github.com/lambdalisue/vim-fern) 取代 NERDTree。我大概是 2023 年初換掉的，現在想說來寫個推銷 post。
那時候會想要改用 vim-fern 有幾點原因：
- 看到 NERDTree 好像要停止更新了的[通知](https://github.com/preservim/nerdtree/issues/1280)。那時候 NERDTree 非常 inactive。
- 偶爾就會踩到一些怪怪的情況（忘記是什麼了）
- 那時候在玩 nvim，想要在 nvim 和 vim 兩棲，而大部分查到的 nvim 套件 [nvim-tree.lua](https://github.com/nvim-tree/nvim-tree.lua)、[neo-tree.nvim](https://github.com/nvim-neo-tree/neo-tree.nvim)、[chadtree](https://github.com/ms-jpq/chadtree) 都不能在 vim 使用。
- 原本用 NERDTree 在 startify 的頁面沒有顏色，而在 file explorer 有

換去 vim-fern 之後，覺得有以下幾點優點：
- 好看（？）反正就是看起來蠻現代的，而且搭配 `fern-renderer-nerdfont.vim` 一樣可以有 icon，再配合 `glyph-palette.vim` 一樣可以有有顏色的 icon。
- nvim 和 vim 的界面可以一致
- 當游標在一個檔案上面的時候，可以按大寫 `R` 改名，改名會開另一個可以像普通文字一樣編輯的 buffer，而不是在 cmd 那一行只能 backspace 不然就是要用一些不一樣的快捷鍵。
- 當游標在一個檔案上面的時候，可以按小寫 `x` 打開
- 速度蠻快的：在 NERDTree 上面開比較大的 directory 會有有感的延遲，感覺 vim-fern 有改進。
- 我不確定以上 feature 在 NERDTree 裡面有沒有，但至少我可以在 vim-fern 的 buffer 裡面按 `?` 來簡單的看到 cheatsheet 知道可以做什麼動作。

節錄一下 vimrc 相關的部份。
```vim
Plug 'hzchirs/vim-material'
Plug 'itchyny/lightline.vim'
Plug 'mhinz/vim-startify'

Plug 'lambdalisue/fern.vim'
Plug 'lambdalisue/fern-git-status.vim'
Plug 'lambdalisue/fern-hijack.vim'
Plug 'lambdalisue/fern-renderer-nerdfont.vim'
Plug 'lambdalisue/nerdfont.vim'
Plug 'csch0/vim-startify-renderer-nerdfont'
Plug 'lambdalisue/glyph-palette.vim'

nnoremap <silent> <space>e :Fern . -drawer -toggle<CR>
function s:custom_glyph_palette()
  " hi GlyphPalette0 " black
  hi GlyphPalette1 guifg=#FF5370 " red
  hi GlyphPalette2 guifg=#C3E88D " green
  hi GlyphPalette3 guifg=#FFCB6B " yellow
  hi GlyphPalette4 guifg=#89DDFF " blue
  " hi GlyphPalette5 " magenta
  hi GlyphPalette6 guifg=#82AAFF " cyan
  hi GlyphPalette7 guifg=#FFFFFF " white
  " tips: :call glyph_palette#tools#show_palette()
endfunction
augroup my_glyph_palette
  autocmd!
  autocmd ColorScheme * call <SID>custom_glyph_palette()
  autocmd FileType fern,startify call glyph_palette#apply()
augroup END
let g:fern#renderer = 'nerdfont'
augroup fern_custom
  autocmd!
  autocmd FileType fern setlocal nonu nornu
augroup END

augroup hide_vertsplit_background
  autocmd!
  autocmd ColorScheme * hi VertSplit cterm=NONE
augroup END

set fillchars=vert:│
```

---

因為懶得寫另外一篇文章，就順便列前一篇文章沒有列到但我現在覺得不錯用的 plugins。

```vim
Plug 'tpope/vim-surround'
Plug 'tpope/vim-commentary' " gc for comment
Plug 'suy/vim-context-commentstring'
Plug 'tpope/vim-repeat'
Plug 'editorconfig/editorconfig-vim'
```
