# mix.js

mix.js is a tiny library to enable simple mixins and mixin dependency resolution
in JavaScript.

## Example

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
 * Result (in document body):
 * 42 is the answer to your questions.
 * ┏━━━━━━━━━━━━━━━┓
 * ┃               ┃
 * ┃               ┃
 * ┃               ┃
 * ┃               ┃
 * ┗━━━━━━━━━━━━━━━┛
 */

```