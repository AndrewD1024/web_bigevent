$(function () {
    // 1.1 获取裁剪区域的 DOM 元素
    var $image = $('#image');
    // 1.2 配置选项
    const options = {
        // 纵横比
        aspectRatio: 1, // 指定裁剪框形状，可为 16/9, 4/3等
        // 指定预览区域
        preview: '.img-preview'
    };

    // 1.3 创建裁剪区域
    $image.cropper(options);

    // 为上传按钮绑定点击事件
    $('#btnChooseImage').on('click', function () {
        // 模拟点击文件上传按钮
        $('#file').click();
    })

    // 为文件选择框绑定 change 事件
    $('#file').on('change', function (e) {
        // console.log(e);
        // 获取用户选择的图片文件
        var fileList = e.target.files;
        // console.log(fileList);
        if (fileList.length === 0) {
            return layer.msg('请选择照片！');
        }
        // 1. 拿到用户选择的文件
        var file = e.target.files[0];
        // 2.将文件，转换为路径
        var newImageURL = URL.createObjectURL(file);
        // 3. 重新初始化裁剪区域（即更改图片为选中图片）
        $image
            .cropper('destroy') // 销毁旧的裁剪区域
            .attr('src', newImageURL) // 重新设置图片路径
            .cropper(options); // 重新初始化裁剪区域
    })

    // 为确定按钮绑定点击事件
    $('#btnUpload').on('click', function () {
        // 1. 拿到用户裁剪之后的头像
        // 将裁剪后的图片，输出为 base64 格式的字符串
        var dataURL = $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 100,
                height: 100
            })
            .toDataURL('image/png');       // 将 Canvas 画布上的内容，转化为 base64 格式的字符串
        // 2. 调用接口，将头像上传到服务器
        $.ajax({
            method: 'POST',
            url: '/my/update/avatar',
            data: {
                avatar: dataURL
            },
            success: function (res) {
                // console.log(res);
                if (res.status !== 0) {
                    return layer.msg('更换头像失败！');
                }
                layer.msg('更换头像成功！');
                // 提交更新后，立刻调用父页面中的方法，重新渲染左侧导航区域用户的头像和用户信息
                window.parent.getUserInfo(); // window.parent表示当前iframe页面user_info.html的父页面: index.html，调用它的方法getUserInfo()
            }
        })
    })
})