;(function () {


trainingSet = [];
featureSetSize = 2;
outputNodes = 30;

var Game = (function () {

function Game (width, height) {
    this._width = width;
    this._height = height;
    this._trackHeight = 4.8 * (this._height / 5);
    this._observationFrequency = 600;
    this._shootEveryXObservations = 4;
    this._traingSetSize = 100;
    this._init ();
    this._board;
    this._start = +new Date ();
    this._hits = [];
    this.pausedTime = null;

    var elapsedTime$ = $('#score-box .elapsed-time span');
    var that = this;
    this.timeInactive = 0;
    setInterval (function () {
        if (that.pausedTime) {
            that.timeInactive += (+new Date ()) - that.pausedTime;
            that.pausedTime = 0;
        }
        var diff = +new Date () - that._start - that.timeInactive;
        var seconds = Math.floor (diff / 1000);
        var minutes = Math.floor (seconds / 60);
        seconds = seconds % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        elapsedTime$.text (minutes + ':' + seconds);
    }, 1000);
};


Game.prototype._setUpBoard = function () {
    var that = this;
    this._board = d3.select ('#game').append ('svg').attr ({
        width: this._width,
        height: this._height,
    });
    var gunHeight = 1 * (this._height / 5);

    this._track = this._board
        .append ('line')
        .attr ({
            x1: 0,
            y1: that._trackHeight,
            x2: this._width,
            y2: that._trackHeight,
            'stroke-width': 2,
            'stroke': 'black',
        });

    this._player = this._board
        .append ('circle')
        .attr ({
            cx: this._width / 2,
            cy: that._trackHeight,
            r: 5
        });

    this._ai = this._board
        .append ('circle')
        .attr ({
            cx: this._width / 2,
            cy: gunHeight,
            r: 5
        });
};

Game.prototype._playerInteraction = function () {
    var LEFT = 37;
    var RIGHT = 39;
    var that = this;
    var v = 0;
    var a = 0;
    var interval = null;
    var timeout = null;
    var duration = 1000;
    var maxV = 5;


    var left = true;
    var stepSize = 10;
    setInterval (function () {
        requestAnimationFrame (function () {
        that._player
            .attr ('cx', function () {
                var newPos = parseFloat (d3.select (this).attr ('cx')) + 
                    (left ? -stepSize : stepSize);
                if (!left && newPos > that._width)
                    newPos = 0;
                else if (left && newPos < 0)
                    newPos = that._width;
//                var newPos = parseFloat (d3.select (this).attr ('cx')) + 
//                    (left ? -stepSize : stepSize);
//                if (left && newPos < 0) {
//                    newPos = 0;
//                    left = false;
//                } else if (!left && newPos > that._width) {
//                    newPos = that._width;
//                    left = true;
//                }
                return newPos;
            })
            ;
        });
    }, 30);

//    function animate () {
//        var cx = parseFloat (that._player.attr ('cx'));
//        that._player
//            .transition ()
//            .duration (duration)
//            .attrTween ("cx", function() { 
//                return function (t) {
//                    cx += v;
//                    if (cx < 5) {
//                        cx = 5;
//                        v = 0;
//                        a = 0;
//                        clearTimeout (timeout);
//                        clearTimeout (interval);
//                    } else if (cx > that._width - 5) {
//                        cx = that._width - 5;
//                        v = 0;
//                        a = 0;
//                        clearTimeout (timeout);
//                        clearTimeout (interval);
//                    }
//                    return cx;
//                };
//            })
//            .each ('end', function () {
//                if (v !== 0) animate ();
//            });
//    }
//
//
//    d3.select ('body')
//        .on ('keydown', function () {
//            var keyCode = d3.event.keyCode;
//            if (keyCode === 37 || keyCode === 39) {
//                a = (keyCode === 37 ? -.25 : .25);
//                if (interval) clearInterval (interval);
//                if (timeout) clearTimeout (timeout);
//                v += a;
//                interval = setInterval (function () {
//                    if (a < 0 && v > -maxV ||
//                        a > 0 && v < maxV) {
//
//                        v += a;
//                    }
//
//                    if (v === 0) {
//                        clearInterval (interval);
//                        clearTimeout (timeout);
//                    }
//                }, 50);
//                timeout = setTimeout (function () {
//                    a = -a;
//                }, duration / 2);
//                animate ();
//            } 
//        });
};

Game.prototype._AIPlayer = function () {
    var that = this;
    var prevPos = 0;
    var hitCount$ = $('#score-box .hits span');
    function shoot (x) {
        c._plotPredictionChart (x);
        //console.log ('x = ');
        //console.log (x);
        x = x.indexOf (Math.max.apply (null, x)) * 
            (that._width / outputNodes);
        //return;
        //x = x > 0.5 ? 200 : 0;
        var bullet = that._board
//            .append ('line')
//            .attr ({
//                x1: that._ai.attr ('cx'),
//                y1: that._ai.attr ('cy'),
//                x2: that._ai.attr ('cx'),
//                y2: that._ai.attr ('cy'),
//                stroke: 'red',
//                'stroke-width': '2px',
//            })
//            .transition ()
//            .duration (that._observationFrequency)
//            .ease ('linear')
//            .attr ('x2', x)
//            .attr ('y2', that._trackHeight)
//            .each ('end', function () {
//                if (Math.abs (
//                    parseFloat ((d3.select (this).attr ('x2'))) - 
//                    parseFloat (that._player.attr ('cx'))) <= 5) {
//
//                    console.log ('hit');
//                }
//            }) 
            .append ('circle')
            .attr ({
                cx: that._ai.attr ('cx'),
                cy: that._ai.attr ('cy'),
                fill: 'red',
                r: 5,
            })
            .transition ()
            .duration (that._observationFrequency)
            .ease ('linear')
            .attr ('cx', x)
            .attr ('cy', that._trackHeight)
            .each ('end', function () {
                if (Math.abs (
                    parseFloat ((d3.select (this).attr ('cx'))) - 
                    parseFloat (that._player.attr ('cx'))) <= 8) {

                    hitCount$.text (
                        parseInt (hitCount$.text (), 10) + 1);
                    that._hits.push ({
                        x: +new Date () - that._start
                    });
                    console.log ('hit');
                    c._plotHitsChart ();
                }
            }) 
            .remove ();
    }
    var prevPos = 0;
    var i = 0;
    setInterval (function () {
        var currPos = parseFloat (that._player.attr ('cx'));
        if (i++ % that._shootEveryXObservations === 0)
            shoot (c.h ([prevPos, currPos].map (that._scaleFeature)));
        prevPos = currPos;
    }, that._observationFrequency);
};

Game.prototype._scaleFeature = function (x) {
    return x / 400;
};

Game.prototype._buildTrainingSet = function () {
    var that = this;
    var i = 0;
    var previousLocations = Array (featureSetSize + 1).join (
        this._player.attr ('cx') + ',').
        split (',').map (function (a) { 
            return that._scaleFeature (parseInt (a)); 
    });
    previousLocations.pop ();
    setInterval (function () {
        var currLocation = 
            parseFloat (that._player.attr ('cx'));
        var currPosition = (new Array (outputNodes + 1)).join ('0').
            split ('').
            map (function (elem) { return parseInt (elem, 10); });
        currPosition[Math.floor (
            (currLocation / that._width) * (outputNodes - 1))] = 1;
        trainingSet.push ([
            previousLocations.slice (0), 
            currPosition
        ]);
        if (trainingSet.length > that._traingSetSize) {
            trainingSet.shift ();
        }
        previousLocations.push (that._scaleFeature (currLocation))
        previousLocations.shift ();
    }, that._observationFrequency); 
};

Game.prototype._init = function () {
    this._setUpBoard ();
    this._playerInteraction ();
    this._AIPlayer ();
    this._buildTrainingSet ();
};

return Game;

}) ();


var Chart = (function () {

function Chart (width, height) {
    this._chart; 
    this._element$ = $('#chart');
    this._costChartElem$ = $('#cost-chart');
    this._hitsChartElem$ = $('#hits-chart');
    this._predictionChart$ = $('#prediction-chart');
    this._predictionChartWidth = 400;
    this._width = width;
    this._costChartHeight = 200;
    this._costChartWidth = 800;
    this._costChartStepSize = 1;
    this._height = height;
    this._alpha = 3.0;
    this._gdIters = 500;
    var that = this;
    this.nn = new NN ([
        featureSetSize, 
        Math.floor ((outputNodes + featureSetSize) / 2), 
        outputNodes
    ]);
    this.nn.enableGradientChecking = false;
    this.h = this.nn.getH (this.nn.initTheta ());
    this._init ();
};

Chart.prototype._gradientDescent = function () {
    var that = this;
    var i = this._gdIters;
    this.nn.trainingSet = trainingSet;
    var costs = [];
    var Theta = this.nn.gradientDescent (i, this._alpha, costs);
    //console.log ('costs = ');
    //console.log (costs);
    var maxCost = Math.max.apply (null, costs);
    costs = costs.map (function (elem) {
        return {y: elem};
    });

    // plot cost function outputs
    var lineFn = d3.svg.line ()
        .x (function (d, i) { 
            return i * (that._costChartWidth / that._gdIters);
        })
        .y (function (d, i) { 
            return that._costChartHeight - 
                d.y / maxCost * that._costChartHeight; 
        })
        .interpolate ('linear')
        ;
    this._costChart.select ('path').remove ();
    this._costChart.select ('.y-axis').remove ();
    this._costChart.append ('path')
        .attr ('d', lineFn (costs))
        .attr ('stroke', 'blue')
        .attr ('stroke-width', 1)
        .attr ('fill', 'none')
        ;

    // add y axis ticks and labels
    var yAxis = this._costChart.append ('g')
        .attr ('class', 'y-axis');
    yAxis.selectAll ('text')
        .data (d3.scale.linear ().domain ([0, maxCost]).ticks (5))
        .enter ()
            .append ('g')
            .append ('text')
        .attr ('y', function (d) {
            return that._costChartHeight - 
                d / maxCost * that._costChartHeight;
        })
        .text (function (d) {
            return d;
        })
        .attr ('x', that._costChartWidth - 50)
        .each (function () {
            d3.select (this.parentNode).append ('rect')
                .attr ('x', d3.select (this).attr ('x') - 10) 
                .attr ('y', d3.select (this).attr ('y')) 
                .attr ('width', '10px')
                .attr ('height', '1px')
                .attr ('fill', 'black')
        })
        ;
    return Theta;
};

Chart.prototype._plotPredictionChart = function (y) {
    var that = this;
    var color = d3.scale.linear ()
        .domain ([0, 1])
        .range (['white', 'black'])
        ;
    this._predictionChart
        .selectAll ('rect')
            .data (y)
        .enter ().append ('rect')
            .attr ('width', this._predictionChartWidth / outputNodes)
            .attr ('height', this._predictionChartWidth / outputNodes)
            .attr ('x', function (d, i) {
                return i * (that._predictionChartWidth / outputNodes);
            })
            .attr ('stroke', 'gray')
        ;
    this._predictionChart
        .selectAll ('rect')
            .attr ('fill', function (d, i) {
                return color (d);
            })
        ;
};

Chart.prototype._plotHitsChart = function () {
    var that = this;
    var now = +new Date ();
    // plot cost function outputs
    var lineFn = d3.svg.line ()
        .x (function (d, i) { 
            return d.x / (now - g._start - g.timeInactive) * 
                that._costChartWidth;
        })
        .y (function (d, i) { 
            return that._costChartHeight - 
                that._costChartHeight * (i / g._hits.length);
        })
        .interpolate ('linear')
        ;
    this._hitsChart.select ('path').remove ();
    //this._costChart.select ('.y-axis').remove ();
    this._hitsChart.append ('path')
        .attr ('d', lineFn ([{x:0}].concat (g._hits)))
        .attr ('stroke', 'blue')
        .attr ('stroke-width', 1)
        .attr ('fill', 'none')
        ;

};

Chart.prototype._setUpChart = function () {
    var that = this;
    this._predictionChart = d3.select (this._predictionChart$.selector)
        .append ('svg')
            .attr ('height', 20)
            .attr ('width', this._predictionChartWidth)
        ;
    this._costChart = d3.select (this._costChartElem$.selector)
        .append ('svg')
            .attr ('height', that._costChartHeight)
            .attr ('width', that._costChartWidth)
        .append ('g')
        ;
    this._costChart
        .append ('line')
            .attr ('x1', 0)
            .attr ('y1', that._costChartHeight)
            .attr ('x2', this._costChartWidth)
            .attr ('y2', that._costChartHeight)
            .attr ('stroke', 'black')
            .attr ('stroke-width', '1px')
        ;

    this._hitsChart = d3.select (this._hitsChartElem$.selector)
        .append ('svg')
            .attr ('height', that._costChartHeight)
            .attr ('width', that._costChartWidth)
        .append ('g')
        ;
    this._hitsChart
        .append ('line')
            .attr ('x1', 0)
            .attr ('y1', that._costChartHeight)
            .attr ('x2', this._costChartWidth)
            .attr ('y2', that._costChartHeight)
            .attr ('stroke', 'black')
            .attr ('stroke-width', '1px')
        ;
    
};

Chart.prototype._train = function () {
    var Theta = this._gradientDescent ();
    this.h = this.nn.getH (Theta);
};


Chart.prototype._init = function () {
    this._setUpChart ();
    var that = this;
    setTimeout (function () {
        that._train ();
    }, 2000);
    var interval = setTimeout (function retrainInterval () {
        g.pausedTime = +(new Date ());
        that._train ();
        interval = setTimeout (retrainInterval, 32000);
    }, 32000);
};

return Chart;

}) ();

g = new Game (400, 400);
c = new Chart (400, 400);




}) ();
