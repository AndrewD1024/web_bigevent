$(function () {
    var form = layui.form;
    var layer = layui.layer;
    // 设置表单验证规则
    form.verify({
        nickname: function (value) { // value可以获得设置了lay-verficy为nickname的文本框的输入值
            if (value.length > 6) {
                return '昵称长度必须在 1-6 个字符之间';
            }
        }
    })
    initUserInfo();
    // 初始化用户的基本信息
    function initUserInfo() {
        $.ajax({
            method: 'GET',
            url: '/my/userinfo',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取用户信息失败！')
                }
                // console.log(res);

                // 调用 form.val() 快速为表单赋值
                form.val('formUserInfo', res.data)
            }
        })
    }
    // 重置表单的数据
    $('#btnReset').on('click', function (e) {
        // 阻止表单的默认重置行为, 如果不阻止，所有表单项包括登录名称都会被清空（本该保持不变）
        e.preventDefault();
        initUserInfo();
    })

    // 监听表单的提交事件
    $('.layui-form').on('submit', function (e) {
        // 阻止表单的默认提交行为
        e.preventDefault();
        // 发起 ajax 数据请求
        $.ajax({
            method: 'POST',
            url: '/my/userinfo',
            data: $(this).serialize(), //serialize()可以一次性获取到表单中的所有的数据
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更新用户信息失败！')
                }
                // console.log('ok');
                layer.msg('更新用户信息成功！')

                // 提交更新后，立刻调用父页面中的方法，重新渲染左侧导航区域用户的头像和用户信息
                window.parent.getUserInfo(); // window.parent表示当前iframe页面user_info.html的父页面: index.html，调用它的方法getUserInfo()
            }
        })
    })

})