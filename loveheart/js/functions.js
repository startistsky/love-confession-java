var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;

// 兼容：在不同屏幕下动态计算 offset
var offsetX = 0;
var offsetY = 0;

function resizeLayoutAndCanvas() {
    var $loveHeart = $("#loveHeart");
    var $code = $("#code");
    var $content = $("#content");
    if ($loveHeart.length === 0 || $garden.length === 0) return;

    // 手机/平板：上下排（让爱心可见）
    var isSmall = window.matchMedia && window.matchMedia("(max-width: 900px)").matches;

    if (isSmall) {
        // 上下排：让 #content 自然流动，不要 JS 强行算宽高和 margin
        $content.css({
            width: "100%",
            height: "auto",
            marginTop: "10px",
            marginLeft: "0px"
        });

        $loveHeart.css({
            width: "100%",
            height: Math.max(Math.floor(window.innerHeight * 0.7), 420) + "px"
        });

        $code.css({
            width: "100%",
            height: "auto"
        });
    } else {
        // 电脑：左右排，保留经典效果
        // 让 layout 由 CSS flex 控制，JS 不再固定 content 宽度
        $content.css({
            width: "",
            height: "",
            marginTop: "",
            marginLeft: ""
        });

        // 电脑端给一个稳定高度（可按你喜好调）
        $loveHeart.css({
            height: "625px"
        });
    }

    // 更新 canvas 实际尺寸（含高清屏）
    gardenCanvas = $garden[0];
    var w = Math.max(1, $loveHeart.width());
    var h = Math.max(1, $loveHeart.height());
    var ratio = window.devicePixelRatio || 1;

    gardenCanvas.width = Math.floor(w * ratio);
    gardenCanvas.height = Math.floor(h * ratio);
    gardenCanvas.style.width = w + "px";
    gardenCanvas.style.height = h + "px";

    gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    gardenCtx.globalCompositeOperation = "lighter";

    offsetX = w / 2;

// 手机/平板不要往上推，避免爱心被裁
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) {
        offsetY = h / 2;
    } else {
        offsetY = h / 2 - 55;
    }

    // 如果 garden 已经存在，清一下避免残影
    if (garden) {
        try { garden.clear(); } catch (e) {}
    }
}

// 初始化 garden + render 循环（只做一次）
var renderTimer = null;
function initGarden() {
    $garden = $("#garden");
    if ($garden.length === 0) return;

    resizeLayoutAndCanvas();

    garden = new Garden(gardenCtx, gardenCanvas);

    if (renderTimer) clearInterval(renderTimer);
    renderTimer = setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);
}

// 原版心形点
function getHeartPoint(c) {
    var b = c / Math.PI;
    var a = 19.5 * (16 * Math.pow(Math.sin(b), 3));
    var d = -20 * (13 * Math.cos(b) - 5 * Math.cos(2 * b) - 2 * Math.cos(3 * b) - Math.cos(4 * b));
    return new Array(offsetX + a, offsetY + d);
}

// 原版爱心动画（保持不变，保证兼容你的 garden.js）
function startHeartAnimation() {
    if (!garden) initGarden();

    var c = 50;
    var d = 10;
    var b = new Array();

    var a = setInterval(function () {
        var h = getHeartPoint(d);
        var e = true;

        for (var f = 0; f < b.length; f++) {
            var g = b[f];
            var j = Math.sqrt(Math.pow(g[0] - h[0], 2) + Math.pow(g[1] - h[1], 2));
            if (j < Garden.options.bloomRadius.max * 1.3) {
                e = false;
                break;
            }
        }

        if (e) {
            b.push(h);
            garden.createRandomBloom(h[0], h[1]);
        }

        if (d >= 30) {
            clearInterval(a);
            showMessages();
        } else {
            d += 0.2;
        }
    }, c);
}

// 打字机（原版保留）
(function (a) {
    a.fn.typewriter = function () {
        this.each(function () {
            var d = a(this), c = d.html(), b = 0;
            d.html("");
            var e = setInterval(function () {
                var f = c.substr(b, 1);
                if (f == "<") {
                    b = c.indexOf(">", b) + 1;
                } else {
                    b++;
                }
                d.html(c.substring(0, b) + (b & 1 ? "_" : ""));
                if (b >= c.length) {
                    clearInterval(e);
                    d.html(c);
                }
            }, 75);
        });
        return this;
    };
})(jQuery);

function timeElapse(c) {
    var e = Date();
    var f = (Date.parse(e) - Date.parse(c)) / 1000;
    var g = Math.floor(f / (3600 * 24));
    f = f % (3600 * 24);
    var b = Math.floor(f / 3600);
    if (b < 10) { b = "0" + b; }
    f = f % 3600;
    var d = Math.floor(f / 60);
    if (d < 10) { d = "0" + d; }
    f = f % 60;
    if (f < 10) { f = "0" + f; }
    var a = '<span class="digit">' + g + '</span> days <span class="digit">' + b + '</span> hours <span class="digit">' + d + '</span> minutes <span class="digit">' + f + "</span> seconds";
    $("#elapseClock").html(a);
}

function showMessages() {
    adjustWordsPosition();
    $("#messages").fadeIn(2000);
}

function adjustWordsPosition() {
    // 让文字在爱心区域里居中一点，手机上也适配
    $("#words").css("position", "absolute");
    $("#words").css("top", ($("#loveHeart").height() * 0.28) + "px");
    $("#words").css("left", ($("#loveHeart").width() * 0.12) + "px");
}

function adjustCodePosition() {
    // 手机不需要强制 margin-top
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) return;
    $("#code").css("margin-top", ($("#garden").height() - $("#code").height()) / 2);
}

$(function () {
    initGarden();
    adjustCodePosition();

    // ✅ 关键：不要再 resize 就 location.replace 刷新
    // 改成：resize 时重算布局 + 重建 garden（更稳）
    var t = null;
    $(window).on("resize orientationchange", function () {
        clearTimeout(t);
        t = setTimeout(function () {
            initGarden();
            adjustCodePosition();
        }, 150);
    });
});