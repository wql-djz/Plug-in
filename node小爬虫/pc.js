var http = require('https')
var fs = require('fs')
var url = 'https://book.qidian.com/info/1015697936#Catalog'//要爬取数据的网址
var cheerio = require('cheerio')
http.get(url, function (res) {
    var html = ''
    //on监听,回调函数在接收到之后执行这个回调函数
    res.on('data', function (chunk) {
        // console.log("数据开始加载");
        html += chunk
    });

    //所有信息传输完毕之后所执行的回调函数
    res.on('end', function () {
        console.log('数据加载完成');
        var $ = cheerio.load(html);//解析DOM字符串
        const bookname = ($('.book-info em').text()).match(/[\u4e00-\u9fa5]+/g);//获取到书名，将书的名称赋予文件夹
        if (!fs.existsSync('./book/' + bookname.toString())) {//判断文件夹是否存在
            fs.mkdirSync('./book/' + bookname.toString());//创建文件夹
        } else {
            fs.mkdirSync('./book/' + bookname.toString(), { recursive: true });//循环创建
        }

        $('.volume-wrap .volume:first-child a').each(function () {
            var Href = $(this).attr('href');//获取子页面网址
            var Title = $(this).text();//获取子页面名称
            // console.log(Title);
            // console.log(Href);
            http.get('https:' + Href, function (res) {
                var html = ''
                res.on('data', function (chunk) {
                    html += chunk
                });
                res.on('end', function () {
                    console.log("获取文本内容成功")
                    var $ = cheerio.load(html);//解析DOM字符串
                    let oText = $('div.read-content.j_readContent').text();//获取正文的主要内容
                    // console.log(oText)
                    fs.writeFileSync('./book/' + bookname.toString() + '/' + Title + '.txt', oText)
                })
            }).on('error', function (err) {
                //对程序意外错误进行处理
                console.log(err.message)

            })


        })
    })
})
