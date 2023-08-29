"use strict";
var PARAMS = {
    outerbox_w_px: 180,
    // Relative to outerbox width 
    innerbox_size_pct: (3 / 14),
    padding_size_pct: (5 / 28),
    tova: {
        time_between_present: 2000,
        time_box_shown: 100,
        sections: [
            { targets: 36, nontargets: 126 },
            { targets: 36, nontargets: 126 },
            { targets: 126, nontargets: 36 },
            { targets: 126, nontargets: 36 }
        ]
    },
    active_test: {
        tova_nth_present: 0,
        tova_timer_num: undefined,
        tova_out: undefined,
    },
    canvas: {},
    ctx: {},
    currentViewState: {
        mode: "testing",
        state: "EMPTY"
    },
    redraw: function () { draw(PARAMS.ctx); }
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
    window.addEventListener('keydown', tova_response);
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
function toggleUI(hide) {
    var box = document.getElementById("uibox");
    box.style.visibility = hide ? 'hidden' : 'visible';
}
function btn_startclick() {
    console.log("Start Click");
    toggleUI(true);
    tova_play();
}
function btn_resetclick() {
    console.log("Reset Click");
    tova_reset();
}
function btn_pauseclick() {
    console.log("Pause Click");
    tova_pause();
}
function click(e, ctx) {
    console.log("Canvas Click");
    toggleUI(false);
}
// Draw and Draw Helpers
function draw(ctx) {
    var s = ctxSize(ctx);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, s.w, s.h);
    var view = PARAMS.currentViewState;
    var viewmode = view.mode;
    switch (viewmode) {
        case "testing":
            drawOuterBox();
            var testState = view.state;
            switch (testState) {
                case "EMPTY": break;
                case "TARGET":
                    drawInnerBox(true);
                    break;
                case "NONTARGET":
                    drawInnerBox(false);
                    break;
            }
            break;
    }
    // Internal Helpers
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
}
// active test
var AT = PARAMS.active_test;
function tova_play() {
    if (!(AT.tova_out)) {
        tova_reset();
    }
    AT.tova_timer_num = setInterval(function () {
        var present = AT.tova_out.allPresents[AT.tova_nth_present];
        present.presentedAt = (new Date()).getTime();
        PARAMS.currentViewState = { mode: "testing", state: present.isTrigger ? "TARGET" : "NONTARGET" };
        PARAMS.redraw();
        setTimeout(function () {
            PARAMS.currentViewState = { mode: "testing", state: "EMPTY" };
            PARAMS.redraw();
        }, PARAMS.tova.time_box_shown);
        if (AT.tova_nth_present + 1 == AT.tova_out.allPresents.length) {
            tova_pause();
        }
        else {
            AT.tova_nth_present++;
        }
    }, PARAMS.tova.time_between_present);
}
function tova_reset() {
    var _a;
    tova_pause();
    AT.tova_nth_present = 0;
    // Generate Test
    AT.tova_out = {
        sections: [],
        allPresents: [],
        allResponses: []
    };
    for (var _i = 0, _b = PARAMS.tova.sections; _i < _b.length; _i++) {
        var s = _b[_i];
        var sec = [];
        for (var i = 0; i < s.nontargets; i++) {
            sec.push({
                isTrigger: false,
                orderValue: Math.random(),
                responses: []
            });
        }
        for (var i = 0; i < s.targets; i++) {
            sec.push({
                isTrigger: true,
                orderValue: Math.random(),
                responses: []
            });
        }
        sec.sort(function (a, b) { return a.orderValue - b.orderValue; });
        AT.tova_out.sections.push(sec);
        (_a = AT.tova_out.allPresents).push.apply(_a, sec);
    }
}
function tova_pause() {
    if (typeof AT.tova_timer_num == 'number') {
        clearInterval(AT.tova_timer_num);
        AT.tova_timer_num = undefined;
    }
}
/**
 * 1. add response to current presesnt
 * 2. add response to all response
 **/
function tova_response() {
    if (!(AT.tova_out)) {
        return;
    }
    var current = AT.tova_out.allPresents[AT.tova_nth_present];
    var t = (new Date()).getTime();
    var r = {
        lastPresentWasTrigger: current.isTrigger,
        present: current,
        triggerAt: t,
        msAfterLastPresent: t - current.presentedAt
    };
    current.responses.push(r);
    AT.tova_out.allResponses.push(r);
}
function generate_results(o) {
    var out = {
        bysection: [],
        byhalf: [],
        total: {}
    };
    for (var _i = 0, _a = o.allPresents; _i < _a.length; _i++) {
        var p = _a[_i];
        var didRespond = p.responses.length > 0;
        // This happens when trigger is 200ms before present or 150ms after
        var isAR = didRespond && ((p.responses[0].msAfterLastPresent > (PARAMS.tova.time_between_present - 200)) ||
            (p.responses[0].msAfterLastPresent > 150));
        // When subject pushes the button when they shouldn’t have 
        var isCom = false;
        // When subject doesnt push button when they should have
        var isOm = false;
        // ARs are not counted as commision or omission errors 
        if (!isAR) {
            isCom = didRespond && !p.isTrigger;
            isOm = !didRespond && p.isTrigger;
        }
        p.data = {
            isComissionErr: isCom,
            isOmissionErr: isOm,
            isAnticipatoryResponse: isAR
        };
    }
    for (var _b = 0, _c = o.sections; _b < _c.length; _b++) {
        var s = _c[_b];
    }
    return out;
}
main();
