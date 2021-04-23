$(function () {
    var layer = layui.layer;
    var form = layui.form;

    initCate();
    initEditor();

    // 定义加载文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类失败!')
                }

                // 调用模板引擎渲染文章分类的下拉菜单
                var htmlStr = template('tpl-cate', res);
                $('[name=cate_id]').html(htmlStr);
                form.render(); // 记得调用layui的form.render方法重新渲染

            }
        })
    }


    // 图片裁剪区域代码
    // 1. 初始化图片裁剪器
    var $image = $('#image');
    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    };
    // 3. 初始化裁剪区域
    $image.cropper(options);

    // 为选择封面按钮绑定点击事件
    $('#btnChooseImage').on('click', function () {
        $('#coverFile').click();
    })

    // 监听 coverFile 的 change 事件,获取用户选择的文件列表
    $('#coverFile').on('change', function (e) {
        // 获取文件的列表数组
        var files = e.target.files;
        // 判断用户是否选择了文件
        if (files.length === 0) {
            return;
        }
        //根据文件,创建对应的URL地址
        var newImgURL = URL.createObjectURL(files[0]);
        // 为裁剪区域重新设置图片
        $image
            .cropper('destroy')      // 销毁旧的裁剪区域
            .attr('src', newImgURL)  // 重新设置图片路径
            .cropper(options)        // 重新初始化裁剪区域
    })




    // 提交数据的代码

    // 定义文章的发布状态
    var art_state = '已发布'; // 默认为已发布
    // 为 存为草稿 按钮,绑定点击事件
    $('#btnSave2').on('click', function () {
        art_state = '草稿';
    })

    // 为表单绑定 submit 提交事件
    $('#form-pub').on('submit', function (e) {
        // 1. 阻止表单默认提交行为
        e.preventDefault();
        // 2. 基于 form 表单,快速创建一个 FormData对象
        var fd = new FormData($(this)[0]); // 通过$(this)获取表单元素,通过[0]获取到表单的DOM对象,将DOM对象传给ForDate方法,就能创建FormData对象
        // 3. 将文章的发布状态存到FormData中
        fd.append('state', art_state);
        // 查看fd中的值
        // fd.forEach(function (v, k) {
        //     console.log(k, v);
        // })

        // 4. 将封面裁剪过后的图片输出为一个文件对象
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function (blob) {       // 将 Canvas 画布上的内容，转化为文件对象
                // 得到文件对象后，进行后续的操作
                // 5. 将文件对象（封面）存到 FormData中
                fd.append('cover_img', blob);

                // 查看fd中的值
                // fd.forEach(function (v, k) {
                //     console.log(k, v);
                // })
                // 6. 发起 ajax 请求, 将文章存储到服务器
                publishArticle(fd);
            })

    })

    // 定义发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意：如果向服务器提交的是FormData 格式数据，
            // 必须添加以下两个配置项
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('发布文章失败！');
                }
                layer.msg('发布文章成功！');
                // console.log(res);
                // 发布文章成功后，跳转到文章列表页面
                window.location.href = '/article/art_list.html';
            }
        })
    }



})