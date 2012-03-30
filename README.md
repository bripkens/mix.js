# mix.js

mix.js is a tiny library to enable simple mixins and mixin dependency resolution
in JavaScript. It focuses on unobtrusive and strong usage of mixins. It
originated in the [biographer project](http://code.google.com/p/biographer/)
which requires many mixins with common dependencies, i.e., mixins which can be
mixed and whose commonalities are taken into account at mixin generation time
(not object instantiation time).

# Terminology

**Class**: JavaScript "class" as seen on the
[Mozilla Developer Network](https://developer.mozilla.org/en/JavaScript/Reference/Operators/new).

**Mixin**: A mix of one or more classes.


# Project goals

 - Support for mixins in mixins, i.e., don't worry about mixin dependencies.
 - Private properties to avoid name clashes (without closures).
 - Possibility to call either functions as exposed through the object's public
   API, class methods and methods exposed by other classes that are part of the
   mixin.
 - Fast object instantiation.

# Example

``` javascript
/*
 * We define a standard JavaScript "class" *Label*. It works just like you are
 * used to and the constructor can accept parameters through the *args*
 * parameter. Don't worry, mix.js makes sure that you are always getting
 * something as a parameter (at worst, you get an Object without
 * properties).
 */
var Label = function(args) {
  /*
   * These variables will be private and can't be overridden by other mixins
   * or classes (at least, not by accident). No need to worry about name
   * clashes with other mixins. The underscore is optional and has no
   * effect on the visibility.
   */
  this._text = args.text || '';
  this._canvas = args.canvas;
};

/*
 * All methods and properties added to the prototype will be available
 * through the instance's public API later on.
 */
Label.prototype.render = function() {
  this._canvas.appendChild(document.createTextNode(this._text));
};

var Rectangle = function(args) {
  this._canvas = args.canvas;
};
Rectangle.prototype.render = function() {
  var element = document.createElement('div');
  element.style.border = '1px solid black';
  element.style.width = '100px';
  element.style.height = '100px';

  this._canvas.appendChild(element);
}; 

var RectangleWithLabel = function() {};

/*
 * By default, methods will be "overridden". Since the Rectangle and Label
 * classes are independent from each other, we need to glue them together
 * in some way.
 * This example shows how you can access other classes' methods. Note the
 * *_id* property which will be auto-generated for you. This integer is
 * used to identify classes and is used for performance reasons.
 */
RectangleWithLabel.prototype.render = function() {
  this._instances[Label._id].render();
  this._instances[Rectangle._id].render();
};

/*
 * This simple method call is enough to generate the mixin. You can even
 * mix a mixin with a class, class with a mixin and mixins with mixins.
 * Mix.js will take care of dependency resolution so that shared
 * classes are only instantiated once.
 * Check out the tests for more examples:
 * https://github.com/bripkens/mix.js/blob/master/test/spec/core.js
 */
RectangleWithLabel = mix(Label, Rectangle, RectangleWithLabel);

var args = {
  canvas: document.body,
  text: '42 is the answer to your questions.'
};

/*
 * Create instance the way that you are used to!
 */
var instance = new RectangleWithLabel(args);
instance.render();

/*
 * Result (in document body - fu GitHub, y u make this italic?):
 * 42 is the answer to your questions.
 * ┏━━━━━━━━━━━━━━━┓
 * ┃               ┃
 * ┃               ┃
 * ┃               ┃
 * ┃               ┃
 * ┗━━━━━━━━━━━━━━━┛
 */

```


# License (MIT)
Copyright (c) 2012 Ben Ripkens

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.