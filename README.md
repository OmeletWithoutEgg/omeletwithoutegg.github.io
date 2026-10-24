# 蛋餅的競程隨筆

[Link Here](https://omeletwithoutegg.github.io/)

這是我的個人部落格，裡面可能會放一些題目的題解
可能沒有那麼常更新QAQ

網頁原本是用 hexo，現在是以 Hugo 用 cactus theme 生成
另外我還加了 canvas.js 當作背景，不過希望不會讓讀者的瀏覽器太卡XD

## TODO

- [x] add dark mode toggle switch
- [x] disable JS 的時候 toggle switch 會有破綻
- [x] navbar 有時候會不見
    - 側邊的 TOC
    - [x] 修正文章選單收合後還是會擋到內文跟 tag 連結的問題
- [x] 把 pagination 移到文章列表上方，固定按鈕位置
    - pagination 按鈕改顏色，加上第一頁、最後一頁按鈕
- [x] 用 `hugo server -D` 預覽時，顯示淡色的 `DRAFT` 標記
- [ ] 改進搜尋功能
- [ ] 看要不要加 showReadTime
- 整理檔案架構（theme 跟 blog）
    - [X] 拆成 header、桌面／平板跟手機的 modules（丟給 LLM）
    - [x] theme 跟 blog 的 templates 遷移成 [新的 layout](https://gohugo.io/templates/new-templatesystem-overview/)
    - [ ] 把 theme 換成自己寫的
- markdown https://blog.nella17.tw/p/hello-hugo/#fnref:1
    - spoiler (?)
    - footnote
    - gist embeded
- https://gohugo.io/methods/page/gitinfo/
- elastic search
    - IK 分詞
    - https://www.youtube.com/watch?v=27Kp5Vfz40I
- pagespeed
- public key
