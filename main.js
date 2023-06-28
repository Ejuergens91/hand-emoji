/*jshint esversion:6*/

$(function () {
    const video = $("video")[0];

    var model;
    var cameraMode = "environment"; // or "user"

    const startVideoStreamPromise = navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                facingMode: cameraMode
            }
        })
        .then(function (stream) {
            return new Promise(function (resolve) {
                video.srcObject = stream;
                video.onloadeddata = function () {
                    video.play();
                    resolve();
                };
            });
        });

    var publishable_key = "rf_ANN2bGZ172TygccVOHL5ZhxlUmj1";
    var toLoad = {
        model: "common-hand-gestures-emoji",
        version: 6
    };

    const loadModelPromise = new Promise(function (resolve, reject) {
        roboflow
            .auth({
                publishable_key: publishable_key
            })
            .load(toLoad)
            .then(function (m) {
                model = m;
                resolve();
            });
    });

    Promise.all([startVideoStreamPromise, loadModelPromise]).then(function () {
        $("body").removeClass("loading");
        resizeCanvas();
        detectFrame();
    });

    var canvas, ctx;
    const font = "16px sans-serif";



    function videoDimensions(video) {
        // Ratio of the video's intrisic dimensions
        var videoRatio = video.videoWidth / video.videoHeight;

        // The width and height of the video element
        var width = video.offsetWidth,
            height = video.offsetHeight;

        // The ratio of the element's width to its height
        var elementRatio = width / height;

        // If the video element is short and wide
        if (elementRatio > videoRatio) {
            width = height * videoRatio;
        } else {
            // It must be tall and thin, or exactly equal to the original ratio
            height = width / videoRatio;
        }

        return {
            width: width,
            height: height
        };
    }

    $(window).resize(function () {
        resizeCanvas();
    });

    let ball = document.getElementById("ball")
    let point1 = document.getElementById("point1")
    let live1 = document.getElementById("live1")
    let punching = document.getElementById("punching1")
    let raisedfist = document.getElementById("raisedfist")
    let praying = document.getElementById("praying")
    let rock = document.getElementById("rock")
    let love = document.getElementById("love")
    let raisedhand = document.getElementById("raisedhand")
    let callme = document.getElementById("callme")
    let crossed = document.getElementById("crossed")
    let middle = document.getElementById("middle")
    
    let predictions = []
    let position = {x: 10, y: 10}
    let speed = {x: 1, y: 1}
    
    

    const resizeCanvas = function () {
        $("canvas").remove();

        canvas = $("<canvas/>");

        ctx = canvas[0].getContext("2d");

        var dimensions = videoDimensions(video);

        console.log(
            video.videoWidth,
            video.videoHeight,
            video.offsetWidth,
            video.offsetHeight,
            dimensions
        );

        canvas[0].width = video.videoWidth;
        canvas[0].height = video.videoHeight;

        canvas.css({
            width: dimensions.width,
            height: dimensions.height,
            left: ($(window).width() - dimensions.width) / 2,
            top: ($(window).height() - dimensions.height) / 2
        });

        $("body").append(canvas);

        // runAnimation()
    };

    function renderPredictions (preds) {
        predictions = preds
        draw()
    }

    function runAnimation(){
        position.x += speed.x
        position.y += speed.y
        draw()
        setTimeout(runAnimation, 30)
    }

    function draw () {
        var dimensions = videoDimensions(video);

        var scale = 1;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // ctx.drawImage(ball, position.x, position.y, 100, 100)

        // ctx.strokeRect(10,10, 100, 100)

        predictions.forEach(function (prediction) {
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;

            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            // Draw the bounding box.
            ctx.strokeStyle = prediction.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(
                (x - width / 2) / scale,
                (y - height / 2) / scale,
                width / scale,
                height / scale
            );

            // Draw the label background.
            ctx.fillStyle = prediction.color;
            console.log(prediction.class)
            const textWidth = ctx.measureText(prediction.class).width;
            const textHeight = parseInt(font, 10); // base 10
            ctx.fillRect(
                (x - width / 2) / scale,
                (y - height / 2) / scale,
                textWidth + 8,
                textHeight + 4
            );
            if (prediction.class == "Okay") {
                ctx.drawImage(ball, position.x, position.y, 100, 100)

            }
            if (prediction.class == "Pointing-Up") {
                ctx.drawImage(point1, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Live-Long-Prosper") {
                ctx.drawImage(live1, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Hand-Raised") {
                ctx.drawImage(raisedhand, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Raised-Fist") {
                ctx.drawImage(raisedfist, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Oncoming-Punch") {
                ctx.drawImage(punching, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Praying-Hands") {
                ctx.drawImage(praying, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Middle") {
                ctx.drawImage(middle, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Call-me") {
                ctx.drawImage(callme, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Fingers-Crossed") {
                ctx.drawImage(crossed, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Rock") {
                ctx.drawImage(rock, position.x, position.y, 100, 100)
            }

            if (prediction.class == "Love-You") {
                ctx.drawImage(love, position.x, position.y, 100, 100)
            }

        });

        predictions.forEach(function (prediction) {
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;

            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            // Draw the text last to ensure it's on top.
            ctx.font = font;
            ctx.textBaseline = "top";
            ctx.fillStyle = "#000000";
            ctx.fillText(
                prediction.class,
                (x - width / 2) / scale + 4,
                (y - height / 2) / scale + 1
            );
        });
    };
 
    var prevTime;
    var pastFrameTimes = [];
    const detectFrame = function () {
        if (!model) return requestAnimationFrame(detectFrame);

        model
            .detect(video)
            .then(function (predictions) {
                requestAnimationFrame(detectFrame);
                renderPredictions(predictions);

                if (prevTime) {
                    pastFrameTimes.push(Date.now() - prevTime);
                    if (pastFrameTimes.length > 30) pastFrameTimes.shift();

                    var total = 0;
                    _.each(pastFrameTimes, function (t) {
                        total += t / 1000;
                    });

                    var fps = pastFrameTimes.length / total;
                    $("#fps").text(Math.round(fps));
                }
                prevTime = Date.now();
            })
            .catch(function (e) {
                console.log("CAUGHT", e);
                requestAnimationFrame(detectFrame);
            });
    };
});
