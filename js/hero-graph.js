/**
 * Hero social graph: Google-style account avatars linked by a white web.
 * Slow drift + edges that grow in, so the social second brain feels peopled.
 */
(function () {
    var host = document.querySelector("[data-hero-graph]");
    if (!host) return;

    var canvas = document.createElement("canvas");
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = 1;
    var w = 0;
    var h = 0;
    var t = 0;
    var running = false;
    var bornAt = performance.now();

    /* Google account colors + Ableten mint/lavender for the Lisbon crew */
    var G = {
        blue: "#4285F4",
        red: "#EA4335",
        yellow: "#FBBC05",
        green: "#34A853",
        mint: "#EDFFE3",
        lavender: "#D4D2FD",
        sand: "#F3E6C8",
        gray: "#E8E8E8"
    };

    var nodes = [
        { id: "maya", l: "M", nx: 0.14, ny: 0.36, r: 26, fill: G.mint, ink: "#333", hub: true },
        { id: "jon", l: "J", nx: 0.21, ny: 0.56, r: 22, fill: G.sand, ink: "#333", hub: true },
        { id: "you", l: "Y", nx: 0.08, ny: 0.54, r: 20, fill: G.lavender, ink: "#333" },
        { id: "priya", l: "P", nx: 0.27, ny: 0.28, r: 18, fill: G.mint, ink: "#333" },
        { id: "sam", l: "S", nx: 0.11, ny: 0.20, r: 16, fill: G.blue, ink: "#fff" },
        { id: "ali", l: "A", nx: 0.84, ny: 0.30, r: 18, fill: G.green, ink: "#fff" },
        { id: "kim", l: "K", nx: 0.91, ny: 0.48, r: 20, fill: G.red, ink: "#fff" },
        { id: "rio", l: "R", nx: 0.78, ny: 0.58, r: 16, fill: G.yellow, ink: "#333" },
        { id: "ness", l: "N", nx: 0.88, ny: 0.70, r: 15, fill: G.lavender, ink: "#333" },
        { id: "lee", l: "L", nx: 0.76, ny: 0.20, r: 14, fill: G.blue, ink: "#fff" },
        { id: "tess", l: "T", nx: 0.40, ny: 0.12, r: 13, fill: G.lavender, ink: "#333" },
        { id: "eli", l: "E", nx: 0.60, ny: 0.11, r: 12, fill: G.mint, ink: "#333" },
        { id: "cam", l: "C", nx: 0.50, ny: 0.88, r: 14, fill: G.green, ink: "#fff" },
        { id: "bea", l: "B", nx: 0.64, ny: 0.84, r: 13, fill: G.yellow, ink: "#333" },
        { id: "hao", l: "H", nx: 0.34, ny: 0.78, r: 15, fill: G.red, ink: "#fff" },
        { id: "ivy", l: "I", nx: 0.93, ny: 0.18, r: 12, fill: G.sand, ink: "#333", late: 1 }
    ];

    var edges = [
        { a: "maya", b: "jon", strong: true, delay: 0 },
        { a: "maya", b: "you", strong: true, delay: 400 },
        { a: "jon", b: "you", strong: true, delay: 700 },
        { a: "maya", b: "priya", strong: true, delay: 1100 },
        { a: "jon", b: "priya", delay: 1400 },
        { a: "you", b: "sam", delay: 1800 },
        { a: "maya", b: "sam", delay: 2100 },
        { a: "priya", b: "lee", delay: 2600 },
        { a: "ali", b: "kim", strong: true, delay: 2400 },
        { a: "kim", b: "rio", delay: 2800 },
        { a: "kim", b: "ness", delay: 3200 },
        { a: "ali", b: "lee", delay: 3600 },
        { a: "lee", b: "tess", dashed: true, delay: 4000 },
        { a: "tess", b: "eli", dashed: true, delay: 4400 },
        { a: "hao", b: "cam", delay: 3800 },
        { a: "cam", b: "bea", delay: 4200 },
        { a: "jon", b: "hao", delay: 4800 },
        { a: "rio", b: "bea", dashed: true, delay: 5200 },
        { a: "eli", b: "ali", dashed: true, delay: 5600 },
        { a: "ness", b: "ivy", delay: 7200 },
        { a: "lee", b: "ivy", delay: 7800 }
    ];

    var byId = {};
    nodes.forEach(function (n, i) {
        byId[n.id] = n;
        n.phase = i * 0.73;
        n.appear = n.late ? 6800 : 0;
    });

    function byName(id) {
        return byId[id];
    }

    function resize() {
        var rect = host.getBoundingClientRect();
        w = Math.max(1, Math.floor(rect.width));
        h = Math.max(1, Math.floor(rect.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pos(node, now) {
        var drift = reduceMotion ? 0 : 7;
        var x = node.nx * w + Math.sin(now * 0.00022 + node.phase) * drift;
        var y = node.ny * h + Math.cos(now * 0.00018 + node.phase * 1.3) * drift;
        return { x: x, y: y, r: node.r * (h < 640 ? 0.82 : 1) };
    }

    function nodeAlpha(node, elapsed) {
        if (!node.appear) return 1;
        var k = (elapsed - node.appear) / 900;
        return Math.max(0, Math.min(1, k));
    }

    function edgeProgress(edge, elapsed) {
        if (reduceMotion) return 1;
        var dur = 1400;
        return Math.max(0, Math.min(1, (elapsed - edge.delay) / dur));
    }

    function drawLetter(x, y, r, letter, fill, ink) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = Math.max(2, r * 0.1);
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = ink;
        ctx.font = "500 " + Math.round(r * 0.86) + "px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, x, y + 1);
    }

    function draw(now) {
        ctx.clearRect(0, 0, w, h);
        var elapsed = now - bornAt;

        edges.forEach(function (edge) {
            var a = byName(edge.a);
            var b = byName(edge.b);
            if (!a || !b) return;
            var pa = pos(a, now);
            var pb = pos(b, now);
            var aa = nodeAlpha(a, elapsed);
            var ab = nodeAlpha(b, elapsed);
            var p = edgeProgress(edge, elapsed);
            if (p <= 0 || aa < 0.05 || ab < 0.05) return;

            var x2 = pa.x + (pb.x - pa.x) * p;
            var y2 = pa.y + (pb.y - pa.y) * p;
            var alpha = edge.strong ? Math.min(aa, ab) : Math.min(aa, ab) * 0.92;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "#FFFFFF";
            if (edge.dashed) ctx.setLineDash([3, 6]);
            else ctx.setLineDash([]);
            ctx.globalAlpha = alpha;
            ctx.lineWidth = edge.strong ? 4 : 2.2;
            ctx.shadowColor = "#FFFFFF";
            ctx.shadowBlur = edge.strong ? 14 : 7;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = edge.strong ? 2.4 : 1.45;
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
        });

        nodes.forEach(function (node) {
            var alpha = nodeAlpha(node, elapsed);
            if (alpha <= 0) return;
            var p = pos(node, now);
            ctx.globalAlpha = 0.22 + alpha * 0.78;
            if (node.hub) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 1.8;
                ctx.shadowColor = "#FFFFFF";
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            drawLetter(p.x, p.y, p.r, node.l, node.fill, node.ink);
            ctx.globalAlpha = 1;
        });
    }

    function frame(now) {
        if (!running) return;
        t = now;
        draw(now);
        if (!reduceMotion) requestAnimationFrame(frame);
    }

    function start() {
        if (running) return;
        running = true;
        if (reduceMotion) {
            draw(performance.now());
            return;
        }
        requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
    }

    resize();
    if (typeof ResizeObserver !== "undefined") {
        var ro = new ResizeObserver(resize);
        ro.observe(host);
    }
    window.addEventListener("resize", resize);

    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) start();
                    else stop();
                });
            },
            { threshold: 0.05 }
        );
        io.observe(host);
    } else {
        start();
    }
})();
