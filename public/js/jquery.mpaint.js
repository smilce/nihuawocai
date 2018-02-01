(function ($, window) {
    var ctx, needRestore = true, readydraw = false;
    $.fn.MPaint = function (opts) {
        var opts = $.extend({}, $.fn.MPaint.defaults, opts), begin = false;
        var _moveto = function (e) {
            e.preventDefault();
            var x = e.offsetX || e.touches[0].clientX + e.layerX, y = e.offsetY || e.touches[0].clientY + e.layerY;
            begin = true;
            ctx.beginPath();
            ctx.moveTo(x, y);
            opts.drawReady({x: x, y: y});
        }, _drawReady = function (e) {
            _moveto(e);
            readydraw = true;
        } , _drawBegin = function (e) {
            e.preventDefault();
            e.cancelBubble = true;
            if (begin) {
                var x = e.offsetX || e.changedTouches[0].clientX + e.layerX, y = e.offsetY || e.changedTouches[0].clientY + e.layerY;
                ctx.lineTo(x, y);
                ctx.stroke();
                opts.drawBegin({x: x, y: y});
            }
        } , _drawEnd = function (e) {
            begin = false;
            opts.drawEnd;
            ctx.closePath();
            readydraw = false;
        };

        return this.each(function () {
            var canvas = $(this);
            if (canvas[0].getContext) {
                ctx = canvas[0].getContext('2d');
                ctx.strokeStyle = opts.BrushColor;
                ctx.lineWidth = opts.BrushWidth;
                ctx.lineJoin = opts.LineJoin;
                ctx.lineCap = opts.LineCap;

            }
            canvas.on("mousedown", _drawReady);
            canvas.on("mousemove", _drawBegin);
            canvas.on("mouseup", _drawEnd);
            canvas.on("mouseout", _drawEnd);
            canvas[0].addEventListener("touchstart", _drawReady, false);
            canvas[0].addEventListener("touchmove", _drawBegin, false);
            canvas[0].addEventListener("touchend", _drawEnd, false);
        })

    };
    var Methods = {
        SetColor: function (color) {
            ctx.strokeStyle = color;
        },
        GetColor: function (color) {
            return ctx.strokeStyle;
        },
        SetWidth: function (w) {
            ctx.lineWidth = w;
        },
        SaveImage: function () {
            var data = ctx.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            window.location.href = data;
        },
        Eraser: function () {
            if (needRestore)
                ctx.save();
            this.SetWidth(50);
            this.SetColor("#FFF");
        },
        Clear: function () {
            ctx.save();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
            needRestore = false;
        },
        Pen: function () {
            if (needRestore)
                ctx.restore();
        }
    }


    $.fn.MPaint.defaults = {
        BrushColor: "#fff",
        BrushWidth: 5,
        LineJoin: "round",
        LineCap: "round",
        //mousedown
        drawReady: function (e) {

        },
        //Mousemove
        drawBegin: function (e) {

        },
        //mouseup
        drawEnd: function (e) {

        }
    };
    $.extend($.fn.MPaint, Methods);
})(jQuery, window)