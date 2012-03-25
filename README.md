# mix.js

mix.js is a tiny library to enable simple mixins and mixin dependency resolution
in JavaScript.

## Example

``` javascript

var Observable = mix(function() {
  return {
    bind: function() {
      // ...
    },

    unbind: function() {
      // ...
    },

    trigger: function() {
      // ...
    }
  };
});

var Rectangle = mix(Observable, function() {
  var width = 200,
      height = 100;

  return {
    setWidth: function(width) {
      this.width = width;
      this.trigger('change:width');
    }
  };
});

var rectangle = new Rectangle();
rectangle.bind(...);
rectangle.setWidth(4242);

```