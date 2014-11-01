(function () {


trainingSet = [];


var Game = (function () {

function Game (width, height) {
    this._width = width;
    this._height = height;
    this._trackHeight = 4 * (this._height / 5);
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
        shoot (Math.random () * that._width);
    }, 1000); 
};

Game.prototype._buildTrainingSet = function () {
    var that = this;
    var prevLocation = this._player.attr ('cx');
    setInterval (function () {
        currLocation = that._player.attr ('cx');
        trainingSet.push ([[prevLocation], [currLocation]]);
        if (trainingSet.length > 1500) {
            trainingSet.shift ();
        }
        prevLocation = currLocation
        c.plot (trainingSet);
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
    this._init ();
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
        .enter ()
            .append ('circle')
            .attr ('cx', function (d, i) {
                return d[0];
            })
            .attr ('cy', function (d, i) {
                return 5 + (that._height - 7 - 
                    d[1] * ((that._height - 7) / that._width));
            })
            .attr ('r', 2)
            .attr ('fill', 'black')
    ;

};


Chart.prototype._init = function () {
    this._setUpChart ();
};

return Chart;

}) ();

g = new Game (600, 400);
c = new Chart (600, 400);




}) ();
