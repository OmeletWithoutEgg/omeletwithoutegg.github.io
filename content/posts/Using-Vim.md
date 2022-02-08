---
title: Using-Vim
mathjax: true
date: 2020-07-08 01:15:12
tags: [vim, linux]
---

# vim ?!
vim : 古老的編輯器

## 來由
之前 ZCK 很早就開始一直推坑 vim ，而我大概是在開始瘋狂玩 OJDL 之後才開始使用 vim 的
因為在遠端 server 上改 code 最直接的方式就是使用遠端主機上的 vim 直接在 ssh 的介面改
所以經過幾個月(我也不知道具體多久)我大概熟悉 vim 了之後，在我的筆電上也裝了 gvim
因為是 windows 的所以用起來很怪，不過經過 Google 一些設定之後變得正常一些了
至於我的筆電呢，我覺得裝 linux 的必要性還沒有麻煩性高(X
而且感覺arch > Ubuntu但是裝了arch又會因為更新速度出現各種神奇的事件
所以姑且先不裝(?)

## 一些心得
我覺得 vim 的優點可能就是讓你可以只使用鍵盤編輯文件，
再來就是你可以依照自己的喜好更改 vimrc 或是安裝插件
此外記憶這些快捷鍵也是很有成就感的事情(?)
變魔法的快速鍵就跟突然講起德語或上古漢語一樣吸引人目光

## my vimrc
附上我自己的 vimrc
一開始我沒有裝任何插件，後來查到一篇使用 Vundle 的就去載了
最後跟風(?)改成用 vim-plug 管理所有插件
物色自己喜歡的插件真的很難，可能害我熬夜了好幾次QQ
不知道過了一段時間之後我的 vimrc 又會變成什麼樣子

```vim
set nocompatible
set encoding=utf8
set fileencoding=utf8

""" Plugins, use 'vim-plug' to manage plugins
call plug#begin('~/.vim/plugged')

Plug 'hzchirs/vim-material'
" Plug 'flazz/vim-colorschemes'
Plug 'itchyny/lightline.vim'
" Plug 'vim-airline/vim-airline'
Plug 'mhinz/vim-startify'

Plug 'tpope/vim-fugitive' " :G [option] for git commands
Plug 'preservim/nerdtree', { 'on': 'NERDTreeToggle' } " <F2> for toggle nerdtree
Plug 'Xuyuanp/nerdtree-git-plugin', { 'on': 'NERDTreeToggle' } " git status
Plug 'kien/ctrlp.vim', { 'on': 'NERDTreeToggle' } " <C-p> for found file

Plug 'tpope/vim-commentary' " gc for comment
" Plug 'yuttie/comfortable-motion.vim'
Plug 'joker1007/vim-markdown-quote-syntax'
" Plug 'octol/vim-cpp-enhanced-highlight'

call plug#end() 
" let c_no_curly_error=1 " enhanced highlight issue

""" GUI settings
if has('gui_running')
    au GUIEnter * simalt ~x " maximize window
    set guioptions-=m | set guioptions-=e | set guioptions-=T
    " menu | tab page | toolbar
    set guioptions-=L | set guioptions-=R | set guioptions-=l | set guioptions-=r
    " left scrollbar | right scrollbar | left scrollbar (split) | right scrollbar (split)
    set guifont=Microsoft\ Yahei\ Mono:h14 " for Windows
endif

""" Appearance
" startify#center(['VIM - Vi IMproved', 'JIZZZZZZZZZZZZZZZ', 'OmeletWithoutEgg'])
let g:startify_custom_header = []
let g:startify_bookmarks = ['~/_vimrc', 'D:/project/randgum', 'D:/C++', 'D:/blog']
" :h g:lightline.colorscheme
let g:lightline = {
    \   'colorscheme': 'materia',
    \   'active': { 'left': [ [ 'mode', 'paste' ], [ 'readonly', 'filename', 'modified', 'gitbranch' ] ] },
    \   'component_function': { 'gitbranch': 'FugitiveHead' }
    \ }
color vim-material
" color desert
au ColorScheme * hi Comment cterm=none gui=none | hi Search ctermfg=yellow guifg=yellow
" disable italic comment and enable highlight search color

""" Basic Configuration
syntax on
set nu rnu ai bs=2 et sw=4 sts=4 hls
set belloff=all laststatus=2
set cursorline noshowmode lazyredraw termguicolors
augroup rnutoggle
    au!
    au InsertEnter,InsertLeave * set rnu!
augroup END

""" Edit Mappings
inoremap <C-c> <Esc>
inoremap {<CR> {<CR>}<C-o>O
nnoremap ya :%y+<CR>
nnoremap <silent> <C-TAB> :tabn<CR>
nnoremap <silent> <C-S-TAB> :tabp<CR>
nnoremap <silent> <C-n> :tabnew<CR>:Startify<CR>
nnoremap <silent> <A-j> :m.1<CR>==
nnoremap <silent> <A-k> :m.-2<CR>==
vnoremap <silent> <A-j> :m '>+1<CR>gv=gv
vnoremap <silent> <A-k> :m '<-2<CR>gv=gv
vnoremap > >gv
vnoremap < <gv

nnoremap <silent> <F2> :cd %:h<CR>:NERDTreeToggle<CR>

""" Build Commands
au BufEnter *.cpp call CppFastBuild()
function CppFastBuild()
    nnoremap <F9> :w<CR>:!g++ % -o %:r -std=c++17 -Dlocal<CR>:!%:r<CR><CR>
    nnoremap <F10> :!%:r<CR><CR>
endfunction

au BufEnter *.py call PythonFastBuild()
function PythonFastBuild()
    nnoremap <F10> :w<CR>:cd %:h<CR>:!%<CR><CR>
    nnoremap <F8> :w<CR>:cd %:h<CR>:!cmd<CR><CR>
endfunction
```
順帶一提在windows的gvim底下的vimrc路徑是 `$HOME/_vimrc`

## 詳細解析!
為了推坑我用的所有東西我要來一一解釋他們的功能 owo

### Plugins
我使用[vim-plug](https://github.com/junegunn/vim-plug)來管理插件們
```vim
""" Plugins, use 'vim-plug' to manage plugins
call plug#begin('~/.vim/plugged')
    ...
call plug#end() 
```
用法非常簡單，而且自己用了什麼插件都一眼就能看出來，超棒的XD

#### Display
- [vim-material](https://github.com/hzchirs/vim-material)：我現在用的 colorscheme
- [vim-colorschemes](https://github.com/flazz/vim-colorschemes)：一個有很多 colorscheme 的 plugin，可以考慮從這裡開始物色喜歡的
- [lightline](https://github.com/itchyny/lightline.vim)：底下的狀態列，用起來就是潮
- [airline](https://github.com/vim-airline/vim-airline)：另一種狀態列，比較好看，但是對 windows 還是中文不友善所以我沒裝
- [startify](https://github.com/mhinz/vim-startify) 這超棒，讓你打開 vim 的時候會顯示最近的檔案，還有自訂 bookmark 跟 session 的功能(?)不過我還在摸索

#### Files and Git
在做專案的時候，樹狀目錄和git的功能肯定是不能少的
尤其是裝了 `nerdtree` 這個插件後根本就變成IDE的樣子了XDD
- [vim-fugitive](https://github.com/tpope/vim-fugitive)：似乎是增強一些 git 的功能
- [nerdtree](https://github.com/preservim/nerdtree)：可以在旁邊顯示樹狀目錄，做專案的時候頗有用
- [nerdtree-git-plugin](https://github.com/Xuyuanp/nerdtree-git-plugin)：如果檔案有被 git 管理會在 nerdtree 顯示 git 狀態
- [ctrlp](https://github.com/kien/ctrlp.vim)：尋找檔案的一個插件，不過我好像很少用
注意到後面我有加 `, { 'on': 'NERDTreeToggle' }` ，也就是說這些插件在我開啟 nerdtree 時才會被 load 到 vim 裡面

#### Misc (?)
- [vim-commentary](https://github.com/tpope/vim-commentary)：為程式碼加上註解的快捷鍵
- [comfortable-motion](https://github.com/yuttie/comfortable-motion.vim)：讓畫面在滑動的時候可以連續、平順的移動
- [vim-markdown-quote-syntax](https://github.com/joker1007/vim-markdown-quote-syntax)：可以幫 markdown 程式碼區塊上色，另外有一些 vim 跟 markdown 有關的插件不過我試用過後是覺得沒啥用處就刪掉了
- [vim-cpp-enhanced-highlight](https://github.com/octol/vim-cpp-enhanced-highlight)：幫 STL 容器等等更多 keyword 上色，不過我現在也沒開著這個功能。有一個括弧上色的錯誤還必須透過 `let c_no_curly_error=1` 來解決


### GUI settings
首先第一行可以讓我怎麼打開 vim 都會幫我最大化螢幕
因為我用的是 gvim ，所以預設會有一些選單和工具欄還有捲動條，我把他們全部禁用掉
另外設定字體也只有有 GUI 的 vim 才能設置，終端機的 vim 會直接是終端機介面的字型
我不太知道有什麼 windows 上包含中文的等寬字體，於是選用 Microsoft Yahei Mono ，英文是 Consolas 中文是雅黑體
```vim
if has('gui_running')
    au GUIEnter * simalt ~x " maximize window
    set guioptions-=m | set guioptions-=e | set guioptions-=T
    " menu | tab page | toolbar
    set guioptions-=L | set guioptions-=R | set guioptions-=l | set guioptions-=r
    " left scrollbar | right scrollbar | left scrollbar (split) | right scrollbar (split)
    set guifont=Microsoft\ Yahei\ Mono:h14 " for Windows
endif
```

### Appearance
```vim
" startify#center(['VIM - Vi IMproved', 'JIZZZZZZZZZZZZZZZ', 'OmeletWithoutEgg'])
let g:startify_custom_header = []
let g:startify_bookmarks = ['~/_vimrc', 'D:/project/randgum', 'D:/C++', 'D:/blog']
" :h g:lightline.colorscheme
let g:lightline = {
    \   'colorscheme': 'materia',
    \   'active': { 'left': [ [ 'mode', 'paste' ], [ 'readonly', 'filename', 'modified', 'gitbranch' ] ] },
    \   'component_function': { 'gitbranch': 'FugitiveHead' }
    \ }
color vim-material
" color desert
au ColorScheme * hi Comment cterm=none gui=none | hi Search ctermfg=yellow guifg=yellow
" disable italic comment and enable highlight search color
```
startify 最上面預設會顯示一隻不知道什麼生物說出隨機名人的名言，不過我覺得太占空間於是選擇都不顯示，另外也可以用任何自定義的文字或 ascii art。
startify 的書籤似乎有更好的使用方法，不過我目前是 hardcode 寫在這裡
lightline 超潮的，還可以跟 fugitive 配合一起用
我的 colorscheme `vim-material` 的 C++ 註解是斜體的，會讓我模板的AC變得不好看所以我下面把它給取消；另外搜尋時預設是底線但我覺得太不清楚於是加上黃色凸顯搜尋結果
順帶一提 `au` 是 `autocmd` 的縮寫，`hi` 是 `highlight` 的縮寫， `color` 是 `colorscheme` 的縮寫

### Basic Configuration
```vim
syntax on
set nu rnu ai bs=2 et sw=4 sts=4 hls
set belloff=all laststatus=2
set cursorline noshowmode lazyredraw termguicolors
augroup rnutoggle
    au!
    au InsertEnter,InsertLeave * set rnu!
augroup END
```
這些設定是在終端機也可以用的(應該啦)
- `syntax on`：開啟 syntax highlight
- `set nu rnu`：分別是`number`跟`relativenumber`的縮寫，顯示絕對與相對行號
- `set ai`：autoindent，自動接續上一行縮排。雖然似乎檔名是 cpp 的話就會好好幫你自動縮排
- `set bs=2`：等價於`set backspace=indent,eol,start`，讓 backspace 可以刪除換行、自動產生的縮排還有在進入該次 insert mode 之前打的字
- `set et sw=4 sts=4`：等價於`set expandtab shiftwidth=4 softtabstop=4`，因為我習慣讓所有縮排從 tab 變成 4 個空白
- `set hls`：在搜尋的時候能夠高亮度凸顯
- `set belloff=all`：關掉錯誤時的鈴聲
- `set laststatus=2`：顯示狀態列
- `set cursorline`：在當前游標那一行上色
- `set noshowmode`：因為 lightline 已經有顯示目前模式所以不需要再額外顯示目前模式
- `set lazyredraw`：有些 macro 執行會有點雜亂所以讓他先執行完再顯示最後結果就好
- `set termguicolors`：原本是想讓終端機也能好好上色，不過我好像不可能會在 windows 上用終端機的 vim XD
最後的 `augroup` 是我希望在 insert mode 和其他模式下分別會顯示絕對行號和相對行號

### Mappings
```vim
inoremap <C-c> <Esc>
inoremap {<CR> {<CR>}<C-o>O
nnoremap ya :%y+<CR>
```
因為 esc 離我太遠了所以我最近開始用 `Ctrl+C` 代替，不過它不會被幫我執行切換絕對與相對行號的 `autocmd` 偵測到，所以我又跑去 map 它
在一些嘗試之後我發現只有大括弧的補全我延續得比較順手以及美觀，我設定在上大括弧後若換行則會補上下大括弧並在中間插入一行
在打 CF 的時候常常會用到全選但是四個字的指令讓人很急所以我 map `ya` 當作全選

```vim
nnoremap <silent> <C-TAB> :tabn<CR>
nnoremap <silent> <C-S-TAB> :tabp<CR>
nnoremap <silent> <C-n> :tabnew<CR>:Startify<CR>
```
這三個是關於開新分頁，我在 code::blocks 和 chrome 都習慣會切分頁
另外我發現 startify 很適合放在新增一個分頁的時候

```vim
nnoremap <silent> <A-j> :m.1<CR>==
nnoremap <silent> <A-k> :m.-2<CR>==
vnoremap <silent> <A-j> :m '>+1<CR>gv=gv
vnoremap <silent> <A-k> :m '<-2<CR>gv=gv
vnoremap > >gv
vnoremap < <gv
```
這些是我從 code::blocks 帶來的習慣，我常常把一行或一塊程式碼上下拉，或者增加/減少縮排等等

```vim
nnoremap <silent> <F2> :cd %:h<CR>:NERDTreeToggle<CR>
```
我讓 F2 是開啟當前檔案的樹狀目錄的快捷鍵

### Build Commands
身為一個前 code::blocks 使用者，快速編譯是不可少的
在前面加了 `:w` 讓我不用按存檔再編譯
自定義這些鍵位真舒服
```vim
au BufEnter *.cpp call CppFastBuild()
function CppFastBuild()
    nnoremap <F9> :w<CR>:!g++ % -o %:r -std=c++17 -Dlocal<CR>:!%:r<CR><CR>
    nnoremap <F10> :!%:r<CR><CR>
endfunction

au BufEnter *.py call PythonFastBuild()
function PythonFastBuild()
    nnoremap <F10> :w<CR>:cd %:h<CR>:!%<CR><CR>
    nnoremap <F8> :w<CR>:cd %:h<CR>:!cmd<CR><CR>
endfunction
```

## 結語
一個完全客製化的編輯器真的頗吸引人，不過有時候還是得妥協的地方
找插件找超久不如改變自己的習慣或是 vimrc 來解決問題(或者解決提出問題的人XD)
另外最近好久沒發文，好廢喔，不知道下一篇題解會什麼時候出現(?)
