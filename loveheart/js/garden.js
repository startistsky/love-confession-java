// === Kitty Heart Garden (replace flowers with sprite stamps) ===

function Vector(a, b) { this.x = a; this.y = b; }
Vector.prototype = {
    rotate: function (b) {
        var a = this.x, c = this.y;
        this.x = Math.cos(b) * a - Math.sin(b) * c;
        this.y = Math.sin(b) * a + Math.cos(b) * c;
        return this;
    },
    mult: function (a) { this.x *= a; this.y *= a; return this; },
    clone: function () { return new Vector(this.x, this.y); },
    length: function () { return Math.sqrt(this.x * this.x + this.y * this.y); },
    subtract: function (a) { this.x -= a.x; this.y -= a.y; return this; },
    set: function (a, b) { this.x = a; this.y = b; return this; }
};

// === Sprite Stamp ===
function KittyStamp(x, y, size, angle, garden) {
    this.p = new Vector(x, y);
    this.size = size;
    this.angle = angle;
    this.garden = garden;
    this.life = 1;          // 1 -> 0 fade
    this.decay = Garden.random(0.003, 0.008); // how fast it fades (small = stays longer)
    this.garden.addBloom(this);
}

KittyStamp.prototype = {
    draw: function () {
        var ctx = this.garden.ctx;
        var img = this.garden.sprite;

        // if image not loaded yet, skip drawing (will draw once loaded)
        if (!img || !img.complete) return;

        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        ctx.rotate(this.angle);

        // subtle fade-in/out
        ctx.globalAlpha = Math.max(0, this.life);

        // draw centered
        var s = this.size;
        ctx.drawImage(img, -s / 2, -s / 2, s, s);

        ctx.restore();
    },
    render: function () {
        this.life -= this.decay;
        if (this.life <= 0) {
            this.garden.removeBloom(this);
            return;
        }
        this.draw();
    }
};

// === Garden ===
function Garden(ctx, canvas) {
    this.blooms = [];
    this.element = canvas;
    this.ctx = ctx;

    // IMPORTANT: for sprites we want normal compositing
    this.ctx.globalCompositeOperation = "source-over";

    // load sprite
    this.sprite = new Image();
    this.sprite.src = (window.KITTY_SRC || "img/kitty.png");
}

Garden.prototype = {
    render: function () {
        for (var i = 0; i < this.blooms.length; i++) {
            this.blooms[i].render();
        }
    },
    addBloom: function (b) { this.blooms.push(b); },
    removeBloom: function (b) {
        for (var i = 0; i < this.blooms.length; i++) {
            if (this.blooms[i] === b) {
                this.blooms.splice(i, 1);
                return;
            }
        }
    },

    // Create stamps along the heart path
    createRandomBloom: function (x, y) {
        var size = Garden.randomInt(Garden.options.spriteSize.min, Garden.options.spriteSize.max);
        var angle = Garden.random(0, Garden.circle);
        new KittyStamp(x, y, size, angle, this);
    },

    clear: function () {
        this.blooms = [];
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
};

// === Options (tune size & speed here) ===
Garden.options = {
    // stamp size in px
    spriteSize: { min: 18, max: 26 },
    // animation render speed
    growSpeed: 1000 / 60
};

// === Utils ===
Garden.circle = 2 * Math.PI;
Garden.random = function (min, max) { return Math.random() * (max - min) + min; };
Garden.randomInt = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
Garden.degrad = function (a) { return Garden.circle / 360 * a; };
Garden.raddeg = function (a) { return a / Garden.circle * 360; };