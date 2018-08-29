/*
    patternLock.js v 1.0.2
    Author: Sudhanshu Yadav
    Copyright (c) 2015,2016 Sudhanshu Yadav - ignitersworld.com , released under the MIT license.
    Demo on: ignitersworld.com/lab/patternLock.html
*/

;(function(factory) {
    /** support UMD ***/
    var global = Function('return this')() || (42, eval)('this');
    if (typeof define === "function" && define.amd) {
        define(["jquery"], function($) {
            return (global.PatternLock = factory($, global));
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = global.document ?
            factory(require("jquery"), global) :
            function(w) {
                if (!w.document) {
                    throw new Error("patternLock requires a window with a document");
                }
                return factory(require("jquery")(w), w);
            };
    } else {
        global.PatternLock = factory(global.jQuery, global);
    }
}(function($, window, undefined) {
    "use strict";

    var document = window.document;

    var nullFunc = function() {},
        objectHolder = {};

    //internal functions
    function readyDom(iObj) {
        var holder = iObj.holder,
            option = iObj.option,
            matrix = option.matrix,
            margin = option.margin,
            radius = option.radius,
            html = ['<ul class="patt-wrap" style="padding:' + margin + 'px">'];
        for (var i = 0, ln = matrix[0] * matrix[1]; i < ln; i++) {
            html.push('<li class="patt-circ" style="margin:' + margin + 'px; width : ' + (radius * 2) + 'px; height : ' + (radius * 2) + 'px; -webkit-border-radius: ' + radius + 'px; -moz-border-radius: ' + radius + 'px; border-radius: ' + radius + 'px; "><div class="patt-dots"></div></li>');
        }
        html.push('</ul>');
        holder.html(html.join('')).css({
            'width': (matrix[1] * (radius * 2 + margin * 2) + margin * 2) + 'px',
            'height': (matrix[0] * (radius * 2 + margin * 2) + margin * 2) + 'px'
        });

        //select pattern circle
        iObj.pattCircle = iObj.holder.find('.patt-circ');

    }

    //return height and angle for lines
    function getLengthAngle(x1, x2, y1, y2) {
        var xDiff = x2 - x1,
            yDiff = y2 - y1;

        return {
            length: Math.ceil(Math.sqrt(xDiff * xDiff + yDiff * yDiff)),
            angle: Math.round((Math.atan2(yDiff, xDiff) * 180) / Math.PI)
        };
    }


    var startHandler = function(e, obj) {
            e.preventDefault();
            var iObj = objectHolder[obj.token];

            if (iObj.disabled) return;

            //check if pattern is visible or not
            if (!iObj.option.patternVisible) {
                iObj.holder.addClass('patt-hidden');
            }

            var touchMove = e.type == "touchstart" ? "touchmove" : "mousemove",
                touchEnd = e.type == "touchstart" ? "touchend" : "mouseup";

            //assign events
            $(this).on(touchMove + '.pattern-move', function(e) {
                moveHandler.call(this, e, obj);
            });
            $(document).one(touchEnd, function() {
                endHandler.call(this, e, obj);
				if(obj.onTouchEnd)obj.onTouchEnd();
            });
            //set pattern offset
            var wrap = iObj.holder.find('.patt-wrap'),
                offset = wrap[0].getBoundingClientRect();
            iObj.wrapTop = offset.top;
            iObj.wrapLeft = offset.left;

            //reset pattern
            obj.reset();
        },
        moveHandler = function(e, obj) {
            e.preventDefault();
            var x = e.clientX || e.originalEvent.touches[0].clientX,
                y = e.clientY || e.originalEvent.touches[0].clientY,
                iObj = objectHolder[obj.token],
                option = iObj.option,
                li = iObj.pattCircle,
                patternAry = iObj.patternAry,
                posObj = iObj.getIdxFromPoint(x, y),
                idx = posObj.idx,
                pattId = iObj.mapperFunc(idx) || idx;


            if (patternAry.length > 0) {
                var laMove = getLengthAngle(iObj.lineX1, posObj.x, iObj.lineY1, posObj.y);
                iObj.line.css({
                    'width': (laMove.length + 10) + 'px',
                    'transform': 'rotate(' + laMove.angle + 'deg)'
                });
            }


            if (idx && ((option.allowRepeat && patternAry[patternAry.length - 1] !== pattId) || patternAry.indexOf(pattId) === -1)) {
                var elm = $(li[idx - 1]);

                //mark if any points are in middle of previous point and current point, if it does check them
                if (iObj.lastPosObj) {
                    var lastPosObj = iObj.lastPosObj,
                        ip = lastPosObj.i,
                        jp = lastPosObj.j,
                        xDelta = posObj.i - lastPosObj.i > 0 ? 1 : -1,
                        yDelta = posObj.j - lastPosObj.j > 0 ? 1 : -1,
                        iDiff = Math.abs(posObj.i - ip),
                        jDiff = Math.abs(posObj.j - jp);

                    while (((iDiff === 0 && jDiff > 1) || (jDiff === 0 && iDiff > 1) || (jDiff == iDiff && jDiff > 1))) {
                        ip = iDiff ? ip + xDelta : ip;
                        jp = jDiff ? jp + yDelta : jp;
                        iDiff = Math.abs(posObj.i - ip);
                        jDiff = Math.abs(posObj.j - jp);

                        var nextIdx = (jp - 1) * option.matrix[1] + ip,
                            nextPattId = iObj.mapperFunc(nextIdx) || nextIdx;

                        if (option.allowRepeat || patternAry.indexOf(nextPattId) == -1) {

                            //add direction to previous point and line
                            iObj.addDirectionClass({i: ip, j: jp});

                            //mark a point added
                            iObj.markPoint($(li[nextPattId - 1]), nextPattId);

                            //add line between the points
                            iObj.addLine({i: ip,j: jp});
                        }
                    }
                }

                //add direction to last point and line
                if (iObj.lastPosObj) iObj.addDirectionClass(posObj);

                //mark the initial point added
                iObj.markPoint(elm, pattId);

                //add initial line
                iObj.addLine(posObj);

                iObj.lastPosObj = posObj;
            }
        },
        endHandler = function(e, obj) {
            e.preventDefault();
            var iObj = objectHolder[obj.token],
                option = iObj.option,
                pattern = iObj.patternAry.join(option.delimiter);

            //remove hidden pattern class and remove event
            iObj.holder.off('.pattern-move').removeClass('patt-hidden');

            if (!pattern) return;

            option.onDraw(pattern);

            //to remove last line
            iObj.line.remove();



            if (iObj.rightPattern) {
                if (pattern == iObj.rightPattern) {
                    iObj.onSuccess();
                } else {
                    iObj.onError();
                    obj.error();
                }
            }
        };

    function InternalMethods() {}

    InternalMethods.prototype = {
        constructor: InternalMethods,
        getIdxFromPoint: function(x, y) {
            var option = this.option,
                matrix = option.matrix,
                xi = x - this.wrapLeft,
                yi = y - this.wrapTop,
                idx = null,
                margin = option.margin,
                plotLn = option.radius * 2 + margin * 2,
                qsntX = Math.ceil(xi / plotLn),
                qsntY = Math.ceil(yi / plotLn),
                remX = xi % plotLn,
                remY = yi % plotLn;

            if (qsntX <= matrix[1] && qsntY <= matrix[0] && remX > margin * 2 && remY > margin * 2) {
                idx = (qsntY - 1) * matrix[1] + qsntX;
            }
            return {
                idx: idx,
                i: qsntX,
                j: qsntY,
                x: xi,
                y: yi
            };
        },
        markPoint: function(elm, pattId) {
            //add the current element on pattern
            elm.addClass('hovered');

            //push pattern on array
            this.patternAry.push(pattId);

            this.lastElm = elm;
        },
        //method to add lines between two element
        addLine: function(posObj) {
            var _this = this,
                patternAry = _this.patternAry,
                option = _this.option;

            //add start point for line
            var lineOnMove = option.lineOnMove,
                margin = option.margin,
                radius = option.radius,
                newX = (posObj.i - 1) * (2 * margin + 2 * radius) + 2 * margin + radius,
                newY = (posObj.j - 1) * (2 * margin + 2 * radius) + 2 * margin + radius;

            if (patternAry.length > 1) {
                //to fix line
                var lA = getLengthAngle(_this.lineX1, newX, _this.lineY1, newY);
                _this.line.css({
                    'width': (lA.length + 10) + 'px',
                    'transform': 'rotate(' + lA.angle + 'deg)'
                });

                if (!lineOnMove) _this.line.show();
            }


            //to create new line
            var line = $('<div class="patt-lines" style="top:' + (newY - 5) + 'px; left:' + (newX - 5) + 'px"></div>');
            _this.line = line;
            _this.lineX1 = newX;
            _this.lineY1 = newY;
            //add on dom

            _this.holder.append(line);
            if (!lineOnMove) _this.line.hide();
        },
        // add direction on point and line
        addDirectionClass: function(curPos) {
            var point = this.lastElm,
                line = this.line,
                lastPos = this.lastPosObj;

            var direction = [];
            curPos.j - lastPos.j > 0 ? direction.push('s') : curPos.j - lastPos.j < 0 ? direction.push('n') : 0;
            curPos.i - lastPos.i > 0 ? direction.push('e') : curPos.i - lastPos.i < 0 ? direction.push('w') : 0;
            direction = direction.join('-');

            if (direction) {
                point.add(line).addClass(direction + " dir");
            }
        }

    };

    function PatternLock(selector, option) {
        var self = this,
            token = self.token = Math.random(),
            iObj = objectHolder[token] = new InternalMethods(),
            holder = iObj.holder = $(selector);

        //if holder is not present return
        if (holder.length === 0) return;

        iObj.object = self;

        //optimizing options
        option = option || {};
        var defaultsFixes = {
            onDraw: nullFunc
        };
        var matrix = option.matrix;
        if (matrix && matrix[0] * matrix[1] > 9) defaultsFixes.delimiter = ",";

        option = iObj.option = $.extend({}, PatternLock.defaults, defaultsFixes, option);
        readyDom(iObj);

        //add class on holder
        holder.addClass('patt-holder');

        //change offset property of holder if it does not have any property
        if (holder.css('position') == "static") holder.css('position', 'relative');

        //assign event
        holder.on("touchstart mousedown", function(e) {
            startHandler.call(this, e, self);
        });

        //adding a mapper function
        var mapper = option.mapper;
        if (typeof mapper == "object") {
            iObj.mapperFunc = function(idx) {
                return mapper[idx];
            };
        } else if (typeof mapper == "function") {
            iObj.mapperFunc = mapper;
        } else {
            iObj.mapperFunc = nullFunc;
        }

        //to delete from option object
        iObj.option.mapper = null;
    }

    PatternLock.prototype = {
        constructor: PatternLock,
        //method to set options after initializtion
        option: function(key, val) {
            var iObj = objectHolder[this.token],
                option = iObj.option;
            //for set methods
            if (val === undefined) {
                return option[key];
            }
            //for setter
            else {
                option[key] = val;
                if (key == "margin" || key == "matrix" || key == "radius") {
                    readyDom(iObj);
                }
            }
        },
        //get drawn pattern as string
        getPattern: function() {
            var iObj = objectHolder[this.token];
            return (iObj.patternAry || []).join(iObj.option.delimiter);
        },
        //method to draw a pattern dynamically
        setPattern: function(pattern) {
            var iObj = objectHolder[this.token],
                option = iObj.option,
                matrix = option.matrix,
                margin = option.margin,
                radius = option.radius;

            //allow to set password manually only when enable set pattern option is true
            if (!option.enableSetPattern) return;

            //check if pattern is string break it with the delimiter
            if (typeof pattern === "string") {
                pattern = pattern.split(option.delimiter);
            }

            this.reset();
            iObj.wrapLeft = 0;
            iObj.wrapTop = 0;

            for (var i = 0; i < pattern.length; i++) {
                var idx = pattern[i] - 1,
                    x = idx % matrix[1],
                    y = Math.floor(idx / matrix[1]),
                    clientX = x * (2 * margin + 2 * radius) + 2 * margin + radius,
                    clientY = y * (2 * margin + 2 * radius) + 2 * margin + radius;

                moveHandler.call(null, {
                    clientX: clientX,
                    clientY: clientY,
                    preventDefault: nullFunc
                }, this);

            }
        },
        //to temprory enable disable plugin
        enable: function() {
            var iObj = objectHolder[this.token];
            iObj.disabled = false;
        },
        disable: function() {
            var iObj = objectHolder[this.token];
            iObj.disabled = true;
        },
        //reset pattern lock
        reset: function() {
            var iObj = objectHolder[this.token];
            //to remove lines
            iObj.pattCircle.removeClass('hovered dir s n w e s-w s-e n-w n-e');
            iObj.holder.find('.patt-lines').remove();

            //add/reset a array which capture pattern
            iObj.patternAry = [];

            //remove last Obj
            iObj.lastPosObj = null;

            //remove error class if added
            iObj.holder.removeClass('patt-error');

        },
        //to display error if pattern is not drawn correct
        error: function() {
            objectHolder[this.token].holder.addClass('patt-error');
        },
        //to check the drawn pattern against given pattern
        checkForPattern: function(pattern, success, error) {
            var iObj = objectHolder[this.token];
            iObj.rightPattern = pattern;
            iObj.onSuccess = success || nullFunc;
            iObj.onError = error || nullFunc;
        }
    };

    PatternLock.defaults = {
        matrix: [3, 3],
        margin: 20,
        radius: 25,
        patternVisible: true,
        lineOnMove: true,
        delimiter: "", // a delimiter between the pattern
        enableSetPattern: false,
        allowRepeat: false
    };

    return PatternLock;

}));
