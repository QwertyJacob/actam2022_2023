var c = new AudioContext();

var recordBuffer = c.createBuffer(1, 5*c.sampleRate, c.sampleRate);

var recorderNode = c.createScriptProcessor(1024, 1, 1);
var index = 0;
var recording=true;
var selStart = 1*c.sampleRate;
var selEnd = 3*c.sampleRate;

/** @type HTMLCanvasElement */
var canvas = document.getElementById("sound");
var cc = canvas.getContext("2d");
var o = c.createOscillator();
o.type = "triangle";
o.connect(recorderNode);
recorderNode.connect(c.destination);
//o.start();

recorderNode.onaudioprocess = function(e) {

    const inputBuffer = e.inputBuffer;
    
    const inputData = inputBuffer.getChannelData(0);
    const recordData = recordBuffer.getChannelData(0);
    
    for(let i=0;i<inputData.length;i++) {
        if(recording) {
            recordData[index] = inputData[i];
            index += 1;
            index = (index > recordData.length) ? 0 : index;
        }
    }


}


function render() {
    window.requestAnimationFrame(render);
    cc.clearRect(0,0,canvas.width,canvas.height);
    cc.beginPath();
    cc.moveTo(0,canvas.height/2);
    const recordData = recordBuffer.getChannelData(0);
    for(let i=0;i<canvas.width;i++) {
        const audioIndex = Math.floor(i*(recordData.length/canvas.width));
        cc.lineTo(i, recordData[audioIndex]*canvas.height/2+canvas.height/2);
    }
    // draw the recording position
    const recordingIndex = Math.floor(index*(canvas.width/recordData.length));
    cc.moveTo(recordingIndex,0);
    cc.lineTo(recordingIndex,canvas.height);

    // draw selection clip frame
    selCanvasStartIndex = Math.floor(selStart*canvas.width/recordData.length);
    selCanvasEndIndex = Math.floor(selEnd*canvas.width/recordData.length);
    cc.rect(selCanvasStartIndex,0,selCanvasEndIndex,canvas.height);

    cc.stroke();

}

render();

document.onclick = main;

async function main() {
    c.resume();
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const mss = c.createMediaStreamSource(stream);
    mss.connect(recorderNode);
}

document.getElementById("stop").onclick = function() {
    recording = !recording;
}

function play() {
    const bs = c.createBufferSource();
    bs.buffer = recordBuffer;
    bs.connect(c.destination);
    bs.start();
}