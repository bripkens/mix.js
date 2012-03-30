describe('core', function () {
  it('should resolve dependencies', function() {
    var baseInstantiationCount = 0;

    var Base = function() {
      baseInstantiationCount++;
    };

    var RectangleConstructor = function() {};
    var Rectangle = mix(Base, RectangleConstructor);

    var LabelConstuctor = function() {};
    var Label = mix(Base, LabelConstuctor);

    var RectLabel = mix(Label, Rectangle);
    new RectLabel();

    expect(baseInstantiationCount).toBe(1);
  });

  it('should allow access to overridden methods', function() {
    var rectangleRenderCallCount = 0;
    var Rectangle = function() {};
    Rectangle.prototype.render = function() {
      rectangleRenderCallCount++;
    };

    var labelRenderCallCount = 0;
    var LabelConstuctor = function() {};
    LabelConstuctor.prototype.render = function() {
      expect(rectangleRenderCallCount).toBe(0);
      this._instances[Rectangle._id].render();
      expect(rectangleRenderCallCount).toBe(1);
      labelRenderCallCount++;
    };
    var RectLabel = mix(Rectangle, LabelConstuctor);

    new RectLabel().render();

    expect(labelRenderCallCount).toBe(1);
    
  });

  it('should allow private variables', function() {
    var rectValue = 42;
    var Rectangle = function(args) {
      this._val = args.rectValue;
    };
    Rectangle.prototype.getRectangleValue = function() {
      return this._val;
    };

    var labelValue = 43;
    var LabelConstuctor = function(args) {
      this._val = args.labelValue;
    };
    LabelConstuctor.prototype.getLabelValue = function() {
      return this._val;
    };


    var RectLabel = mix(Rectangle, LabelConstuctor);

    var instance = new RectLabel({
      rectValue: rectValue,
      labelValue: labelValue
    });

    expect(instance.getRectangleValue()).toBe(rectValue);
    expect(instance.getLabelValue()).toBe(labelValue);
  });
});