let PARAMS = {
    outerbox_w_px: 800,
    // Relative to outerbox width 
    innerbox_size_pct: (3/14),
    padding_size_pct: (5/28),

    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D
}



function main() {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let context = canvas.getContext('2d')!;

    PARAMS.canvas = canvas;
    PARAMS.ctx = context;
    (window as any)['params'] = PARAMS

    onResize(context);
    
    window.addEventListener('resize', () => { onResize(context); });
    canvas.addEventListener('click', (e)=>{ click(e, context); });

}

function onResize(ctx:CanvasRenderingContext2D) {
    let canvas = ctx.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx);
}

function ctxSize(ctx:CanvasRenderingContext2D): { w:number, h:number } {
    return {
        w: ctx.canvas.width,
        h: ctx.canvas.height
    } 
}

function click(e:MouseEvent, ctx:CanvasRenderingContext2D) {
    let pos = {
        x: e.pageX,
        y: e.pageY
    }
}


// Draw and Draw Helpers
function draw(ctx:CanvasRenderingContext2D) {

    let s = ctxSize(ctx);

    // clear
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,s.w,s.h);
    
    function drawOuterBox() {
        ctx.fillStyle = "white";
        ctx.fillRect((s.w - PARAMS.outerbox_w_px) / 2, (s.h - PARAMS.outerbox_w_px) / 2, PARAMS.outerbox_w_px, PARAMS.outerbox_w_px);
    }

    function drawInnerBox(isTarget:boolean) {
        ctx.fillStyle = "black";
        let ib_size = PARAMS.outerbox_w_px * PARAMS.innerbox_size_pct;
        let pd = PARAMS.outerbox_w_px * PARAMS.padding_size_pct;

        let x = (s.w - ib_size) / 2;
        let y = isTarget ? 
                ((s.h - PARAMS.outerbox_w_px) / 2) + pd :
                ((s.h + PARAMS.outerbox_w_px) / 2) - (pd + ib_size);

        
        ctx.fillRect(x,y,ib_size,ib_size);
    }

    drawOuterBox();
    drawInnerBox(false);

}




main();




































