(function () {


trainingSet = [];
featureSetSize = 2;


var Game = (function () {

function Game (width, height) {
    this._width = width;
    this._height = height;
    this._trackHeight = 4.8 * (this._height / 5);
    this._init ();
    this._board;
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

    function animate () {
        var cx = parseFloat (that._player.attr ('cx'));
        that._player
            .transition ()
            .duration (duration)
            .attrTween ("cx", function() { 
                return function (t) {
                    cx += v;
                    if (cx < 5) {
                        cx = 5;
                        v = 0;
                        a = 0;
                        clearTimeout (timeout);
                        clearTimeout (interval);
                    } else if (cx > that._width - 5) {
                        cx = that._width - 5;
                        v = 0;
                        a = 0;
                        clearTimeout (timeout);
                        clearTimeout (interval);
                    }
                    return cx;
                };
            })
            .each ('end', function () {
                if (v !== 0) animate ();
            });
    }


    d3.select ('body')
        .on ('keydown', function () {
            var keyCode = d3.event.keyCode;
            if (keyCode === 37 || keyCode === 39) {
                a = (keyCode === 37 ? -.25 : .25);
                if (interval) clearInterval (interval);
                if (timeout) clearTimeout (timeout);
                v += a;
                interval = setInterval (function () {
                    if (a < 0 && v > -maxV ||
                        a > 0 && v < maxV) {

                        v += a;
                    }

                    if (v === 0) {
                        clearInterval (interval);
                        clearTimeout (timeout);
                    }
                }, 50);
                timeout = setTimeout (function () {
                    a = -a;
                }, duration / 2);
                animate ();
            } 
        });
};

Game.prototype._AIPlayer = function () {
    var that = this;
    var prevPos = 0;
    function shoot (x) {
        var bullet = that._board
            .append ('circle')
            .attr ({
                cx: that._ai.attr ('cx'),
                cy: that._ai.attr ('cy'),
                fill: 'red',
                r: 5,
            })
            .transition ()
            .duration (800)
            .ease ('linear')
            .attr ('cx', x)
            .attr ('cy', that._trackHeight)
            .each ('end', function () {
                if (Math.abs (
                    parseFloat ((d3.select (this).attr ('cx'))) - 
                    parseFloat (that._player.attr ('cx'))) <= 5) {

                    console.log ('hit');
                }
            }) 
            .remove ();
    }
    var prevPos = 0;
    setInterval (function () {
        var currPos = parseFloat (that._player.attr ('cx'));
        shoot (c.h ([prevPos, currPos]));
    }, 1600); 
    setInterval (function () {
        prevPos = parseFloat (that._player.attr ('cx'));
    }, 400);
};

Game.prototype._buildTrainingSet = function () {
    var that = this;
    var i = 0;
    var previousLocations = Array (featureSetSize + 1).join (
        this._player.attr ('cx') + ',').
        split (',').map (function (a) { return parseInt (a); });
    previousLocations.pop ();
    setInterval (function () {
        if (i % 3 === 0 || (i - 1) % 3 === 0) {
            var currLocation = parseFloat (that._player.attr ('cx'));
            trainingSet.push (
                [previousLocations.slice (0), [currLocation]]);
            if (trainingSet.length > 15) {
                trainingSet.shift ();
            }
            previousLocations.push (currLocation)
            previousLocations.shift ();
            c.plot ();
        }
    }, 400); 
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

// Overrided to remove interactivity
// This method is 
// Copyright (C) 2011-2014 Almende B.V, http://almende.com
MyGraph3d.prototype.create = function () {
    // remove all elements from the container element.
    while (this.containerElement.hasChildNodes()) {
      this.containerElement.removeChild(this.containerElement.firstChild);
    }

    this.frame = document.createElement('div');
    this.frame.style.position = 'relative';
    this.frame.style.overflow = 'hidden';

    // create the graph canvas (HTML canvas element)
    this.frame.canvas = document.createElement( 'canvas' );
    this.frame.canvas.style.position = 'relative';
    this.frame.appendChild(this.frame.canvas);
    //if (!this.frame.canvas.getContext) {
    {
      var noCanvas = document.createElement( 'DIV' );
      noCanvas.style.color = 'red';
      noCanvas.style.fontWeight =  'bold' ;
      noCanvas.style.padding =  '10px';
      noCanvas.innerHTML =  'Error: your browser does not support HTML canvas';
      this.frame.canvas.appendChild(noCanvas);
    }

    this.frame.filter = document.createElement( 'div' );
    this.frame.filter.style.position = 'absolute';
    this.frame.filter.style.bottom = '0px';
    this.frame.filter.style.left = '0px';
    this.frame.filter.style.width = '100%';
    this.frame.appendChild(this.frame.filter);

    // add event listeners to handle moving and zooming the contents
    var me = this;
    var onmousedown = function (event) {me._onMouseDown(event);};
    var ontouchstart = function (event) {me._onTouchStart(event);};
    var onmousewheel = function (event) {me._onWheel(event);};
    var ontooltip = function (event) {me._onTooltip(event);};
    // TODO: these events are never cleaned up... can give a 'memory leakage'

    // add the new graph to the container element
    this.containerElement.appendChild(this.frame);
};


// enable disableable axes
MyGraph3d.prototype._redrawAxis = function () {
    if (this.drawAxes) vis.Graph3d.prototype._redrawAxis.call (this);
}


function Chart (width, height) {
    this._chart; 
    this._costChart; 
    this._element$ = $('#chart');
    this._costChartElement$ = $('#cost-chart');
    this._width = width;
    this._height = height;
    this._alpha = 0.00001;
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
    var i = 100;
    var Theta = [0, 0, 0];
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
        if (cost < 1) break;
    }
    return Theta;
};

Chart.prototype._getH = function (Theta) {
    var Theta = [[Theta[0], Theta[1], Theta[2]]];
    return function (X) {
        var X = [1, X[0], X[1]];
        return mathjs.number (mathjs.multiply (Theta, X));
    };
};

Chart.prototype._setUpChart = function () {
    var dummyDataSet = new vis.DataSet ();
    dummyDataSet.add ({
        x: 0,
        y: 0,
        z: 0
    });

    var config = {
        xMax: 400,
        yMax: 400,
        zMax: 400,
        xMin: 0,
        yMin: 0,
        zMin: 0,
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
    this._costChart = new MyGraph3d (
        this._costChartElement$.get (0),
        dummyDataSet,
        $.extend (config, {
             style: 'surface',
        }));
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
    //console.log ('Theta = ');
    //console.log (Theta);
    var h = this._getH (Theta);

    var step = 40;
    var data = new vis.DataSet ();
    for (var x = 0; x < 400; x += step) {
        for (var y = 0; y < 400; y += step) {
            data.add ({ 
                x: x, 
                y: y, 
                z: h ([x, y]), 
            });
        }
    }
    this._costChart.setData (data);
    this._costChart.redraw ();
    this.h = h;
};


Chart.prototype._init = function () {
    this._setUpChart ();
    var that = this;
    //var interval = setTimeout (function () {
    var interval = setInterval (function () {
        that._linearRegression ();
    }, 2000);
};

return Chart;

}) ();

g = new Game (400, 400);
c = new Chart (400, 400);




}) ();
