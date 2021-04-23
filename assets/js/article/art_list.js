$(function () {
    var layer = layui.layer;
    var form = layui.form;
    var laypage = layui.laypage;

    // 定义美化时间格式的过滤器-(用于模板引擎)
    template.defaults.imports.dateFormat = function (date) {
        const dt = new Date(date);

        var y = dt.getFullYear();
        var m = padZero(dt.getMonth() + 1);
        var d = padZero(dt.getDate());

        var hh = padZero(dt.getHours());
        var mm = padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ":" + ss;
    }



    // 定义一个查询的参数对象,将来请求数据的时候,需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值,默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据,默认每页显示2条
        cate_id: '', // 文章分类的Id
        state: '' //文章的发布状态
    }

    initTable();
    initCate();


    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败!');
                }
                // console.log(res);
                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res);
                // console.log(htmlStr);
                $('tbody').html(htmlStr);

                // 调用渲染分页的方法: 当表格被渲染完成后，就该渲染底部分页
                renderPage(res.total);
            }
        })
    }

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n;
    }

    // 获取文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类失败!')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res);
                // console.log(htmlStr);
                $('[name =cate_id]').html(htmlStr);
                // 通知layui重新渲染表单区域的UI结构
                // 如果不加这句代码, layui会首先应用自己的layui.all.js将筛选区域的分类可选项渲染, 但是此时art_list.js还未执行, 因此分类可选项中为空, layui只能渲染空的可选项;
                // 然后执行到art_list.js,将分类可选项中的多个分类渲染到页面中,此时需要layui重新渲染,执行layui.render()
                form.render();
            }

        })
    }

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault();
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        // 为查询参数对象 q 中相应的属性赋值
        q.cate_id = cate_id;
        q.state = state;
        // 根据最新的筛选条件,重新渲染表格的内容
        initTable();
    })


    // 定义渲染分页的方法 (这里total是数据的条数)
    function renderPage(total) {
        // console.log(total);

        //调用 laypage.render 方法来渲染分页的结构下·
        laypage.render({
            elem: 'pageBox', //pageBox 是 分页容器ID，不用加 # 号
            count: total, //数据总数，从服务端得到
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum, // 设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页发生切换的时候，触发 jump 回调
            // 触发 jump 回调的方式有两种：
            // 1. 点击页面的时候，会触发jump回调
            // 2. 只要调用了 laypage.render 方法，就会触发jump回调
            jump: function (obj, first) { // 点击页码触发jump回调时，first为undefined; laypage.render方法触发时，first值为true
                // 因此通过first的值来判断是哪种方式触发的jump回调;
                // 如果first值为true, 证明是方式2触发的
                // 否则就是方式1触发的
                // console.log(obj.curr); //点击的页码值
                // console.log(first);
                q.pagenum = obj.curr; // 把最新的页码值赋值到 q 这个查询参数对象中
                // 根据最新的q查询参数，获取对应的数据列表，并渲染表格
                // initTable(); // 如果直接在此处调用initTable, 会发生死循环

                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit;

                // 如果是laypage.render()方法触发jump回调，first值为true, 不初始化表格
                if (!first) {
                    // 根据最新的q查询参数，获取对应的数据列表，并渲染表格
                    initTable();
                }
            }

        });
    }


    // 用代理的方式，为删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function () {
        // console.log('ok');
        // 获取删除按钮的个数
        var len = $('.btn-delete').length;
        // console.log(len);
        // 获取文章的Id
        var id = $(this).attr('data-id');
        // 询问用户是否删除数据
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！');
                    }
                    layer.msg('删除文章成功！');

                    // 当数据删除完成后，需要判断当前这一页中是否还有剩余数据。
                    // 如果没有剩余数据了，则让页码值 -1 后，再重新调用 initTable 方法
                    if (len == 1) {
                        // 如果len的值 为1，证明删除完毕后，页面上就没有数据了
                        // 页码值最小是1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
                    }
                    initTable();
                }
            })

            layer.close(index);
        });

    })

    // 用代理的方式，为编辑按钮绑定点击事件
    $('tbody').on('click', '.btn-edit', function () {
        // 获取按钮对应的文章Id
        var id = $(this).attr('data-id');
        // 将文章id存到本地存储内
        localStorage.setItem('art_id', id);

        // 将父页面index.html中的iframe的src属性更改新的页面art_edit.html即可使iframe跳转到新页面
        // 获取当前ifame的父页面index.html内的元素
        parent.$('[name=fm]').attr('src', '/article/art_edit.html');

    })

})