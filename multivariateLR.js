(function () {


trainingSet = [];
featureSetSize = 2;


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

    var elapsedTime$ = $('#score-box .elapsed-time span');
    var that = this;
    setInterval (function () {
        var diff = +new Date () - that._start;
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
        if (i % 3 === 0 || (i - 1) % 3 === 0) {
            var currLocation = 
                parseFloat (that._player.attr ('cx'));
            trainingSet.push (
                [previousLocations.slice (0), [currLocation]]);
            if (trainingSet.length > that._traingSetSize) {
                trainingSet.shift ();
            }
            previousLocations.push (that._scaleFeature (currLocation))
            previousLocations.shift ();
            c.plot ();
        }
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


function MyGraph3d (container, data, options) { 
    vis.Graph3d.apply (this, Array.prototype.slice.call (arguments));
    this.drawAxes = options.drawAxes === undefined ? 
        true : options.drawAxes;
}

MyGraph3d.prototype = Object.create (vis.Graph3d.prototype);

//// Overrided to remove interactivity
//// This method is 
//// Copyright (C) 2011-2014 Almende B.V, http://almende.com
//MyGraph3d.prototype.create = function () {
//    // remove all elements from the container element.
//    while (this.containerElement.hasChildNodes()) {
//      this.containerElement.removeChild(this.containerElement.firstChild);
//    }
//
//    this.frame = document.createElement('div');
//    this.frame.style.position = 'relative';
//    this.frame.style.overflow = 'hidden';
//
//    // create the graph canvas (HTML canvas element)
//    this.frame.canvas = document.createElement( 'canvas' );
//    this.frame.canvas.style.position = 'relative';
//    this.frame.appendChild(this.frame.canvas);
//    //if (!this.frame.canvas.getContext) {
//    {
//      var noCanvas = document.createElement( 'DIV' );
//      noCanvas.style.color = 'red';
//      noCanvas.style.fontWeight =  'bold' ;
//      noCanvas.style.padding =  '10px';
//      noCanvas.innerHTML =  'Error: your browser does not support HTML canvas';
//      this.frame.canvas.appendChild(noCanvas);
//    }
//
//    this.frame.filter = document.createElement( 'div' );
//    this.frame.filter.style.position = 'absolute';
//    this.frame.filter.style.bottom = '0px';
//    this.frame.filter.style.left = '0px';
//    this.frame.filter.style.width = '100%';
//    this.frame.appendChild(this.frame.filter);
//
//    // add event listeners to handle moving and zooming the contents
//    var me = this;
//    var onmousedown = function (event) {me._onMouseDown(event);};
//    var ontouchstart = function (event) {me._onTouchStart(event);};
//    var onmousewheel = function (event) {me._onWheel(event);};
//    var ontooltip = function (event) {me._onTooltip(event);};
//    // TODO: these events are never cleaned up... can give a 'memory leakage'
//
//    // add the new graph to the container element
//    this.containerElement.appendChild(this.frame);
//};


// enable disableable axes
MyGraph3d.prototype._redrawAxis = function () {
    if (this.drawAxes) vis.Graph3d.prototype._redrawAxis.call (this);
}


function Chart (width, height) {
    this._chart; 
    this._hChart; 
    this._element$ = $('#chart');
    this._hChartElem$ = $('#h-chart');
    this._costChartElem$ = $('#cost-chart');
    this._hitsChartElem$ = $('#hits-chart');
    this._width = width;
    this._costChartHeight = 200;
    this._costChartWidth = 800;
    this._costChartStepSize = 1;
    this._height = height;
    this._alpha = 0.1;
    this._gdIters = 200;
    var that = this;
    this.h = this._getH ([0, 0, 0]);

    this._cost = function (Theta) {
        var h = that._getH (Theta);
        var sum = 0;
        trainingSet.forEach (function (ex) {
            sum += Math.pow (h (ex[0]) - ex[1], 2);
        });
        return (1 / (2 * trainingSet.length)) * sum;
    };

    this._partialDerivatives = 
        [0, 1, 2].map (function (i) {
            return function (Theta) {
                var h = that._getH (Theta);
                var sum = 0;
                trainingSet.forEach (function (ex) {
                    sum += mathjs.multiply (
                        (h (ex[0]) - ex[1][0]), 
                        i === 0 ? 1 : ex[0][i - 1]);
                });
                return (1 / (trainingSet.length)) * sum;
            };
        });

    this._init ();
};

Chart.prototype._gradientDescent = function () {
    var that = this;
    var i = this._gdIters;
    var Theta = [0, 0, 0];
    var costs = [];
    var maxCost = -Infinity;
    while (--i > 0) {
        Theta = mathjs.subtract (
            Theta, 
            mathjs.multiply (
                this._alpha,
                Theta.map (function (a, i) {
                    return that._partialDerivatives[i] (Theta);
                })));
        //console.log ('!!Theta = ');
        //console.log (Theta);
        var cost = this._cost (Theta);
        costs.push ({
            y: cost,
        });
        maxCost = cost > maxCost ? cost : maxCost;
        //if (cost < 1) break;
    }

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

Chart.prototype._plotHitsChart = function () {
    var that = this;
    var now = +new Date ();
    // plot cost function outputs
    var lineFn = d3.svg.line ()
        .x (function (d, i) { 
            return d.x / (now - g._start) * that._costChartWidth;
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

Chart.prototype._getH = function (Theta) {
    var Theta = [[Theta[0], Theta[1], Theta[2]]];
    return function (X) {
        var X = [1, X[0], X[1]];
        //var X = [1, -Math.pow (X[0], 2), -Math.pow (X[1], 2)];
        return mathjs.number (mathjs.multiply (Theta, X));
    };
};

Chart.prototype._setUpChart = function () {
    var that = this;
    var dummyDataSet = new vis.DataSet ();
    dummyDataSet.add ({
        x: 0,
        y: 0,
        z: 0
    });

    var config = {
        xMax: 1,
        yMax: 1,
        zMax: 400,
        xMin: -1,
        yMin: -1,
        zMin: -400,
        width: '400px',
        height: '400px',
        xLabel: '',
        yLabel: '',
        zLabel: '',
        xValueLabel: function () {return '';},
        yValueLabel: function () {return '';},
        zValueLabel: function () {return '';},
    };
    this._chart = new MyGraph3d (
        this._element$.get (0),
        dummyDataSet,
        $.extend (config, {
             backgroundColor: 'transparent',
             style: 'dot',
        }));
    this._hChart = new MyGraph3d (
        this._hChartElem$.get (0),
        dummyDataSet,
        $.extend (config, {
             style: 'surface',
        }));
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

Chart.prototype.plot = function () {
    var that = this;
    var data = new vis.DataSet ();
    for (var i in trainingSet) {
        var example = trainingSet[i];
        data.add ({
            x: example[0][0],
            y: example[0][1],
            z: example[1][0],
        });
    }
    this._chart.setData (data);
    this._chart.redraw ();
};

Chart.prototype._linearRegression = function () {
    var Theta = this._gradientDescent ();
    var h = this._getH (Theta);

    var step = 40;
    var data = new vis.DataSet ();
    for (var x = 0; x < 400; x += step) {
        for (var y = 0; y < 400; y += step) {
            data.add ({ 
                x: g._scaleFeature (x), 
                y: g._scaleFeature (y), 
                z: h ([x, y].map (function (a) {
                    return g._scaleFeature (a);
                })), 
            });
        }
    }
    this._hChart.setData (data);
    this._hChart.redraw ();
    this.h = h;
};


Chart.prototype._init = function () {
    this._setUpChart ();
    var that = this;
    var interval = setInterval (function () {
        that._linearRegression ();
    }, 2000);
};

return Chart;

}) ();

g = new Game (400, 400);
c = new Chart (400, 400);




}) ();
