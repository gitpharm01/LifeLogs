if (!window.console) {
    console = {};
    console.log = function () {}
}
$.ajaxSetup({
    beforeSend: function (a) {
        a.setRequestHeader("X-CSRF-Token", $('meta[name="csrf-token"]').attr("content"))
    }
});
$(document).ready(function () {
    $(".canvas-loading").on("fadedone", function () {
        $(this).fadeToggle("slow", function () {
            $(this).trigger("fadedone")
        })
    })
});
var firstPointMouseTolerance = 16;
var firstPointMouseToleranceOffset = 8;
var mouseTolerance = 8;
var mouseToleranceOffset = 5;
var guideTolerance = 5;
var HIGHLIGHT_ANCHOR_COLOR = "rgb(41,171,226)";
var HIGHLIGHT_ANCHOR_RADIUS = 10;
var HIGHLIGHT_LINE_WIDTH = 2;
var CLOSE_ANCHOR_COLOR = "#000000";
var CLOSE_ANCHOR_RADIUS = 2;
var POINT_BORDER_COLOR = "#df4b26";
var POINT_FILL_COLOR = "rgba(41,171,226,0.75)";
var FIRST_POINT_FILL_COLOR = "rgba(156,228,62,0.7)";
var POINT_RADIUS = 4;
var INITIAL_LINE_COLOR = "rgba(0,255,255,0.7)";
var INITIAL_FILL_COLOR = "#666666";
var INITIAL_LINE_WIDTH = 10;
var CLOSED_LINE_COLOR = "rgba(0,255,255,0.9)";
var SAMPLE_IMAGE_COLOR = "rgba(0,255,255, 0.1)";
var CLOSED_FILL_COLOR = "#EEEEEE";
var CLOSED_LINE_WIDTH = 10;
var LINE_DROPSHADOW_COLOR = "rgba(0,0,0,0.2)";
var LINE_DROPSHADOW_BLUR = 4;
var LINE_DROPSHADOW_OFFSETX = 3;
var LINE_DROPSHADOW_OFFSETY = 3;
var REPLACE_CONTROL_POINT_TOLERANCE = 1;
var TRACE_SCALE_FACTOR = 0.9;
var POINT_DISTANCE_FROM_EDGE = 2;
var POINT_DELETE_MODE_FILL_COLOR = "rgba(178,34,34,0.75)";
var POTENTIAL_LINE_COLOR = "#aaaaaa";
var POTENTIAL_LINE_WIDTH = 8;
var CONTROL_POINT_ACTIVE_RADIUS = 3;
var CONTROL_POINT_ACTIVE_FILL_COLOR = "rgba(251,176,59,0.8)";
var CONTROL_POINT_INACTIVE_RADIUS = 3;
var CONTROL_POINT_INACTIVE_FILL_COLOR = "rgba(251,176,59,0.7)";
var CONTROL_POINT_ADD_FILL_COLOR = "rgba(231,67,255,0.75)";
var CONTROL_POINT_SELECTED_LINE_WIDTH = 2;
var CONTROL_POINT_INACTIVE_SELECTED_COLOR = "#444444";
var CONTROL_POINT_ACTIVE_SELECTED_COLOR = "rgba(251,176,59,0.8)";
var CONTROL_POINT_SELECTED_ANCHOR_RADIUS = 9;
var CONTROL_POINT_TANGENT_WIDTH = 2;
var CONTROL_POINT_TANGENT_COLOR = "rgb(212,20,90)";
var CONTROL_POINT_TANGENT_COLOR_SAMPLE_IMAGE = "rgba(212,20,90,0.15)";
var CONTROL_POINT_LINE_WIDTH = 5;
var GUIDE_LINE_COLOR = "rgba(221,221,221,0.5)";
var GUIDE_LINE_WIDTH = 0.5;
var OVERLAY_OPACITY = 200;
var MAGIC_TRACE_TOLERANCE = 60;
var MAGIC_TRACE_OVERLAY_COLOR = {
    r: 240,
    g: 248,
    b: 255
};
var MAGIC_TRACE_PATH_COLOR = CLOSED_LINE_COLOR;
var MAGIC_TRACE_PATH_WIDTH = 5;
var MAGIC_TRACE_MAX_LOOP_LENGTH = 1000000;
var messages = {
    closed: "Success, your cookie cutter is complete",
    empty: "",
    magictracefailed: "Sorry, magic trace wasn't able to build a cookie cutter",
    startmagictrace: "Magic Trace Mode: Click within your image to auto-select it",
    deletemode: "Delete Mode: Click on any anchor to delete it",
    savedsuccessfully: "Congratulations, your cookie cutter has been added to our gallery",
    savefailed: "Sorry, we weren't able to save your cookie cutter",
    insertmode: "Insert Mode: Click on any purple point to add an anchor there."
};
var cookieCanvas, context;
var traceCanvas, traceContext;
var allPoints = [];
var finalArray = [];
var newPoint;
var offset;
var castId;
var threedeedata;
var colorLayerData;
var colorLayerDataTraceCanvas;
var magicTraceSegmentDictionary = {};
var magicTracePathArray;
var metaUsed = false;
var itemClosed = 0;
var itemEditable = true;
var startOverFlag = 0;
var deleteAnchorMode = 0;
var displaySampleImage = 1;
var magicTrace = 0;
var traceImageLoaded = 0;
var magicTraceError = 0;
var savedCookieCutter = 0;
var fullscreenview = 0;
var insertMode = false;
var editAnchorIndex = -1;
var editControlIndex = -1;
var endpointHover = 0;
var overCanvas = 1;
var guideActiveVertical = -1;
var guideActiveVerticalControl = 0;
var guideActiveHorizontal = -1;
var guideActiveHorizontalControl = 0;
var anchorRemoved = 0;
var demoMode = true;
var inAnchoringDemo = false;
var inCurvingDemo = false;
var inTracingDemo = false;
var inMagicTracingDemo = false;
var inMagicTraceClickingDemo = false;
var inFinishingDemo = false;

function pressDemo(a, b) {
    if (!demoMode) {
        return
    }
}

function dragDemo(a, b) {
    if (!demoMode) {
        return
    }
}

function releaseDemo(a, d) {
    if (!demoMode) {
        return
    }
    if (inCurvingDemo) {
        var c = 0;
        for (var b in allPoints) {
            if (allPoints[b][4]) {
                c++
            }
        }
        if (c == allPoints.length - 2) {
            startTracingDemo()
        }
    }
}

function closedDemo() {
    setTimeout(function () {
        if (itemClosed && inAnchoringDemo) {
            startCurvingDemo()
        }
    }, 0)
}
//Tutorial mode walkthrough
function drawDemo() {
    if (!demoMode) {
        $(".demo-labels").children().fadeOut();
        return
    }
    var e = [[466, 485, 538, 466, 1], [511, 394, 491, 353, 1], [432, 353, 370, 220, 1], [244, 319, 180, 304, 1], [180, 362, 91, 440, 1], [191, 485, 328.5, 485, 0]];
    var l;
    if (inAnchoringDemo) {
        for (var c in e) {
            l = e[c];
            drawPointSphereAdvanced(l[0], l[1], 9, "rgba(51, 195, 250, 0.3)");
            drawPointSphereRadiusAdvanced(l[0], l[1], 14, "rgba(0, 198, 255, 1)")
        }
    } else {
        if (inCurvingDemo) {
            for (var c in e) {
                l = e[c];
                if (l[4] == 0) {
                    continue
                }
                drawPointSphereAdvanced(l[2], l[3], 9, "rgba(51, 195, 250, 0.3)");
                drawPointSphereRadiusAdvanced(l[2], l[3], 14, "rgba(0, 198, 255, 1)");
                var j = new Image();
                j.src = "/demo/arrow-long-mid.png";
                context.drawImage(j, 339, 254);
                var b = new Image();
                b.src = "/demo/arrow-long-bl.png";
                context.drawImage(b, 112, 418);
                var g = new Image();
                g.src = "/demo/arrow-short-br.png";
                context.drawImage(g, 497, 444);
                var d = new Image();
                d.src = "/demo/arrow-short-tl.png";
                context.drawImage(d, 190, 316);
                var h = new Image();
                h.src = "/demo/arrow-stub-tr.png";
                context.drawImage(h, 474, 359)
            }
        } else {
            if (inTracingDemo) {
                var k = new Image();
                k.src = "/demo/arrow-wide-to-trace.png";
                context.drawImage(k, 460, 449)
            } else {
                if (inMagicTracingDemo) {
                    var a = new Image();
                    a.src = "/demo/arrow-wide-to-magictrace.png";
                    context.drawImage(a, 160, 449)
                }
            }
        }
    }
}
//MBD code
//var sampleStartImage = [[[182, 219, 194, 168, 1], [245, 178, 367, 75, 1], [432, 212, 489, 203, 1], [513, 252, 526, 297, 1], [492, 328, 468, 343, 1], [466, 342, 328.5, 342, 0], [191, 342, 148, 320, 1], [148, 286, 141, 266, 1], [153, 252, 167.5, 235.5, 0], [182, 219, 167.5, 235.5, 0]], [[379, 62, 425, 106, 1], [390, 177, 485, 147, 1], [492, 184, 515, 228, 1], [461, 254, 435, 265, 1], [409, 276, 390, 315, 1], [433, 381, 534, 407, 1], [486, 464, 470, 486, 1], [423, 489, 375, 458.5, 1], [327, 428, 288.2828729281768, 449.9745856353591, 0], [253, 470, 189, 506, 1], [150, 453, 129, 398, 1], [206, 387, 253, 340, 1], [241, 276, 200.5, 260, 0], [160, 244, 129, 204, 1], [160, 172, 194, 147, 1], [259, 184, 222, 122, 1], [264, 62, 321.5, 17, 1], [379, 62, 321.5, 62, 1]]];

function beginDemo() {
    startAnchoringDemo()
}
//update progress in different stages of tutorial
function updateDemoStateMachine(a) {
    inAnchoringDemo = (a == "inAnchoringDemo");
    inCurvingDemo = (a == "inCurvingDemo");
    inTracingDemo = (a == "inTracingDemo");
    inMagicTracingDemo = (a == "inMagicTracingDemo");
    inFinishingDemo = (a == "inFinishingDemo");
    inMagicTraceClickingDemo = (a == "inMagicTraceClickingDemo")
}

function startAnchoringDemo() {
    updateDemoStateMachine("inAnchoringDemo");
    $(".demo-instructor.anchoring").fadeIn("slow");
    redraw()
}

function startCurvingDemo() {
    updateDemoStateMachine("inCurvingDemo");
    $(".demo-instructor:visible").fadeOut("slow", function () {
        $(".demo-instructor.curving").fadeIn("slow")
    });
    redraw()
}

function startTracingDemo() {
    updateDemoStateMachine("inTracingDemo");
    $(".demo-instructor:visible").fadeOut("slow", function () {
        $(".demo-instructor.tracing").fadeIn("slow")
    });
    redraw()
}

function startMagicTracingDemo() {
    updateDemoStateMachine("inMagicTracingDemo");
    allPoints = "";
    drawTraceImage("/demo/gingerbreadman.png");
    $(".demo-instructor:visible").fadeOut("slow", function () {
        $(".demo-instructor.magicTracing").fadeIn("slow")
    });
    redraw()
}

function startMagicTraceClickingDemo() {
    updateDemoStateMachine("inMagicTraceClickingDemo");
    $(".demo-instructor:visible").fadeOut("slow", function () {
        $(".demo-instructor.magicTraceClicking").fadeIn("slow")
    });
    redraw()
}

function startFinishingDemo() {
    updateDemoStateMachine("inFinishingDemo");
    $(".demo-instructor:visible").fadeOut("slow", function () {
        $(".demo-instructor.finishing").fadeIn("slow")
    });
    redraw()
}
//Initialize the scene after the page is ready.
var shiftDepressed = 0;
$(document).ready(function () {
    setupCanvas();
    loadInitializer();//A function defiend in the main HTML page, load existing cookie caster models
    
    //make trace buttons visible
    $("#trace-buttons").show();
    $("#tracebtn").css("visibility", "visible");
    $("#cookiesketcharea").mouseenter(function () {
        overCanvas = 1
    });
    //Make dialog for demo
    if (demoMode) {
        $(".mainCanvas").addClass("blackout");
        $(".demo-dialog").show().on("click", ".dialog-button", function (a) {
            $(".demo-dialog").fadeOut("slow");
            $(".mainCanvas").removeClass("blackout");
            if ($(this).hasClass("no-to-demo")) {
                toggleDemoMode();
                return
            }
            beginDemo()
        })
    }
    //switch demoMode
    $(".demo-instructor .exit-demo").on("click", function () {
        toggleDemoMode()
    });
    //Key event???
    $(document).keydown(function (a) {
        if (a.which == 16) {
            shiftDepressed = 1
        }
    });
    $(document).keyup(function (a) {
        if (a.target.nodeName == "INPUT" || a.target.nodeName == "TEXTAREA" || a.target.nodeName == "SELECT") {
            return
        }
        if (a.which == 78 || a.which == 82) {
            startOver();
            return
        } else {
            if (a.which == 80 || a.which == 66) {} else {
                if (a.which == 84) {
                    $("#traceimage").click()
                } else {
                    if (a.which == 68) {
                        toggleDeleteMode()
                    } else {
                        if (a.which == 73) {} else {
                            if (a.which == 83) {
                                saveCast(true, false)
                            } else {
                                if (a.which == 16) {}
                            }
                        }
                    }
                }
            }
        }
    })
});
//switch on or off DemoMode,
function toggleDemoMode() {
    if (demoMode) {
        demoMode = false;
        removeTraceImage();
        $(".toolbar").slideDown();
        $(".demo-instructor").fadeOut("slow");
        startOver();
        redraw()
    } else {
        demoMode = true
    }
}
//Set up the html5 2d canvas 
function setupCanvas() {
    cookieCanvas = document.getElementById("cookiesketcharea");
    if (!cookieCanvas || !cookieCanvas.getContext) {
        return
    }
    context = cookieCanvas.getContext("2d");
    if (!context) {
        return
    }
    setOffset();
    traceCanvas = document.getElementById("tracelayer");
    traceContext = traceCanvas.getContext("2d");
    traceContext.globalAlpha = 0.5;
    //change mouse cursor type 
    cookieCanvas.style.cursor = "crosshair";
    //enable drag and drop and handle image to be dragged into the canvas
    cookieCanvas.addEventListener("dragover", handleDragOver, false);
    cookieCanvas.addEventListener("drop", loadTraceImage, false);
    //add listeners for drawing related mouse event(press, drag, release, cancel) 
    addRelevantEventListeners();
    //CSS effects
    $(".mode-label .exit").click(function () {
        $(this).parent().fadeOut();
        $(".toolbar").slideDown();
        if (insertMode) {
            insertModeToggle()
        } else {
            if (deleteAnchorMode) {
                toggleDeleteMode()
            }
        }
        //initialize the canvas
        redraw()
    });
    //if (sampleStartImage.length > 0) {
    //    var a = sampleStartImage.length == 1 ? 0 : Math.floor(Math.random() * sampleStartImage.length)
    //}
    redraw();
    if (($("meta[name=trace_image]").length == 1) && !metaUsed) {
        metaUsed = true;
        drawTraceImage($("meta[name=trace_image]").attr("content"));
        $("meta[name=trace_image]").remove()
    }
}
//function for mouse 'click'
function press(j) {
    var d = j.pageX - offset.left;
    var b = j.pageY - offset.top;
    if (demoMode) {
        pressDemo(d, b)
    }
    if (allPoints.length == 0 || displaySampleImage) {
        setOffset();
        removeSampleImage();
        if (!magicTrace) {
            return
        }
    }
    if (magicTrace) {
        findSelectedRegion(d, b);
        redraw();
        return
    }
    for (var c = 0; c < allPoints.length; c++) {
        if (((c !== 0 || itemClosed) || (c == 0 && allPoints.length > 0 && allPoints.length < 3)) && checkIfNearPoint(d, b, allPoints[c][0], allPoints[c][1])) {
            if (deleteAnchorMode) {
                var l = removeAnchor(c);
                if (l) {
                    anchorRemoved = 1;
                    if (allPoints.length == 0) {
                        toggleDeleteMode()
                    }
                    redraw();
                    if (itemClosed && allPoints.length == 4) {
                        toggleDeleteMode()
                    }
                } else {
                    toggleDeleteMode()
                }
                return
            }
            editAnchorIndex = c;
            cookieCanvas.style.cursor = "default";
            return
        }
    }
    if (deleteAnchorMode && !itemClosed && checkIfNearPoint(d, b, allPoints[0][0], allPoints[0][1])) {
        var l = removeAnchor(0);
        if (l) {
            anchorRemoved = 1;
            if (allPoints.length == 0) {
                toggleDeleteMode()
            }
            redraw()
        } else {
            toggleDeleteMode()
        }
        return
    }
    if (allPoints.length > 1) {
        for (var c = 0; c < allPoints.length - 1; c++) {
            var h = allPoints[c][2];
            var g = allPoints[c][3];
            if (checkIfNearPoint(d, b, h, g)) {
                if (insertMode) {
                    for (var a = allPoints.length - 1; a > -1; a--) {
                        if (a > c) {
                            allPoints[a + 1] = allPoints[a]
                        }
                        if (a == c) {
                            allPoints[a + 1] = [h, g, h, g, 0];
                            allPoints[a][2] = allPoints[a][0] + (allPoints[a + 1][0] - allPoints[a][0]) / 2;
                            allPoints[a][3] = allPoints[a][1] + (allPoints[a + 1][1] - allPoints[a][1]) / 2;
                            allPoints[a + 1][2] = allPoints[a + 1][0] + (allPoints[a + 2][0] - allPoints[a + 1][0]) / 2;
                            allPoints[a + 1][3] = allPoints[a + 1][1] + (allPoints[a + 2][1] - allPoints[a + 1][1]) / 2
                        }
                    }
                } else {
                    editControlIndex = c;
                    allPoints[editControlIndex][4] = 1;
                    cookieCanvas.style.cursor = "default"
                }
            }
        }
    }
}
//function for mouse up
function release(d) {
    var c = d.pageX - offset.left;
    var b = d.pageY - offset.top;
    if (demoMode) {
        closedDemo();
        releaseDemo(c, b)
    }
    if (magicTrace) {
        return
    }
    if (anchorRemoved == 1) {
        anchorRemoved = 0;
        update3DViewer();
        return
    }
    if (editAnchorIndex != -1) {
        if (deleteAnchorMode != 1 && allPoints.length > 0) {
            if (guideActiveVertical != -1) {
                c = allPoints[guideActiveVertical][0]
            }
            if (guideActiveHorizontal != -1) {
                b = allPoints[guideActiveHorizontal][1]
            }
        }
        changeAnchor(c, b, editAnchorIndex);
        editAnchorIndex = -1;
        redraw();
        update3DViewer();
        cookieCanvas.style.cursor = "crosshair";
        return
    }
    if (editControlIndex != -1) {
        if (determineIfControlPointReplaced(c, b, editControlIndex)) {
            var a = editControlIndex + 1;
            if (itemClosed && a == allPoints.length - 1) {
                a = 0
            }
            recenterControlPointPosition(c, b, editControlIndex);
            editControlIndex = -1;
            update3DViewer();
            redraw();
            cookieCanvas.style.cursor = "crosshair";
            return
        }
        editControlIndex = -1;
        update3DViewer();
        redraw();
        cookieCanvas.style.cursor = "crosshair";
        return
    }
    if (itemClosed || deleteAnchorMode) {
        closedDemo();
        return
    }
    if (endpointHover) {
        addClick(allPoints[0][0], allPoints[0][1]);
        allPoints[allPoints.length - 1][2] = (allPoints[allPoints.length - 2][0] + allPoints[0][0]) / 2;
        allPoints[allPoints.length - 1][3] = (allPoints[allPoints.length - 2][1] + allPoints[0][1]) / 2;
        endpointHover = 0;
        itemClosed = 1;
        redraw();
        updateTopBarMessage("closed");
        createFinalArray();
        update3DViewer();
        cookieCanvas.style.cursor = "default";
        if (demoMode) {
            closedDemo()
        }
    } else {
        cookieCanvas.style.cursor = "crosshair";
        if (deleteAnchorMode != 1 && !itemClosed && allPoints.length > 0) {
            if (guideActiveVertical != -1) {
                c = allPoints[guideActiveVertical][0]
            }
            if (guideActiveHorizontal != -1) {
                b = allPoints[guideActiveHorizontal][1]
            }
        }
        if (determineIfAnyIntersection(c, b)) {
            return
        }
        addClick(c, b);
        if (demoMode) {
            closedDemo()
        }
    }
}
var countDragEventMSIE;

//function for mouse move
function drag(j) {
    var b = j.pageX - offset.left;
    var a = j.pageY - offset.top;
    dragDemo(b, a);
    j.preventDefault();
    if (magicTrace || displaySampleImage) {
        return
    }
    if (allPoints.length == 0) {
        cookieCanvas.style.cursor = "crosshair";
        redrawWithMouseover(b, a);
        return
    }
    turnOffGuides();
    if (deleteAnchorMode != 1) {
        var m, g, l, d;
        for (var h = 0; h < allPoints.length; h++) {
            if (itemClosed && (editAnchorIndex == -1 && editControlIndex == -1)) {
                break
            }
            if (editAnchorIndex == h) {
                continue
            }
            if (editAnchorIndex == 0 && h == allPoints.length - 1) {
                continue
            }
            m = allPoints[h][0] - guideTolerance;
            g = allPoints[h][0] + guideTolerance;
            l = allPoints[h][1] - guideTolerance;
            d = allPoints[h][1] + guideTolerance;
            if (m < b && b < g && guideActiveVertical == -1) {
                b = allPoints[h][0];
                guideActiveVertical = h;
                guideActiveVerticalControl = 0
            } else {
                if (l < a && a < d && guideActiveHorizontal == -1) {
                    a = allPoints[h][1];
                    guideActiveHorizontal = h;
                    guideActiveHorizontalControl = 0
                }
            }
            if (editControlIndex == h || editControlIndex == -1) {
                continue
            }
            m = allPoints[h][2] - guideTolerance;
            g = allPoints[h][2] + guideTolerance;
            l = allPoints[h][3] - guideTolerance;
            d = allPoints[h][3] + guideTolerance;
            if (m < b && b < g && guideActiveVertical == -1) {
                b = allPoints[h][2];
                guideActiveVertical = h;
                guideActiveVerticalControl = 1
            } else {
                if (l < a && a < d && guideActiveHorizontal == -1) {
                    a = allPoints[h][3];
                    guideActiveHorizontal = h;
                    guideActiveHorizontalControl = 1
                }
            }
        }
    }
    if (editAnchorIndex != -1) {
        changeAnchor(b, a, editAnchorIndex);
        redraw();
        highlightPoint(editAnchorIndex, HIGHLIGHT_ANCHOR_COLOR);
        return
    }
    if (editControlIndex != -1) {
        allPoints[editControlIndex][2] = b;
        allPoints[editControlIndex][3] = a;
        if (determineIfControlPointReplaced(b, a, editControlIndex)) {
            allPoints[editControlIndex][4] = 0;
            recenterControlPointPosition(b, a, editControlIndex)
        } else {
            allPoints[editControlIndex][4] = 1
        }
        if ($.browser.msie) {
            if (countDragEventMSIE < 1) {
                countDragEventMSIE++
            } else {
                countDragEventMSIE = 0;
                redraw()
            }
        } else {
            redraw()
        }
        if (allPoints[editControlIndex][4] == 1) {
            showControlPointTangents(editControlIndex);
            highlightControlPoint(editControlIndex, CONTROL_POINT_ACTIVE_SELECTED_COLOR)
        } else {
            highlightControlPoint(editControlIndex, CONTROL_POINT_INACTIVE_SELECTED_COLOR)
        }
        return
    }
    endpointHover = 0;
    for (var h = 0; h < allPoints.length; h++) {
        if ((h == 0 && allPoints.length > 2 && !itemClosed && checkIfNearPointAdvanced(b, a, allPoints[h][0], allPoints[h][1], firstPointMouseTolerance, firstPointMouseToleranceOffset)) || checkIfNearPoint(b, a, allPoints[h][0], allPoints[h][1])) {
            cookieCanvas.style.cursor = "default";
            turnOffGuides();
            var c;
            if (h == 0 && allPoints.length > 2 && !itemClosed) {
                redrawWithMouseover(b, a);
                endpointHover = 1;
                c = CLOSE_ANCHOR_COLOR;
                drawPotentialLine(b, a)
            } else {
                redraw();
                endpointHover = 0;
                c = HIGHLIGHT_ANCHOR_COLOR
            }
            highlightPoint(h, c);
            return
        }
    }
    for (var h = 1; h < allPoints.length; h++) {
        if (checkIfNearPoint(b, a, allPoints[h - 1][2], allPoints[h - 1][3])) {
            turnOffGuides();
            redraw();
            var k = allPoints[h - 1][4] == 1 ? CONTROL_POINT_ACTIVE_SELECTED_COLOR : CONTROL_POINT_INACTIVE_SELECTED_COLOR;
            highlightControlPoint(h - 1, k);
            cookieCanvas.style.cursor = "default";
            return
        }
    }
    if (determineIfAnyIntersection(b, a)) {
        turnOffGuides();
        redraw();
        return
    }
    redraw();
    if (itemClosed) {
        return
    }
    if (deleteAnchorMode) {
        cookieCanvas.style.cursor = "default"
    } else {
        cookieCanvas.style.cursor = "crosshair"
    }
    drawPotentialLine(b, a)
}
//function for mouse out and leave
function cancel(d) {
    var c = d.pageX - offset.left;
    var b = d.pageY - offset.top;
    overCanvas = 0;
    if (editControlIndex != -1) {
        if (determineIfControlPointReplaced(c, b, editControlIndex)) {
            var a = editControlIndex + 1;
            if (itemClosed && a == allPoints.length - 1) {
                a = 0
            }
            recenterControlPointPosition(c, b, editControlIndex);
            editControlIndex = -1;
            update3DViewer();
            turnOffGuides();
            redraw();
            cookieCanvas.style.cursor = "crosshair";
            return
        }
        editControlIndex = -1;
        update3DViewer();
        turnOffGuides();
        redraw();
        cookieCanvas.style.cursor = "crosshair";
        return
    }
    redraw()
}

function requestDownload() {
    if (!itemClosed) {
        alert("Please close the points on your cookie cutter")
    } else {
        //Get model settings from html element(form) with JQuery function "find" 
        form = $("#downloadForm");
        form.find('input[name="points"]').val(JSON.stringify(allPoints));
        form.find('input[name="type"]').val("stl");
        form.find('input[name="size"]').val($("#cookiecuttersizedropdown").val());
        var a = parseFloat($("#cookiecutterheightdropdown").val()) * 25.4;
        form.find('input[name="height"]').val(a);
        form.find('input[name="thickness"]').val($("#cookiecutterthicknessdropdown").val());
        //Send settings by JQuery function "submit" to google analytic(ga)
        form.submit()
    }
}

function changeMaterialCharacteristic() {
    if (itemClosed && !displaySampleImage) {
        update3DViewer()
    }
}

function stopEditing() {
    itemEditable = false;
    cookieCanvas.style.cursor = "crosshair";
    cookieCanvas.removeEventListener("mousedown", press, false);
    cookieCanvas.removeEventListener("mousemove", drag, false);
    cookieCanvas.removeEventListener("mouseup", release);
    cookieCanvas.removeEventListener("mouseout", cancel, false);
    cookieCanvas.removeEventListener("touchstart", press, false);
    cookieCanvas.removeEventListener("touchmove", drag, false);
    cookieCanvas.removeEventListener("touchend", release, false);
    cookieCanvas.removeEventListener("touchcancel", cancel, false);
    redraw()
}

function submitPaypalForm(a) {
    a.stopPropagation();
    a.preventDefault();
    if (!castId) {
        saveCast(false, function () {
            submitForm()
        })
    } else {
        submitForm()
    }
}

function submitForm() {
    if (castId) {
        _gaq.push(["_trackEvent", "cookiecaster", "buy_submitted", "cast id: " + castId]);
        form = $("#paypal_form");
        form.find('input[name="custom"]').val(castId);
        form.submit()
    } else {
        $("#buyModal").modal("toggle");
        $("#alerts").empty().append("Could not complete sale").css("color", "red").show()
    }
}
window.onresize = function (a) {
    setOffset()
};

function setOffset() {
    offset = $("#cookiesketcharea").offset();
    offset.left = Math.round(offset.left);
    offset.top = Math.round(offset.top)
}

function addClick(a, b) {
    if (insertMode) {
        return
    }
    newPoint = [a, b, 0, 0, 0];
    if (allPoints.length > 0) {
        allPoints[allPoints.length - 1][2] = (a + allPoints[allPoints.length - 1][0]) / 2;
        allPoints[allPoints.length - 1][3] = (b + allPoints[allPoints.length - 1][1]) / 2
    }
    allPoints.push(newPoint);
    redraw()
}

function changeAnchor(b, h, e) {
    var d, c;
    d = b - allPoints[e][0];
    c = h - allPoints[e][1];
    allPoints[e][0] += d;
    allPoints[e][1] += c;
    if (allPoints.length > 1) {
        var g = e - 1;
        var a = e + 1;
        if (g == -1 && itemClosed) {
            g = allPoints.length - 2
        }
        if (a == allPoints.length && itemClosed) {
            a = 0
        }
        if (g != -1 && allPoints[g][4] == 0) {
            allPoints[g][2] = (b + allPoints[g][0]) / 2;
            allPoints[g][3] = (h + allPoints[g][1]) / 2
        }
        if (a != allPoints.length && allPoints[e][4] == 0) {
            allPoints[e][2] = (b + allPoints[a][0]) / 2;
            allPoints[e][3] = (h + allPoints[a][1]) / 2
        }
    }
    if (itemClosed && e == 0) {
        allPoints[allPoints.length - 1][0] = b;
        allPoints[allPoints.length - 1][1] = h
    } else {
        if (itemClosed && (e == allPoints.length - 1)) {
            allPoints[0][0] = b;
            allPoints[0][1] = h
        }
    }
}

function removeAnchor(b) {
    if (itemClosed && allPoints.length == 4) {
        return false
    }
    allPoints.splice(b, 1);
    var c = b - 1;
    var a = b;
    if (allPoints.length == 0) {
        return true
    }
    if (a == allPoints.length) {
        allPoints[c][4] = 0;
        return true
    }
    if (c != -1) {
        allPoints[c][2] = (allPoints[c][0] + allPoints[a][0]) / 2;
        allPoints[c][3] = (allPoints[c][1] + allPoints[a][1]) / 2;
        allPoints[c][4] = 0
    } else {
        if (c == -1 && itemClosed) {
            allPoints[allPoints.length - 1][0] = allPoints[0][0];
            allPoints[allPoints.length - 1][1] = allPoints[0][1];
            if ((allPoints.length - 2) != -1) {
                allPoints[allPoints.length - 2][2] = (allPoints[allPoints.length - 1][0] + allPoints[allPoints.length - 2][0]) / 2;
                allPoints[allPoints.length - 2][3] = (allPoints[allPoints.length - 1][1] + allPoints[allPoints.length - 2][1]) / 2;
                allPoints[allPoints.length - 2][4] = 0
            }
        }
    }
    return true
}

function turnOffGuides() {
    guideActiveVertical = -1;
    guideActiveHorizontal = -1
}

function determineAngle(b, a, d, c) {
    var e;
    e = Math.atan2(c - a, d - b);
    return (e / Math.PI)
}

function checkIfNearPoint(b, a, d, c) {
    return (checkIfNearPointAdvanced(b, a, d, c, mouseTolerance, mouseToleranceOffset))
}

function checkIfNearPointAdvanced(c, b, g, e, a, d) {
    if (allPoints.length > 0) {
        if ((c > (g - a + d)) && (c < (g + a + d)) && (b > (e - a + d)) && (b < (e + a + d))) {
            return true
        }
    }
    return false
}

function redrawWithMouseover(b, a) {
    redraw()
}

function redraw() {
    cookieCanvas.width = cookieCanvas.width;
    drawDemo();
    if (magicTrace) {
        context.putImageData(colorLayerData, 0, 0);
        context.strokeStyle = MAGIC_TRACE_PATH_COLOR;
        context.lineWidth = MAGIC_TRACE_PATH_WIDTH;
        if (allPoints != null && allPoints.length > 0) {
            //Start drawing in html5 canvas
            context.beginPath();
            //go to the first point
            context.moveTo(allPoints[0][0], allPoints[0][1]);
            //create lines and draw them
            for (var a = 1; a < allPoints.length; a++) {
                context.lineTo(allPoints[a][0], allPoints[a][1])
            }
            context.stroke();
        }
        return
    }
    var b = itemClosed ? (displaySampleImage ? SAMPLE_IMAGE_COLOR : CLOSED_LINE_COLOR) : INITIAL_LINE_COLOR;
    context.strokeStyle = b;
    context.fillStyle = itemClosed ? CLOSED_FILL_COLOR : INITIAL_FILL_COLOR;
    context.lineJoin = "round";
    context.lineWidth = itemClosed ? CLOSED_LINE_WIDTH : INITIAL_LINE_WIDTH;
    if (allPoints.length == 0 || displaySampleImage) {
        drawStartText()
    }
    if (allPoints.length > 0) {
        context.beginPath();
        //go to the starting point
        context.moveTo(allPoints[0][0], allPoints[0][1]);
        if (allPoints.length > 1) {
            //start the drawing loop from first controlpoint
            for (var a = 1; a < allPoints.length; a++) {
                //allPoints[a-1][2] and [a-1][2] are x,y position of control points, allpoints[a] are the end points
                context.quadraticCurveTo(allPoints[a - 1][2], allPoints[a - 1][3], allPoints[a][0], allPoints[a][1])
            }
            context.stroke()
        }
        //close the path to form a loop
        context.closePath();
        if (!itemEditable) {
            return
        }
        //draw points
        for (var a = 0; a < allPoints.length; a++) {
            if (deleteAnchorMode) {
                drawPointSphereAdvanced(allPoints[a][0], allPoints[a][1], POINT_RADIUS, POINT_DELETE_MODE_FILL_COLOR, 0, "")
            } else {
                if (a == 0 && !itemClosed) {
                    drawPointSphereAdvanced(allPoints[a][0], allPoints[a][1], POINT_RADIUS, FIRST_POINT_FILL_COLOR, 0, "")
                } else {
                    drawPointSphere(allPoints[a][0], allPoints[a][1])
                }
            }
            if (!(a == allPoints.length - 1)) {
                drawControlPointSphere(allPoints[a][2], allPoints[a][3], allPoints[a][4]);
                if (displaySampleImage) {
                    showControlPointTangents(a)
                }
            }
        }
        //draw gray lines to preview the next point and line
        drawRelevantGuides()
    }
}

function highlightControlPoint(b, a) {
    context.lineWidth = CONTROL_POINT_SELECTED_LINE_WIDTH;
    context.strokeStyle = a;
    context.beginPath();
    context.arc(allPoints[b][2], allPoints[b][3], CONTROL_POINT_SELECTED_ANCHOR_RADIUS, 0, 360, false);
    context.stroke();
    context.closePath()
}

function showControlPointTangents(b) {
    var a = b + 1;
    if (itemClosed && a == allPoints.length - 1) {
        a = 0
    } else {
        if (a == allPoints.length) {
            a = 0
        }
    }
    context.lineWidth = CONTROL_POINT_TANGENT_WIDTH;
    context.strokeStyle = displaySampleImage ? CONTROL_POINT_TANGENT_COLOR_SAMPLE_IMAGE : CONTROL_POINT_TANGENT_COLOR;
    context.beginPath();
    context.moveTo(allPoints[b][0], allPoints[b][1]);
    context.lineTo(allPoints[b][2], allPoints[b][3]);
    context.lineTo(allPoints[a][0], allPoints[a][1]);
    context.stroke();
    context.closePath()
}

function highlightPoint(b, a) {
    context.lineWidth = HIGHLIGHT_LINE_WIDTH;
    context.strokeStyle = a;
    context.beginPath();
    context.arc(allPoints[b][0], allPoints[b][1], HIGHLIGHT_ANCHOR_RADIUS, 0, 360, false);
    context.stroke();
    context.closePath()
}

function drawPotentialLine(a, b) {
    if (overCanvas == 0 || deleteAnchorMode || insertMode) {
        return
    }
    context.lineWidth = POTENTIAL_LINE_WIDTH;
    context.strokeStyle = POTENTIAL_LINE_COLOR;
    context.beginPath();
    context.moveTo(allPoints[allPoints.length - 1][0], allPoints[allPoints.length - 1][1]);
    context.lineTo(a, b);
    context.stroke();
    context.closePath()
}

function drawRelevantGuides() {
    if (guideActiveVertical != -1 && guideActiveVerticalControl) {
        drawVerticalGuide(allPoints[guideActiveVertical][2])
    } else {
        if (guideActiveVertical != -1) {
            drawVerticalGuide(allPoints[guideActiveVertical][0])
        }
    }
    if (guideActiveHorizontal != -1 && guideActiveHorizontalControl) {
        drawHorizontalGuide(allPoints[guideActiveHorizontal][3])
    } else {
        if (guideActiveHorizontal != -1) {
            drawHorizontalGuide(allPoints[guideActiveHorizontal][1])
        }
    }
}

function drawVerticalGuide(a) {
    drawGuide(a, 1)
}

function drawHorizontalGuide(a) {
    drawGuide(a, 0)
}

function drawGuide(a, b) {
    context.lineWidth = GUIDE_LINE_WIDTH;
    context.strokeStyle = GUIDE_LINE_COLOR;
    context.beginPath();
    if (b) {
        context.moveTo(a, 0);
        context.lineTo(a, cookieCanvas.height)
    } else {
        context.moveTo(0, a);
        context.lineTo(cookieCanvas.width, a)
    }
    context.stroke();
    context.closePath()
}

function drawControlPointSphere(a, e, d) {
    context.lineWidth = CONTROL_POINT_LINE_WIDTH;
    var c = CONTROL_POINT_INACTIVE_FILL_COLOR;
    var b = CONTROL_POINT_INACTIVE_RADIUS;
    if (insertMode) {
        c = CONTROL_POINT_ADD_FILL_COLOR;
        b = CONTROL_POINT_ACTIVE_RADIUS
    } else {
        if (d != 0) {
            c = CONTROL_POINT_ACTIVE_FILL_COLOR;
            b = CONTROL_POINT_ACTIVE_RADIUS
        }
    }
    if (d == 0) {
        drawPointSphereAdvanced(a, e, b, c, 0, "")
    } else {
        drawPointSphereAdvanced(a, e, b, c, 0, "")
    }
}

function drawPointSphere(a, b) {
    drawPointSphereAdvanced(a, b, POINT_RADIUS, POINT_FILL_COLOR, 1, "rgba(255, 0, 0, 0.3)")
}

function drawPointSphereAdvanced(b, g, a, d, e, c) {
    context.fillStyle = d;
    context.strokeStyle = d;
    context.beginPath();
    context.arc(b, g, a, 0, 360, false);
    context.stroke();
    context.fill();
    context.closePath();
    context.moveTo(b, g)
}

function drawPointSphereRadiusAdvanced(b, g, a, d, e, c) {
    context.strokeStyle = d;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(b, g, a, 0, 360, false);
    context.stroke();
    context.closePath();
    context.moveTo(b, g);
    context.lineWidth = 1
}

//a cluster of event listeners for mouse drawing event
function addRelevantEventListeners() {
    cookieCanvas.addEventListener("mousedown", press, false);
    cookieCanvas.addEventListener("mousemove", drag, false);
    cookieCanvas.addEventListener("mouseup", release);
    cookieCanvas.addEventListener("mouseout", cancel, false);
    cookieCanvas.addEventListener("mouseleave", cancel, false)
}

function drawStartText() {
    var b = cookieCanvas.width / 2;
    var d = cookieCanvas.height / 2 + 15;
    var c = [];
    var a = [];
    if (demoMode || traceImageLoaded) {
        c[0] = ""
    } else {
        c[0] = "Click on the canvas to get started"
    }
    context.font = "16pt Arial";
    context.textAlign = "center";
    context.fillStyle = "rgb(187,187,187)";
    d += 20;
    context.font = "17pt Arial";
    context.fillText(c[0], b, d)
}

function addCanvasImage() {}

function handleDragOver(a) {
    a.stopPropagation();
    a.preventDefault();
    a.dataTransfer.dropEffect = "copy"
}

function loadTraceImage(b) {
    if (b.dataTransfer) {
        img = b.dataTransfer
    } else {
        img = b
    }
    f = img.files[0];
    if (f.type.match("image.*")) {
        if (typeof FileReader !== "undefined") {
            var a = new FileReader();
            a.onload = function (c) {
                drawTraceImage(c.target.result)
            };
            a.readAsDataURL(f)
        } else {
            echoFile(f)
        }
    }
    $(".placeImage").addClass("active")
}

function echoFile(a) {
    var b = new FormData();
    b.append("file", a);
    $.ajax({
        url: "/echo",
        data: b,
        cache: false,
        contentType: false,
        processData: false,
        type: "POST",
        success: function (c) {
            drawTraceImage(c)
        }
    })
}

function drawTraceImage(b) {
    var a = new Image();
    a.onerror = function () {
        $(".canvas-loading").stop().hide();
        $(".canvas-failed").fadeIn(function () {
            setTimeout(function () {
                $(".canvas-failed").fadeOut()
            }, 2500)
        });
        clearTraceImage()
    };
    a.onload = function () {
        $(".canvas-loading").stop().hide();
        var e = (demoMode && (inMagicTracingDemo || inMagicTraceClickingDemo || inFinishingDemo)) ? 1 : Math.min(traceCanvas.width / a.width, traceCanvas.height / a.height) * TRACE_SCALE_FACTOR;
        var d = a.height * e;
        var c = a.width * e;
        traceContext.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
        traceContext.drawImage(a, (traceCanvas.width - c) / 2, (traceCanvas.height - d) / 2 + (demoMode ? 100 : 0), c, d);
        $("#traceimage-add").hide();
        $("#traceimage-remove").show();
        traceImageLoaded = 1;
        if (displaySampleImage) {
            removeSampleImage()
        }
        redraw()
    };
    $(".canvas-loading").trigger("fadedone");
    a.src = b
}

function clearTraceImage() {
    $(".canvas-loading").stop().hide();
    traceContext.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
    $(".placeImage").removeClass("active");
    traceImageLoaded = 0
}

function removeSampleImage() {
    displaySampleImage = 0;
    itemClosed = 0;
    allPoints = []
}

function insertModeToggle() {
    if (displaySampleImage) {
        return
    }
    if (magicTrace) {
        alert("Sorry, you can't delete an anchor point in Magic Trace mode");
        return
    }
    if (insertMode) {
        insertMode = false;
        toggleActive(document.getElementById("insertMode"));
        updateTopBarMessage("empty");
        $(".mode-label").fadeOut()
    } else {
        if (insertMode == 0 && (itemClosed || (!itemClosed && allPoints.length > 1))) {
            $(".mode-label").fadeIn().children(".name").text("Insert");
            insertMode = true;
            toggleActive(document.getElementById("insertMode"));
            updateTopBarMessage("insertmode")
        } else {
            if (itemClosed) {
                return
            } else {
                alert("You must place two anchors before you can add a point between them")
            }
        }
    }
    redraw()
}

function startOver() {
    updateTopBarMessage("empty");
    startOverFlag = 1;
    allPoints = [];
    $("div.completed > button").attr("disabled", "");
    $("#view-container").replaceWith('<div id="view-container"></div>');
    $("#display_data").empty();
    if (magicTrace) {
        toggleMagicTrace();
        toggleMagicTrace()
    }
    itemClosed = 0;
    castId = undefined;
    editAnchorIndex = -1;
    editControlIndex = -1;
    endpointHover = 0;
    overCanvas = 1;
    savedCookieCutter = 0;
    if (deleteAnchorMode) {
        toggleDeleteMode()
    }
    if (insertMode) {
        insertModeToggle()
    }
    $("#alerts").css("display", "none");
    cookieCanvas.style.cursor = "crosshair";
    if (!itemEditable) {
        itemEditable = true;
        addRelevantEventListeners()
    }
    turnOffGuides();
    redraw();
    drawStartText()
}

function determineIfAnyIntersection(c, a) {
    if (allPoints.length < 3) {
        return false
    }
    var e = allPoints[allPoints.length - 1][0];
    var d = allPoints[allPoints.length - 1][1];
    for (var b = 0; b < allPoints.length - 2; b++) {
        if (allPoints[b][4] == 1) {
            continue
        }
        if (DoLineSegmentsIntersect(e, d, c, a, allPoints[b][0], allPoints[b][1], allPoints[b + 1][0], allPoints[b + 1][1])) {
            return true
        }
    }
    return false
}

function determineIfControlPointReplaced(c, b, d) {
    var a = itemClosed ? (d + 1) % (allPoints.length - 1) : (d + 1) % allPoints.length;
    return (pointdistance(c, b, allPoints[d][0], allPoints[d][1]) + pointdistance(c, b, allPoints[a][0], allPoints[a][1]) < pointdistance(allPoints[d][0], allPoints[d][1], allPoints[a][0], allPoints[a][1]) + REPLACE_CONTROL_POINT_TOLERANCE)
}

function recenterControlPointPosition(c, b, d) {
    var e = itemClosed ? (d + 1) % (allPoints.length - 1) : (d + 1) % allPoints.length;
    var h = [];
    h[0] = allPoints[e][0] - allPoints[d][0];
    h[1] = allPoints[e][1] - allPoints[d][1];
    var j = Math.sqrt(Math.pow(h[0], 2) + Math.pow(h[1], 2));
    h[0] /= j;
    h[1] /= j;
    var g = [];
    g[0] = allPoints[d][2] - allPoints[d][0];
    g[1] = allPoints[d][3] - allPoints[d][1];
    var i = g[0] * h[0] + g[1] * h[1];
    var a = [];
    a[0] = allPoints[d][0] + h[0] * i;
    a[1] = allPoints[d][1] + h[1] * i;
    allPoints[d][2] = a[0];
    allPoints[d][3] = a[1];
    allPoints[d][4] = 0
}

function pointdistance(b, d, a, c) {
    return (Math.sqrt(Math.pow((a - b), 2) + Math.pow((c - d), 2)))
}

function inRectangle(l, k, g, d, h, e, a, o) {
    var j = l - g;
    var i = k - d;
    var c = dotproduct(j, i, h, e);
    var m = dotproduct(h, e, h, e);
    var b = dotproduct(j, i, a, o);
    var n = dotproduct(a, o, a, o);
    return (c >= 0 && m >= c && b >= 0 && n >= b)
}

function dotproduct(b, d, a, c) {
    return (b * a + d * c)
}

function IsOnSegment(d, g, b, e, a, c) {
    return (d <= a || b <= a) && (a <= d || a <= b) && (g <= c || e <= c) && (c <= g || c <= e)
}

function ComputeDirection(i, k, g, j, d, h) {
    var e = (d - i) * (j - k);
    var c = (g - i) * (h - k);
    return e < c ? -1 : e > c ? 1 : 0
}

function DoLineSegmentsIntersect(e, j, d, i, b, h, m, g) {
    var c = ComputeDirection(b, h, m, g, e, j);
    var a = ComputeDirection(b, h, m, g, d, i);
    var l = ComputeDirection(e, j, d, i, b, h);
    var k = ComputeDirection(e, j, d, i, m, g);
    return (((c > 0 && a < 0) || (c < 0 && a > 0)) && ((l > 0 && k < 0) || (l < 0 && k > 0))) || (c == 0 && IsOnSegment(b, h, m, g, e, j)) || (a == 0 && IsOnSegment(b, h, m, g, d, i)) || (l == 0 && IsOnSegment(e, j, d, i, b, h)) || (k == 0 && IsOnSegment(e, j, d, i, m, g))
}
//sample points to create an array for final model creation
function createFinalArray() {
    //empty the array first
    finalArray = [];
    if (!itemClosed) {
        return
    }
    for (var b = 0; b < allPoints.length - 1; b++) {
        if (allPoints[b][4] == 0) {
            var a = [];
            a[0] = allPoints[b][0];
            a[1] = allPoints[b][1];
            finalArray.push(a)
        } else {
            if (b == allPoints.length - 2 && itemClosed) {
                nextIndex = 0
            } else {
                nextIndex = b + 1
            }
            interpolatePointsForQuad(allPoints[b][0], allPoints[b][1], allPoints[nextIndex][0], allPoints[nextIndex][1], allPoints[b][2], allPoints[b][3])
        }
    }
}

function interpolatePointsForQuad(h, d, a, l, g, c) {
    var b;
    // e stands for loop length and number of points
    var e = 100;
    var k;
    for (var j = 0; j < e; j++) {
        b = [];
        k = j / e;
        b[0] = (1 - k) * (1 - k) * h + 2 * k * (1 - k) * g + k * k * a;
        b[1] = (1 - k) * (1 - k) * d + 2 * k * (1 - k) * c + k * k * l;
        finalArray.push(b)
    }
}

function loadRemotePoints() {
    clearTraceImage();
    startOver();
    var a = 0;
    data = [[0, 1, 2, 3, 1], [2, 3, 4, 5, 1], [100, 103, 0, 0, 0]];
    for (a = 0; a < data.length; a++) {
        allPoints.push(data[a])
    }
    allPoints.push([allPoints[0][0], allPoints[0][1], 0, 0, 0]);
    itemClosed = true;
    redraw()
}

function update3DViewer() {
    if ($.browser.msie && demoMode && isCurvingDemo) {
        return
    }
    var c = "view-container";
    if (itemClosed) {
        $("#loadingframe").css("visibility", "visible");
        $("#" + c).replaceWith('<div id="' + c + '"></div>');
        var a = $("#" + c);
        //get value of model settings
        form = $("#downloadForm");
        form.find('input[name="points"]').val(JSON.stringify(allPoints));
        form.find('input[name="type"]').val("obj");
        form.find('input[name="size"]').val($("#cookiecuttersizedropdown").val());
        var b = parseFloat($("#cookiecutterheightdropdown").val()) * 25.4;
        form.find('input[name="height"]').val(b);
        form.find('input[name="thickness"]').val($("#cookiecutterthicknessdropdown").val());
        //send value to ajax
        $.ajax({
            url: "/download.json",
            data: form.serialize(),
            type: "post",
            statusCode: {
                500: function () {}
            },
            error: function (e, g, d) {
                $("#alerts").empty().append("Sorry, we've had an error creating that 3D model. This almost always means that some lines were drawn too close together (or intersecting), which will lead to a bad cookie cutter - try again, ensuring there are no thin sections.").css("color", "red").show();
                $("#loadingframe").css("visibility", "hidden");
                setOffset()
            },
            success: function (e) {
                $("#alerts").hide();
                $("#alerts").empty();
                setOffset();
                $("#" + c).replaceWith('<div id="' + c + '"></div>');
                var d = $("#" + c);
                d.height("210px");
                d.width("262px");
                $("#loadingframe").css("visibility", "hidden");
                threedeedata = e;
                load_viewer(threedeedata, c);
                animate()
            }
        })
    }
}

function toggleDeleteMode() {
    if (displaySampleImage) {
        return
    }
    if (magicTrace) {
        alert("Sorry, you can't delete an anchor point in Magic Trace mode");
        return
    }
    if (deleteAnchorMode) {
        deleteAnchorMode = 0;
        toggleActive(document.getElementById("deletebutton"));
        updateTopBarMessage("empty");
        $(".mode-label").fadeOut()
    } else {
        if (deleteAnchorMode == 0 && ((itemClosed && allPoints.length > 3) || (!itemClosed && allPoints.length > 0))) {
            $(".mode-label").fadeIn().children(".name").text("Delete");
            deleteAnchorMode = 1;
            toggleActive(document.getElementById("deletebutton"));
            updateTopBarMessage("deletemode")
        } else {
            if (itemClosed) {
                return
            } else {
                alert("You must place an anchor before you can delete it")
            }
        }
    }
    redraw()
}

function togglebuyoverlay() {
    el = document.getElementById("buyoverlay");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible"
}

function togglefullscreenoverlay() {
    if (!itemClosed) {
        alert("To see a full screen view of your cookie cutter, you must first 'close' your cookie cutter");
        return
    } else {
        if (displaySampleImage) {
            alert("Draw your own cookie cutter to see it.");
            return
        }
    }
    el = document.getElementById("fullscreenoverlay");
    if (!fullscreenview) {
        fullscreenview = 1;
        $("#view-container").replaceWith('<div id="view-container"></div>');
        el.style.visibility = "visible";
        update3dviewerlocal("fullview-container", 500, 750)
    } else {
        fullscreenview = 0;
        $("#fullview-container").replaceWith('<div id="fullview-container"></div>');
        el.style.visibility = "hidden";
        update3dviewerlocal("view-container", 210, 262)
    }
}

function toggleActive(a) {
    $(a).toggleClass("active")
}

function update3dviewerlocal(d, a, c) {
    var b = $("#" + d);
    $("#" + d).css("backgroundImage", "none");
    b.height(a + "px");
    b.width(c + "px");
    load_viewer(threedeedata, d);
    animate()
}

function toggleMagicTrace() {
    if (!traceImageLoaded) {
        alert("To use magic trace, load an image to trace");
        return
    }
    if (demoMode && inMagicTracingDemo) {
        startMagicTraceClickingDemo()
    }
    if (deleteAnchorMode) {
        toggleDeleteMode()
    }
    if (insertMode) {
        insertModeToggle()
    }
    if (!magicTrace && traceImageLoaded) {
        loadMagicTrace();
        $(".toolbar").slideUp()
    } else {
        if (magicTrace) {
            removeMagicTrace();
            $(".toolbar").slideDown()
        }
    }
}

function loadMagicTrace() {
    startOver();
    magicTrace = 1;
    allPoints = [];
    colorLayerData = context.getImageData(0, 0, cookieCanvas.width, cookieCanvas.height);
    colorLayerDataTraceCanvas = traceContext.getImageData(0, 0, traceCanvas.width, traceCanvas.height);
    $("#magictracebtn").addClass("active");
    updateTopBarMessage("startmagictrace");
    toggleActive(document.getElementById("penbutton"));
    redraw()
}

function removeMagicTrace() {
    updateTopBarMessage("empty");
    $("#magictracebtn").removeClass("active");
    toggleActive(document.getElementById("penbutton"));
    magicTrace = 0;
    allPoints = [];
    colorLayerDataTraceCanvas = null;
    colorLayerData = null;
    magicTraceSegmentDictionary = {};
    startOver()
}

function findSelectedRegion(h, d) {
    if (demoMode && inMagicTraceClickingDemo) {
        startFinishingDemo()
    }
    cookieCanvas.width = cookieCanvas.width;
    colorLayerData = null;
    colorLayerData = context.getImageData(0, 0, cookieCanvas.width, cookieCanvas.height);
    magicTraceSegmentDictionary = {};
    allPoints = [];
    magicTracePathArray = null;
    var k = (d * traceCanvas.width + h) * 4,
        j = colorLayerDataTraceCanvas.data[k],
        i = colorLayerDataTraceCanvas.data[k + 1],
        c = colorLayerDataTraceCanvas.data[k + 2],
        e = colorLayerDataTraceCanvas.data[k + 3];
    if (j == 0 && i == 0 && c == 0 && e == 0) {
        return
    }
    floodFill(h, d, j, i, c);
    buildOutline();
    if (allPoints.length != 0 && !magicTraceError) {
        update3DViewer();
        updateTopBarMessage("closed")
    } else {
        if (magicTraceError) {
            magicTracePathArray = [];
            magicTraceError = 0;
            updateTopBarMessage("magictracefailed")
        }
    }
}

function floodFill(r, q, u, d, g) {
    var k = 1,
        j = 1;
    var o = traceCanvas.width;
    var s = traceCanvas.height;
    var b, i, h, t, e, c, l = k,
        n = j,
        p = k + o - 1,
        m = j + s - 1,
        a = [[r, q]];
    while (a.length) {
        b = a.pop();
        i = b[0];
        h = b[1];
        t = (h * traceCanvas.width + i) * 4;
        while (h >= n && matchStartColor(t, u, d, g)) {
            h -= 1;
            t -= traceCanvas.width * 4
        }
        t += traceCanvas.width * 4;
        h += 1;
        e = false;
        c = false;
        while (h <= m && matchStartColor(t, u, d, g)) {
            h += 1;
            colorPixel(t, MAGIC_TRACE_OVERLAY_COLOR.r, MAGIC_TRACE_OVERLAY_COLOR.g, MAGIC_TRACE_OVERLAY_COLOR.b);
            if (i > l) {
                if (matchStartColor(t - 4, u, d, g)) {
                    if (!e) {
                        a.push([i - 1, h]);
                        e = true
                    }
                } else {
                    if (e) {
                        e = false
                    }
                }
            }
            if (i < p) {
                if (matchStartColor(t + 4, u, d, g)) {
                    if (!c) {
                        a.push([i + 1, h]);
                        c = true
                    }
                } else {
                    if (c) {
                        c = false
                    }
                }
            }
            t += traceCanvas.width * 4
        }
    }
}

function matchStartColor(j, m, e, k) {
    var a = colorLayerDataTraceCanvas.data[j];
    var l = colorLayerDataTraceCanvas.data[j + 1];
    var n = colorLayerDataTraceCanvas.data[j + 2];
    var i = colorLayerData.data[j + 3];
    if (i > 0) {
        return false
    }
    var c = 0.34 * a + 0.5 * l + 0.16 * n;
    var h = 0.34 * m + 0.5 * e + 0.16 * k;
    var d = c > (h - MAGIC_TRACE_TOLERANCE) && c < (h + MAGIC_TRACE_TOLERANCE);
    if (d) {
        return true
    }
    return false
}

function colorPixel(i, h, e, c, d) {
    colorLayerData.data[i] = h;
    colorLayerData.data[i + 1] = e;
    colorLayerData.data[i + 2] = c;
    colorLayerData.data[i + 3] = OVERLAY_OPACITY
}

function buildOutline() {
    var i;
    var j;
    var h = cookieCanvas.width;
    var k = cookieCanvas.height;
    var e = h * k * 4;
    var d, c;
    var g;
    var a;
    var m;
    var b, l;
    for (i = 0; i < colorLayerData.data.length; i += 4) {
        if (colorLayerData.data[i + 3] == OVERLAY_OPACITY) {
            g = [i - (h * 4), i + (h * 4), i - 4, i + 4];
            m = i / 4;
            d = m % h;
            c = Math.floor(m / h);
            for (a = 0; a < 4; a++) {
                if (g[a] < 0 || g[a] > e || colorLayerData.data[g[a] + 3] != OVERLAY_OPACITY) {
                    switch (a) {
                        case 0:
                            b = [d, c];
                            l = [d + 1, c];
                            break;
                        case 1:
                            b = [d, c + 1];
                            l = [d + 1, c + 1];
                            break;
                        case 2:
                            b = [d, c];
                            l = [d, c + 1];
                            break;
                        case 3:
                            b = [d + 1, c];
                            l = [d + 1, c + 1];
                            break
                    }
                    addSegment(b, l);
                    addSegment(l, b)
                }
            }
        }
    }
    colorLayerData = context.getImageData(0, 0, cookieCanvas.width, cookieCanvas.height);
    for (xcoord in magicTraceSegmentDictionary) {
        for (ycoord in magicTraceSegmentDictionary[xcoord]) {
            magicTracePathArray = tracePath(xcoord, ycoord);
            magicTraceSegmentDictionary = {};
            break
        }
        break
    }
    if (!magicTraceError) {
        convertPathToAllPoints()
    }
}

function convertPathToAllPoints() {
    var a = false;
    var e = false;
    var d, c;
    if (magicTracePathArray.length == 0) {
        return
    }
    allPoints = [];
    for (var b = 0; b < magicTracePathArray.length; b++) {
        allPoints.push([magicTracePathArray[b][0], magicTracePathArray[b][1], 0, 0, 0])
    }
    for (var b = 0; b < allPoints.length - 1; b++) {
        allPoints[b][2] = (allPoints[b][0] + allPoints[b + 1][0]) / 2;
        allPoints[b][3] = (allPoints[b][1] + allPoints[b + 1][1]) / 2
    }
    itemClosed = true;
    magicTracePathArray = []
}

function addSegment(b, a) {
    if (magicTraceSegmentDictionary[b[0]] == undefined) {
        magicTraceSegmentDictionary[b[0]] = {};
        magicTraceSegmentDictionary[b[0]][b[1]] = []
    } else {
        if (magicTraceSegmentDictionary[b[0]][b[1]] == undefined) {
            magicTraceSegmentDictionary[b[0]][b[1]] = []
        }
    }
    magicTraceSegmentDictionary[b[0]][b[1]].push(a)
}

function tracePath(h, e) {
    var a = [parseFloat(h), parseFloat(e)];
    var c = magicTraceSegmentDictionary[a[0]][a[1]][0];
    var j = a;
    var k = [];
    k.push(a);
    k.push(c);
    var i = 0;
    while (c[0] != a[0] || c[1] != a[1]) {
        var d = magicTraceSegmentDictionary[c[0]][c[1]][0];
        var b = magicTraceSegmentDictionary[c[0]][c[1]][1];
        var g = d;
        if (g[0] == j[0] && g[1] == j[1]) {
            g = b
        }
        k.push(g);
        j = c;
        c = g;
        i++;
        if (i > MAGIC_TRACE_MAX_LOOP_LENGTH) {
            magicTraceError = 1;
            break
        }
    }
    k.push(a);
    return k
}

function zeroElementsInAssociativeArray(b) {
    var a = 0;
    for (ycoord in b) {
        a++;
        if (a > 0) {
            return false
        }
    }
    return true
}

function backupImageLoad() {
    if (typeof FileReader !== "undefined") {
        return
    }
    filepicker.setKey("pTUPBm-vRgC3BzA3WqOs");
    filepicker.getFile(["image/*"], {
        modal: true,
        services: [filepicker.SERVICES.COMPUTER, filepicker.SERVICES.DROPBOX, filepicker.SERVICES.URL],
        location: "/computer"
    }, function (a, b) {
        $("#tracebtn").addClass("active");
        $(".placeImage").addClass("active");
        $.post("/casts/image_reserve.json?" + Math.random(), {
            url: a
        }, function (c) {
            drawTraceImage(c.new_url)
        })
    })
}

function toggleTraceImage() {
    if (!traceImageLoaded) {
        if (typeof FileReader === "undefined") {
            backupImageLoad()
        } else {
            $("#traceimage").click()
        }
    } else {
        clearTraceImage();
        if (magicTrace) {
            removeMagicTrace()
        }
    }
}

function removeTraceImage() {
    if (traceImageLoaded) {
        clearTraceImage();
        if (magicTrace) {
            removeMagicTrace()
        }
        return true
    }
    return false
}

function toggleTraceMenu() {
    if (removeTraceImage()) {
        return
    }
    var a = $(".placeImage");
    a.toggleClass("active");
    if (demoMode && inTracingDemo) {
        return startMagicTracingDemo()
    }
    if (a.hasClass("active")) {
        a.find(".tracedown").slideDown()
    } else {
        a.find(".tracedown").slideUp()
    }
}
$(".placeImage .tracedown").click(function (a) {
    a.stopPropagation()
});

function goToByScroll(a) {
    $("html,body").animate({
        scrollTop: $("#" + a).offset().top
    }, "slow")
}

function updateTopBarMessage(a) {
    $("#toptipspane .tiptext").html(messages[a])
}

function resetTraceImageFUpload() {
    $("#traceimage").val("")
};