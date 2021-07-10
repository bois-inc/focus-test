let PARAMS = {
    outerbox_w_px: 180,
    // Relative to outerbox width 
    innerbox_size_pct: (3/14),
    padding_size_pct: (5/28),

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
        tova_timer_num: undefined as any as number,
        tova_out: undefined as any as TovaOuput,
    },

    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D,
    currentViewState: {
        mode: "testing",
        state: "EMPTY"
    } as ViewState,
    redraw: () => { draw(PARAMS.ctx); }
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
    window.addEventListener('keydown', tova_response);

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

function toggleUI(hide:boolean) {
    let box = document.getElementById("uibox")!;
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

function click(e:MouseEvent, ctx:CanvasRenderingContext2D) {
    console.log("Canvas Click");
    toggleUI(false);
}


type ViewState = 
    {
        mode: "testing",
        state: TargetState
    }

type TargetState = "TARGET" | "NONTARGET" | "EMPTY"

// Draw and Draw Helpers
function draw(ctx:CanvasRenderingContext2D) {

    let s = ctxSize(ctx);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,s.w,s.h);
    
    let view = PARAMS.currentViewState;
    let viewmode = view.mode;

    switch (viewmode) {
        case "testing":
            drawOuterBox();
            let testState = view.state;
            switch (testState) {
                case "EMPTY": break;
                case "TARGET": drawInnerBox(true); break;
                case "NONTARGET": drawInnerBox(false); break;
            } 
            break;
    }




    // Internal Helpers

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
}

type TovaOuput = {
    sections: TovaSection[],
    allResponses: TovaResponse[],
    allPresents: TovaPresentEvent[],
}
type TovaSection = TovaPresentEvent[] 
type TovaPresentEvent = { 
    isTrigger: boolean, 
    responses: TovaResponse[], 
    orderValue: number, 
    presentedAt?:number,
    data?: {
        isComissionErr: boolean,
        isOmissionErr: boolean,
        isAnticipatoryResponse: boolean,
    }
}
type TovaResponse = {
    triggerAt: number,
    msAfterLastPresent: number,
    lastPresentWasTrigger: boolean,
    present: TovaPresentEvent,
}

// active test
let AT = PARAMS.active_test;

function tova_play() {
    if (!(AT.tova_out)) { tova_reset(); }
    AT.tova_timer_num = setInterval(()=>{
        let present = AT.tova_out.allPresents[AT.tova_nth_present];
        present.presentedAt = (new Date()).getTime();
        
        PARAMS.currentViewState = { mode:"testing", state: present.isTrigger ? "TARGET" : "NONTARGET" }
        PARAMS.redraw();
        setTimeout(() => {
            PARAMS.currentViewState = { mode:"testing", state: "EMPTY" }
            PARAMS.redraw();
        }, PARAMS.tova.time_box_shown); 
        
        if (AT.tova_nth_present + 1 == AT.tova_out.allPresents.length) { tova_pause(); } else {
            AT.tova_nth_present++;
        }
    }, PARAMS.tova.time_between_present);
}

function tova_reset() {
    tova_pause();
    AT.tova_nth_present = 0;

    // Generate Test
    AT.tova_out = {
        sections: [],
        allPresents: [],
        allResponses: []
    }
    for (let s of PARAMS.tova.sections) {
        let sec:TovaSection = [];
        for (let i=0; i < s.nontargets; i++) {
            sec.push({
                isTrigger: false,
                orderValue: Math.random(),
                responses: []
            })
        }
        for (let i=0; i < s.targets; i++) {
            sec.push({
                isTrigger: true,
                orderValue: Math.random(),
                responses: []
            })
        }
        sec.sort((a,b) => a.orderValue - b.orderValue);
        AT.tova_out.sections.push(sec);
        AT.tova_out.allPresents.push(...sec);
    }
}

function tova_pause() {
    if (typeof AT.tova_timer_num == 'number') {
        clearInterval(AT.tova_timer_num);
        AT.tova_timer_num = undefined as any;
    }
}

/**
 * 1. add response to current presesnt
 * 2. add response to all response
 **/
function tova_response() {
    if (!(AT.tova_out)) { return; }
    let current = AT.tova_out.allPresents[AT.tova_nth_present];
   
    let t = (new Date()).getTime(); 
    let r: TovaResponse = {
        lastPresentWasTrigger: current.isTrigger,
        present: current,
        triggerAt: t,
        msAfterLastPresent: t - current.presentedAt!
    } 
    current.responses.push(r);
    AT.tova_out.allResponses.push(r);
}

type SectionResults = {
    errorsOfComission: number,
    errorsOfOmission: number,
    RTVariability: number,
    avgRT: number
}

type GeneratedOut = {
    bysection: SectionResults[],
    byhalf: SectionResults[],
    total: SectionResults
}

function generate_results(o:TovaOuput): GeneratedOut  {
    let out:GeneratedOut = {
        bysection: [],
        byhalf: [],
        total: {} as any
    }

    for (let p of o.allPresents) {
       
        let didRespond = p.responses.length > 0;

        // This happens when trigger is 200ms before present or 150ms after
        let isAR = didRespond && ( 
                        (p.responses[0].msAfterLastPresent > (PARAMS.tova.time_between_present - 200)) || 
                        (p.responses[0].msAfterLastPresent > 150)
                                 );
        // When subject pushes the button when they shouldn’t have 
        let isCom = false;
        // When subject doesnt push button when they should have
        let isOm = false;
        
        // ARs are not counted as commision or omission errors 
        if (!isAR) {
            isCom = didRespond && !p.isTrigger
            isOm = !didRespond && p.isTrigger
        }

        p.data = {
            isComissionErr: isCom,
            isOmissionErr: isOm,
            isAnticipatoryResponse: isAR
        }
    }

    for (let s of o.sections) {
        
    }

    

    return out;
}


main();



































