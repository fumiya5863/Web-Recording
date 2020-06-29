'use strict';
{
    // 変数と定数の初期化
    const localVideo  = document.getElementById('video');
    const recordVideo = document.getElementById('recordVideo');
    const recordBtn   = document.getElementById('record');
    const playbackBtn = document.getElementById('playback');
    const downloadBtn = document.getElementById('download');
    let localStream;
    let mediaRecord;
    let recordBlobs;

    // メディアの種類や形態を指定
    const constraints = {
        video: {
            width: 1280,
            height: 720,
        },
        audio: true,
    };
    
    // ユーザーからメディアの使用許可を確認
    // OK: 音声と映像を取得
    // NO or Error: エラー表示
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            localVideo.srcObject = stream;
            localStream = stream;
        }).catch((error) => {
            console.log(error);
            alert('接続に失敗しました');
        });
    
    recordBtn.addEventListener('click', () => {
        if (recordBtn.textContent === "録画開始") {
            recordBlobs = [];
            const mediaType = { mimeType: 'video/webm;codecs=vp9'};

            try {
                mediaRecord = new MediaRecorder(localStream, mediaType);
            } catch(error) {
                console.log(error);
            }

            // 一定間隔で録画が区切られて、データが渡される
            mediaRecord.ondataavailable = (event) => {
                recordBlobs.push(event.data);
            };
            
            // メディア記録の開始 100ミリ秒ごとに録画データを区切る
            mediaRecord.start(100);
            
            recordBtn.textContent = "録画停止";
            playbackBtn.disabled  = true; 
            downloadBtn.disabled  = true;  
            
        } else {
            // 録画停止
            mediaRecord.stop();

            // 録画停止時に呼ばれる
            mediaRecord.onstop = () => {
                mediaRecord = null;
            };

            recordBtn.textContent = "録画開始";
            playbackBtn.disabled  = false;
            downloadBtn.disabled  = false;
        }
    });

    playbackBtn.addEventListener('click', () => {
        const mediaType = { type: 'video/webm' };
        const blob = new Blob(recordBlobs, mediaType);
        const url = window.URL.createObjectURL(blob);
        recordVideo.src = url;
        recordVideo.controls = true;
    });

    downloadBtn.addEventListener('click', () => {
        const mediaType = { type: 'video/webm' };
        const blob = new Blob(recordBlobs, mediaType);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "WebRTC.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    });



}