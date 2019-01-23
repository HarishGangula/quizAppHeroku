angular.module('playerApp', ['ngSanitize'])
  .controller('playerAppController', function($interval, $timeout, $scope) {
    const socket = io();
    var player = this;
    player.showOptions =  true;
    player.showScan =  true;


    socket.on('question', function(data){
        quizController.showQuestion = true;
        var options = _.get(JSON.parse(_.get(data, 'data.body')), 'data.data.options');
        $scope.questionTitle = question.text;
        if(question.image){
            $scope.image = 'https://dev.ekstep.in'+ question.image;
        } else {
            $scope.image = '';
        }
        $scope.$apply();
        quizController.startQuestionTimer()
    })






    //qrcode

    var video = document.createElement("video");
    var canvasElement = document.getElementById("canvas");
    var canvas = canvasElement.getContext("2d");
    function drawLine(begin, end, color) {
        canvas.beginPath();
        canvas.moveTo(begin.x, begin.y);
        canvas.lineTo(end.x, end.y);
        canvas.lineWidth = 4;
        canvas.strokeStyle = color;
        canvas.stroke();
    }
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
    });
    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && !document.getElementById('qrcode').value) {
                drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
                document.getElementById('qrcode').value = code.data
                verifyQrCode(code.data);
            }
        }
        requestAnimationFrame(tick);
    }

    function verifyQrCode(code) {
        var data = {
            request: {
                code: code,
                roleCode: 'teacher id',
                stallCode: 'STA1',
                ideaCode: 'Idea Code'
            }
        };
        var telemetryData = {
            "events": [{
                "eid": "DC_START",
                "ets": new Date().getTime(),
                "did": "ddd",
                "dimensions": {
                    "visitorId": code,
                    "stallId": "stallId",
                    "ideaId": "ideaId",
                    "visitorName": "Visitor Name",
                    "studentId": "studentId",
                    "studentName": "studentName",
                    "teacherId": "teacherId",
                    "teacherName": "teacherName",
                    "parentId": "parentId",
                    "parentName": "parentName",
                    "stallName": "stallName",
                    "ideaName": "ideaName",
                    "classroomId": "classroomId",
                    "school": "school",
                    "district": "district",
                    "period": "period",
                    "topics": "topics",
                    "subject": "subject",
                    "grade": "grade"
                },
                "edata": {}
            }
            ]
        };
        $.ajax({
            method: 'POST',
            url: 'https://dev.ekstep.in/api/devcon/v3/login',
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
        }).done(function (data) {
            if (data.result && data.result.Visitor) {
                $.ajax({
                    method: 'POST',
                    url: 'http://52.172.188.118:3000/v1/telemetry',
                    data: JSON.stringify(telemetryData),
                    dataType: 'json',
                    contentType: 'application/json',
                }).done(function (data) {
                    console.log(data)
                });
            } else {
            }
        }).error(function (error) {
        });
    }
  })


  //