/*
    patternLock.js v 0.3.0
    Author: Sudhanshu Yadav
    Copyright (c) 2013 Sudhanshu Yadav - ignitersworld.com , released under the MIT license.
    Demo on: ignitersworld.com/lab/patternLock.html
*/
;(function ($, window, document, undefined) {
    "use strict";

    var nullFunc = function () {},
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



    var startHandler = function (e, obj) {
            e.preventDefault();
            var iObj = objectHolder[obj.token];

            //check if pattern is visible or not
            if (!iObj.option.patternVisible) {
                iObj.holder.addClass('patt-hidden');
            }

            var touchMove = e.type == "touchstart" ? "touchmove" : "mousemove",
                touchEnd = e.type == "touchstart" ? "touchend" : "mouseup";

            //assign events
            $(this).on(touchMove + '.pattern-move', function (e) {
                moveHandler.call(this, e, obj);
            });
            $(document).one(touchEnd, function () {
                endHandler.call(this, e, obj);
            });
            //set pattern offset
            var wrap = iObj.holder.find('.patt-wrap'),
                offset = wrap.offset();
            iObj.wrapTop = offset.top;
            iObj.wrapLeft = offset.left;

            //reset pattern
            obj.reset();

        },
        moveHandler = function (e, obj) {
            e.preventDefault();
            var x = e.pageX || e.originalEvent.touches[0].pageX,
                y = e.pageY || e.originalEvent.touches[0].pageY,
                iObj = objectHolder[obj.token],
                li = iObj.pattCircle,
                patternAry = iObj.patternAry,
                lineOnMove = iObj.option.lineOnMove,
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

            if (idx) {
                if (patternAry.indexOf(pattId) == -1) {
                    var elm = $(li[idx - 1]);
                    elm.addClass('hovered');
                    //push pattern on array
                    patternAry.push(pattId);

                    //add start point for line
                    var margin = iObj.option.margin,
                        radius = iObj.option.radius,
                        newX = (posObj.i - 1) * (2 * margin + 2 * radius) + 2 * margin + radius,
                        newY = (posObj.j - 1) * (2 * margin + 2 * radius) + 2 * margin + radius;

                    if (patternAry.length != 1) {
                        //to fix line
                        var lA = getLengthAngle(iObj.lineX1, newX, iObj.lineY1, newY);
                        iObj.line.css({
                            'width': (lA.length + 10) + 'px',
                            'transform': 'rotate(' + lA.angle + 'deg)'
                        });

                        if (!lineOnMove) iObj.line.show();
                    }

                    //to create new line
                    var line = $('<div class="patt-lines" style="top:' + (newY - 5) + 'px; left:' + (newX - 5) + 'px"></div>');
                    iObj.line = line;
                    iObj.lineX1 = newX;
                    iObj.lineY1 = newY;
                    //add on dom
                    iObj.holder.append(line);
                    if (!lineOnMove) iObj.line.hide();
                }
            }

        },
        endHandler = function (e, obj) {
            e.preventDefault();
            var iObj = objectHolder[obj.token],
                pattern = iObj.patternAry.join('');

            //remove hidden pattern class and remove event
            iObj.holder.off('.pattern-move').removeClass('patt-hidden');

            if (!pattern) return;

            iObj.option.onDraw(pattern);

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
        getIdxFromPoint: function (x, y) {
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
        }
    };

    function PatternLock(selector, option) {
        var self = this,
            token = self.token = Math.random(),
            iObj = objectHolder[token] = new InternalMethods(),
            holder = iObj.holder = $(selector);

        //if holder is not present return
        if (holder.length == 0) return;

        iObj.object = self;
        option = iObj.option = $.extend({}, PatternLock.defaults, option);
        readyDom(iObj);


        //add class on holder
        holder.addClass('patt-holder');

        //change offset property of holder if it does not have any property
        if (holder.css('position') == "static") holder.css('position', 'relative');

        //assign event
        holder.on( "touchstart mousedown", function (e) {
            startHandler.call(this, e, self);
        });

        //handeling callback
        iObj.option.onDraw = option.onDraw || nullFunc;

        //adding a mapper function  
        var mapper = option.mapper;
        if (typeof mapper == "object") {
            iObj.mapperFunc = function (idx) {
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
        option: function (key, val) {
            var iObj = objectHolder[this.token],
                option = iObj.option;
            //for set methods
            if (!val) {
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
        getPattern: function () {
            return objectHolder[this.token].patternAry.join('');
        },
        reset: function () {
            var iObj = objectHolder[this.token];
            //to remove lines
            iObj.pattCircle.removeClass('hovered');
            iObj.holder.find('.patt-lines').remove();

            //add/reset a array which capture pattern
            iObj.patternAry = [];

            //remove error class if added
            iObj.holder.removeClass('patt-error');

        },
        error: function () {
            objectHolder[this.token].holder.addClass('patt-error');
        },
        checkForPattern: function (pattern, success, error) {
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
        lineOnMove: true
    };


    window.PatternLock = PatternLock;
}(jQuery, window, document));