"use strict";
var PARAMS = {
    outerbox_w_px: 800,
    // Relative to outerbox width 
    innerbox_size_pct: (3 / 14),
    padding_size_pct: (5 / 28),
    canvas: {},
    ctx: {}
};
function main() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    PARAMS.canvas = canvas;
    PARAMS.ctx = context;
    window['params'] = PARAMS;
    onResize(context);
    window.addEventListener('resize', function () { onResize(context); });
    canvas.addEventListener('click', function (e) { click(e, context); });
}
function onResize(ctx) {
    var canvas = ctx.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx);
}
function ctxSize(ctx) {
    return {
        w: ctx.canvas.width,
        h: ctx.canvas.height
    };
}
function click(e, ctx) {
    var pos = {
        x: e.pageX,
        y: e.pageY
    };
}
// Draw and Draw Helpers
function draw(ctx) {
    var s = ctxSize(ctx);
    // clear
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, s.w, s.h);
    function drawOuterBox() {
        ctx.fillStyle = "white";
        ctx.fillRect((s.w - PARAMS.outerbox_w_px) / 2, (s.h - PARAMS.outerbox_w_px) / 2, PARAMS.outerbox_w_px, PARAMS.outerbox_w_px);
    }
    function drawInnerBox(isTarget) {
        ctx.fillStyle = "black";
        var ib_size = PARAMS.outerbox_w_px * PARAMS.innerbox_size_pct;
        var pd = PARAMS.outerbox_w_px * PARAMS.padding_size_pct;
        var x = (s.w - ib_size) / 2;
        var y = isTarget ?
            ((s.h - PARAMS.outerbox_w_px) / 2) + pd :
            ((s.h + PARAMS.outerbox_w_px) / 2) - (pd + ib_size);
        ctx.fillRect(x, y, ib_size, ib_size);
    }
    drawOuterBox();
    drawInnerBox(false);
}
main();
