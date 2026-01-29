/* global $, Garden */

// ======================
//  Heart + Garden Setup
// ======================
var garden = null;
var gardenCanvas = null;
var gardenCtx = null;
var gardenTimer = null;

function initGarden() {
    var canvas = $("#garden");
    gardenCanvas = canvas[0];
    if (!gardenCanvas) return;

    // 设置 canvas 尺寸（含高清屏）
    resizeGardenCanvas();

    gardenCtx = gardenCanvas.getContext("2d");
    garden = new Garden(gardenCtx, gardenCanvas);

    // 循环渲染花朵
    if (gardenTimer) clearInterval(gardenTimer);
    gardenTimer = setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);
}

function resizeGardenCanvas() {
    var $heart = $("#loveHeart");
    if ($heart.length === 0) return;

    var w = Math.max(1, $heart.width());
    var h = Math.max(1, $heart.height());
    var ratio = window.devicePixelRatio || 1;

    // 真实像素尺寸
    gardenCanvas = $("#garden")[0];
    gardenCanvas.width = Math.floor(w * ratio);
    gardenCanvas.height = Math.floor(h * ratio);

    // 显示尺寸
    gardenCanvas.style.width = w + "px";
    gardenCanvas.style.height = h + "px";

    // 缩放 context，防止模糊
    var ctx = gardenCanvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // 更新全局偏移（你的 index.html 里用 offsetX/offsetY）
    if (typeof offsetX !== "undefined") offsetX = w / 2;
    if (typeof offsetY !== "undefined") offsetY = h / 2 - 55;
}

// ======================
//  Heart Math
// ======================
function getHeartPoint(angle) {
    var t = angle / Math.PI;

    // 经典心形参数方程
    var x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
    var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    return [offsetX + x, offsetY + y];
}

// ======================
//  Heart Animation
// ======================
var heartPoints = [];
var animationTimer = null;

function startHeartAnimation() {
    if (!garden) initGarden();

    var angle = 10;
    heartPoints = [];

    if (animationTimer) clearInterval(animationTimer);

    animationTimer = setInterval(function () {
        var bloom = getHeartPoint(angle);
        var draw = true;

        for (var i = 0; i < heartPoints.length; i++) {
            var p = heartPoints[i];
            var dx = p[0] - bloom[0];
            var dy = p[1] - bloom[1];
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < Garden.options.bloomRadius.max * 1.25) {
                draw = false;
                break;
            }
        }

        if (draw) {
            heartPoints.push(bloom);
            garden.createRandomBloom(bloom[0], bloom[1]);
        }

        if (angle >= 30) {
            clearInterval(animationTimer);
            $("#messages").fadeIn(2000);
        } else {
            angle += 0.2;
        }
    }, 50);
}

// ======================
//  Time + Typewriter
// ======================
function timeElapse(date) {
    var current = new Date();
    var seconds = Math.floor((current - date) / 1000);
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);

    var hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;

    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    function pad(n) {
        return n < 10 ? "0" + n : "" + n;
    }

    var result =
        "<span class='digit'>" + days + "</span> days " +
        "<span class='digit'>" + pad(hours) + "</span> hours " +
        "<span class='digit'>" + pad(minutes) + "</span> minutes " +
        "<span class='digit'>" + pad(seconds) + "</span> seconds";

    $("#elapseClock").html(result);
}

(function ($) {
    $.fn.typewriter = function () {
        this.each(function () {
            var $ele = $(this);
            var str = $ele.html();
            var progress = 0;
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
                    $ele.html(str);
                }
            }, 40);
        });
        return this;
    };
})(jQuery);

// 电脑端把代码区域稍微下移保持经典效果（手机不强制）
function adjustCodePosition() {
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) return;
    var mt = Math.max(0, ($("#loveHeart").height() - $("#code").height()) / 2);
    $("#code").css("margin-top", mt);
}

// ======================
//  Auto Resize Hook
// ======================
$(function () {
    // 初始化画布
    initGarden();
    adjustCodePosition();

    // resize 时重设画布 + 重新创建 garden（避免尺寸错乱）
    var t = null;
    $(window).on("resize orientationchange", function () {
        clearTimeout(t);
        t = setTimeout(function () {
            // 重新设置 canvas 尺寸
            resizeGardenCanvas();

            // 重新创建 garden（最稳）
            initGarden();

            adjustCodePosition();
        }, 150);
    });
});