var $window = $(window),
    gardenCtx,
    gardenCanvas,
    $garden,
    garden;

var offsetX = 0;
var offsetY = 0;
var heartScale = 1;

var renderTimer = null;

/* =========================
   Resize + Layout
========================= */
function resizeLayoutAndCanvas() {
    var $loveHeart = $("#loveHeart");
    var $code = $("#code");
    var $content = $("#content");

    if ($loveHeart.length === 0 || $garden.length === 0) return;

    var isSmall = window.matchMedia && window.matchMedia("(max-width: 900px)").matches;

    /* ---- Layout ---- */
    if (isSmall) {
        // 手机 / 平板：上下排
        $content.css({
            width: "100%",
            height: "auto",
            marginTop: "10px",
            marginLeft: "0px"
        });

        $loveHeart.css({
            width: "100%",
            height: Math.max(Math.floor(window.innerHeight * 0.65), 420) + "px"
        });

        $code.css({
            width: "100%",
            height: "auto"
        });
    } else {
        // PC：左右排（保持经典）
        $content.css({
            width: "",
            height: "",
            marginTop: "",
            marginLeft: ""
        });

        $loveHeart.css({
            height: "625px"
        });
    }

    /* ---- Canvas Size ---- */
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

    /* ---- Heart Center ---- */
    offsetX = w / 2;
    offsetY = isSmall ? h / 2 : h / 2 - 55;

    /* ---- Heart Scale ---- */
    if (isSmall) {
        heartScale = Math.min(w, h) / 600;   // 数字越大 → 心越小
        heartScale = Math.max(0.6, Math.min(0.85, heartScale));
    } else {
        heartScale = 1;
    }

    if (garden) {
        try { garden.clear(); } catch (e) {}
    }
}

/* =========================
   Init Garden
========================= */
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

/* =========================
   Heart Math
========================= */
function getHeartPoint(c) {
    var b = c / Math.PI;
    var a = 19.5 * (16 * Math.pow(Math.sin(b), 3));
    var d = -20 * (13 * Math.cos(b)
        - 5 * Math.cos(2 * b)
        - 2 * Math.cos(3 * b)
        - Math.cos(4 * b));

    a *= heartScale;
    d *= heartScale;

    return [offsetX + a, offsetY + d];
}

/* =========================
   Heart Animation
========================= */
function startHeartAnimation() {
    if (!garden) initGarden();

    var interval = 50;
    var angle = 10;
    var heart = [];

    var timer = setInterval(function () {
        var bloom = getHeartPoint(angle);
        var draw = true;

        for (var i = 0; i < heart.length; i++) {
            var p = heart[i];
            var dist = Math.sqrt(
                Math.pow(p[0] - bloom[0], 2) +
                Math.pow(p[1] - bloom[1], 2)
            );
            if (dist < Garden.options.bloomRadius.max * 1.3) {
                draw = false;
                break;
            }
        }

        if (draw) {
            heart.push(bloom);
            garden.createRandomBloom(bloom[0], bloom[1]);
        }

        if (angle >= 30) {
            clearInterval(timer);
            showMessages();
        } else {
            angle += 0.2;
        }
    }, interval);
}

/* =========================
   Effects
========================= */
(function ($) {
    $.fn.typewriter = function () {
        this.each(function () {
            var $ele = $(this),
                str = $ele.html(),
                progress = 0;
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
            }, 75);
        });
        return this;
    };
})(jQuery);

function timeElapse(c) {
    var now = Date();
    var seconds = (Date.parse(now) - Date.parse(c)) / 1000;

    var days = Math.floor(seconds / (3600 * 24));
    seconds %= 3600 * 24;

    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    function pad(n) { return n < 10 ? "0" + n : n; }

    $("#elapseClock").html(
        "<span class='digit'>" + days + "</span> days " +
        "<span class='digit'>" + pad(hours) + "</span> hours " +
        "<span class='digit'>" + pad(minutes) + "</span> minutes " +
        "<span class='digit'>" + pad(seconds) + "</span> seconds"
    );
}

function showMessages() {
    adjustWordsPosition();
    $("#messages").fadeIn(2000);
}

function adjustWordsPosition() {
    $("#words").css({
        position: "absolute",
        top: ($("#loveHeart").height() * 0.3) + "px",
        left: ($("#loveHeart").width() * 0.12) + "px"
    });
}

function adjustCodePosition() {
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) return;
    $("#code").css("margin-top",
        ($("#garden").height() - $("#code").height()) / 2
    );
}

/* =========================
   Ready + Resize
========================= */
$(function () {
    initGarden();
    adjustCodePosition();

    var t = null;
    $(window).on("resize orientationchange", function () {
        clearTimeout(t);
        t = setTimeout(function () {
            initGarden();
            adjustCodePosition();
        }, 150);
    });
});