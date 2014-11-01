(function () {


trainingSet = [];


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
    setInterval (function () {
        //shoot (Math.random () * that._width);
        shoot (c.h (parseFloat (that._player.attr ('cx'))));
    }, 1500); 
};

Game.prototype._buildTrainingSet = function () {
    var that = this;
    var prevLocation = parseFloat (this._player.attr ('cx'));
    var i = 0;
    setInterval (function () {
        if (i % 3 === 0 || (i - 1) % 3 === 0) {
            currLocation = parseFloat (that._player.attr ('cx'));
            trainingSet.push ([[prevLocation], [currLocation]]);
            if (trainingSet.length > 15) {
                trainingSet.shift ();
            }
            prevLocation = currLocation
            c.plot ();
        }
    }, 800); 
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
    this._width = width;
    this._height = height;
    this._alpha = 0.00001;
    var that = this;
    this.h = this._getH (0, 0);

    this._cost = function (theta0, theta1) {
        var h = that._getH (theta0, theta1);
        var sum = 0;
        trainingSet.forEach (function (ex) {
            sum += Math.pow (h (ex[0]) - ex[1], 2);
        });
        return (1 / (2 * trainingSet.length)) * sum;
    };

    this._partialDerivatives = [
        function (theta0, theta1) {
            var h = that._getH (theta0, theta1);
            var sum = 0;
            trainingSet.forEach (function (ex) {
                sum += h (ex[0]) - ex[1];    
            });
            return (1 / (trainingSet.length)) * sum;
        },
        function (theta0, theta1) {
            var h = that._getH (theta0, theta1);
            var sum = 0;
            trainingSet.forEach (function (ex) {
                sum += (h (ex[0]) - ex[1]) * ex[0];
            });
            return (1 / (trainingSet.length)) * sum;
        },
    ];

    this._init ();
};

Chart.prototype._gradientDescent = function () {
    var i = 100;
    var theta0 = theta1 = 0;
    while (--i > 0) {
        var tmp0 = theta0 - 
            this._alpha * this._partialDerivatives[0] (theta0, theta1)
        var tmp1 = theta1 - 
            this._alpha * this._partialDerivatives[1] (theta0, theta1)
        theta0 = tmp0;
        theta1 = tmp1;
        var cost = this._cost (theta0, theta1);
        if (cost < 1) break;
    }
    return [theta0, theta1];
};

Chart.prototype._getH = function (theta0, theta1) {
    return function (x) {
        return theta0 + theta1 * x;
    };
};

Chart.prototype._setUpChart = function () {
    this._chart = d3.select ('#chart').append ('svg').attr ({
        width: this._width,
        height: this._height,
    });
};

Chart.prototype.plot = function () {
    var that = this;
    this._chart
        .selectAll ('circle')
            .data (trainingSet)
        .attr ('cx', function (d, i) {
            return d[0];
        })
        .attr ('cy', function (d, i) {
            return (that._height - d[1]);
        })
        .attr ('r', 5)
        .attr ('fill', 'black')
        .enter ()
            .append ('circle')
    ;

};

Chart.prototype._linearRegression = function () {
    var theta = this._gradientDescent ();
    var h = this._getH.apply (null, theta);
    this._chart
        .select ('line')
        .remove ();
    this._chart
        .append ('line')
        .attr ({
            x1: 0,
            y1: this._height - h (0),
            x2: this._width,
            y2: this._height - h (this._width),
            'stroke-width': 2,
            'stroke': 'blue',
        });
    this.h = h;
};


Chart.prototype._init = function () {
    this._setUpChart ();
    var that = this;
    setInterval (function () {
        that._linearRegression ();
    }, 2000);
};

return Chart;

}) ();

g = new Game (400, 400);
c = new Chart (400, 400);




}) ();
