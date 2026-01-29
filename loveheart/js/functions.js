/* global $, Garden, getHeartPoint, garden */

// ===== Typewriter effect =====
(function ($) {
    $.fn.typewriter = function () {
        this.each(function () {
            var $ele = $(this), str = $ele.html(), progress = 0;
            $ele.html("");
            var timer = setInterval(function () {
                var current = str.substr(progress, 1);
                if (current === "<") {
                    progress = str.indexOf(">", progress) + 1;
                } else {
                    progress++;
                }
                $ele.html(str.substring(0, progress) + (progress & 1 ? "_" : ""));
                if (progress >= str.length) {
                    clearInterval(timer);
                    $ele.html(str); // 去掉光标
                }
            }, 40);
        });
        return this;
    };
})(jQuery);

// ===== Time counter =====
function timeElapse(date) {
    var current = new Date();
    var seconds = Math.floor((current - date) / 1000);
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);
    var hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    var result =
        "<span class='digit'>" + days + "</span> days " +
        "<span class='digit'>" + (hours < 10 ? "0" : "") + hours + "</span> hours " +
        "<span class='digit'>" + (minutes < 10 ? "0" : "") + minutes + "</span> minutes " +
        "<span class='digit'>" + (seconds < 10 ? "0" : "") + seconds + "</span> seconds";

    $("#elapseClock").html(result);
}

// ===== Code position (keep classic look) =====
function adjustCodePosition() {
    // 在小屏不需要强行往下推，避免布局乱
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) return;

    $("#code").css("margin-top", Math.max(0, ($("#loveHeart").height() - $("#code").height()) / 2));
}

// ===== Responsive canvas resize =====
function resizeHeartCanvas() {
    var $heart = $("#loveHeart");
    var canvas = $("#garden")[0];
    if (!canvas) return;

    // 设置 canvas 实际像素大小，避免高清屏模糊
    var ratio = window.devicePixelRatio || 1;
    var w = Math.max(1, $heart.width());
    var h = Math.max(1, $heart.height());

    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    var ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // 更新全局偏移（index.html 里用到）
    if (typeof offsetX !== "undefined") offsetX = w / 2;
    if (typeof offsetY !== "undefined") offsetY = h / 2 - 55;
}

// ===== Heart animation =====
var animationTimer = null;

function startHeartAnimation() {
    // 确保画布尺寸正确
    resizeHeartCanvas();

    var interval = 50;
    var angle = 10;

    var heart = new Array();
    var points = 50; // 颗粒密度
    var i = 0;

    // garden / Garden 在 garden.js 里
    animationTimer = setInterval(function () {
        var bloom = getHeartPoint(angle);
        var draw = true;

        for (var j = 0; j < heart.length; j++) {
            var p = heart[j];
            var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
            if (distance < Garden.options.bloomRadius.max * 1.3) {
                draw = false;
                break;
            }
        }

        if (draw) {
            heart.push(bloom);
            garden.createRandomBloom(bloom[0], bloom[1]);
        }

        if (angle >= 30) {
            clearInterval(animationTimer);
            $("#messages").fadeIn(2000);
        } else {
            angle += 0.2;
        }
    }, interval);
}

// ===== Hook resize =====
$(function () {
    // 初始 resize
    resizeHeartCanvas();

    // resize / orientation change
    var resizeTimeout = null;
    $(window).on("resize orientationchange", function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            resizeHeartCanvas();
            adjustCodePosition();
        }, 150);
    });
});