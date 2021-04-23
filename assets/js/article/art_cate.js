$(function () {
    var layer = layui.layer;
    var form = layui.form;

    initArtCateList();

    var indexAdd = null;
    // 为添加类别按钮绑定点击事件
    $('#btnAddCate').on('click', function () {
        indexAdd = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '添加文章分类',
            content: $('#dialog-add').html()
        });

    })

    // 由于form-add表单的html代码是通过js写入页面的，因此无法直接为表单绑提交事件；
    // 此时需要通过委托/代理的方式为body绑定submit事件
    // 通过代理方式，为 form-add 绑定submit事件
    $('body').on('submit', '#form-add', function (e) {
        e.preventDefault();
        // console.log('ok');
        $.ajax({
            method: 'POST',
            url: '/my/article/addcates',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    // console.log(res);
                    return layer.msg('新增分类失败！');

                }
                initArtCateList();
                layer.msg('新增分类成功！');
                // 根据索引，关闭对应的弹出层
                layer.close(indexAdd);
            }
        })
    })

    // 通过代理的形式为编辑按钮绑定点击事件
    var indexEdit = null;
    $('tbody').on('click', '#btn-edit', function () {
        // console.log('ok');
        // 弹出一个修改文章分类信息的层
        indexEdit = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '修改文章分类',
            content: $('#dialog-edit').html()
        });

        var id = $(this).attr('data-id');
        // 发起请求获取对应分类的数据
        $.ajax({
            method: 'GET',
            url: '/my/article/cates/' + id,
            success: function (res) {
                form.val('form-edit', res.data); //加载时给文本框赋值
            }
        })
    })


    // 通过代理方式为form-edit绑定submit事件
    $('body').on('submit', '#form-edit', function (e) {
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: '/my/article/updatecate',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更新分类数据失败!');
                }
                layer.msg('更新分类数据成功!');
                layer.close(indexEdit);
                initArtCateList();
            }
        })
    })

    // 通过代理方式为 删除 按钮绑定点击事件
    $('tbody').on('click', '#btn-del', function () {
        // console.log('ok');
        var id = $(this).attr('data-id');
        // 提示用户是否删除
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/deletecate/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除分类失败！')
                    }
                    layer.msg('删除分类成功！');
                    layer.close(index);
                    initArtCateList();
                }
            })
            layer.close(index);
        });
    })


    // 获取文章分类列表
    function initArtCateList() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                // console.log(res);
                var htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);
            }
        })
    }
})