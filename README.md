页面： 
http://www.theguardian.com/politics/2015/may/28/david-cameron-sets-off-on-mission-to-win-over-european-leaders

我们希望你能写一个 Chrome 插件，这个插件能实现下面几个功能：

1. 当前的页面内容太多，我们希望你能将除了正文之外的（标题和新闻配图需要保留）其他内容过滤掉。 我们不需要你针对每一篇文章都能实现广告过滤，这可能需要相当长的时间。 我们的要求是当前这篇文章。 但如果能在每个页面都能实现，会有很多加分。

2. 因为这个页面特别长，不适合在小屏幕上直接阅读，需要拖动。 我们希望你能根据屏幕的大小进行分页， 通过显示不同的页码可以去到不同的页面，鼠标点击即可。 注意，页面中图片需要保留。需要适配不同的屏幕，我们希望你能做好屏幕匹配测试。

3. 我们希望你的插件能通过扇贝的 API 来实现查词。 具体做法是，点击页面上任何一个单词，可以在弹出框里显示单词的发音和含义，点击喇叭可以发音。 弹出框应当在单词的边上，不要离开的太远。用户点击的时候，单词可能会出现在边界 （Top， right， bottom ，left），我们希望你能正确处理弹出框的位置。 扇贝的 API 请自行到扇贝网网站查找。 

在你的开发过程中，我们希望你能全程使用 git 进行版本控制，并且把项目放在你的 github 上，等到作业完成的时候，直接把 github repo 地址发给我即可。

最后，提交给我们的作业应当包含：一个可以直接开发模式下安装的插件，以及你的全部代码。