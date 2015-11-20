# module
一个选择器组件

实现这样一个组件，就是一个输入框里面字数的计数。这个应该是个很简单的需求。

最简陋的写法
嗯 所谓的入门级写法呢，就是完完全全的全局函数全局变量的写法。（就我所知，现在好多外包还是这种写法）
代码如下：

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>test</title>
  <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
  <script>
    $(function() {

      var input = $('#J_input');

      //用来获取字数
      function getNum(){
        return input.val().length;
      }

      //渲染元素
      function render(){
        var num = getNum();

        //没有字数的容器就新建一个
        if ($('#J_input_count').length == 0) {
          input.after('<span id="J_input_count"></span>');
        };

        $('#J_input_count').html(num+'个字');
      }

      //监听事件
      input.on('keyup',function(){
        render();
      });

      //初始化，第一次渲染
      render();


    })
  </script>
</head>
<body>
<input type="text" id="J_input"/>
</body>
</html>

这段代码跑也是可以跑的，但是呢，各种变量混乱，没有很好的隔离作用域,当页面变的复杂的时候,会很难去维护。目前这种代码基本是用不了的。当然少数的活动页面可以简单用用。

作用域隔离
让我们对上面的代码作些改动，使用单个变量模拟命名空间。
var textCount = {
  input:null,
  init:function(config){
    this.input = $(config.id);
    this.bind();
    //这边范围对应的对象，可以实现链式调用
    return this;
  },
  bind:function(){
    var self = this;
    this.input.on('keyup',function(){
      self.render();
    });
  },
  getNum:function(){
    return this.input.val().length;
  },
  //渲染元素
  render:function(){
    var num = this.getNum();

    if ($('#J_input_count').length == 0) {
      this.input.after('<span id="J_input_count"></span>');
    };

    $('#J_input_count').html(num+'个字');
  }
}

$(function() {
  //在domready后调用
  textCount.init({id:'#J_input'}).render();
})

这样一改造，立马变的清晰了很多，所有的功能都在一个变量下面。代码更清晰，并且有统一的入口调用方法。
但是还是有些瑕疵，这种写法没有私有的概念，比如上面的getNum,bind应该都是私有的方法。但是其他代码可以很随意的改动这些。当代码量特别特别多的时候，很容易出现变量重复，或被修改的问题。
于是又出现了一种函数闭包的写法：

var TextCount = (function(){
  //私有方法，外面将访问不到
  var _bind = function(that){
    that.input.on('keyup',function(){
      that.render();
    });
  }

  var _getNum = function(that){
    return that.input.val().length;
  }

  var TextCountFun = function(config){

  }

  TextCountFun.prototype.init = function(config) {
    this.input = $(config.id);
    _bind(this);

    return this;
  };

  TextCountFun.prototype.render = function() {
    var num = _getNum(this);

    if ($('#J_input_count').length == 0) {
      this.input.after('<span id="J_input_count"></span>');
    };

    $('#J_input_count').html(num+'个字');
  };
  //返回构造函数
  return TextCountFun;

})();

$(function() {
  new TextCount().init({id:'#J_input'}).render();
})

这种写法，把所有的东西都包在了一个自动执行的闭包里面，所以不会受到外面的影响，并且只对外公开了TextCountFun构造函数，生成的对象只能访问到init,render方法。这种写法已经满足绝大多数的需求了。事实上大部分的jQuery插件都是这种写法。

面向对象


上面的写法已经可以满足绝大多数需求了。
但是呢，当一个页面特别复杂，当我们需要的组件越来越多，当我们需要做一套组件。仅仅用这个就不行了。首先的问题就是，这种写法太灵活了，写单个组件还可以。如果我们需要做一套风格相近的组件，而且是多个人同时在写。那真的是噩梦。
在编程的圈子里，面向对象一直是被认为最佳的编写代码方式。比如java，就是因为把面向对象发挥到了极致，所以多个人写出来的代码都很接近，维护也很方便。但是很不幸的是，javascript不支持class类的定义。但是我们可以模拟。
下面我们先实现个简单的javascript类：
var Class = (function() {
  var _mix = function(r, s) {
    for (var p in s) {
      if (s.hasOwnProperty(p)) {
        r[p] = s[p]
      }
    }
  }

  var _extend = function() {

    //开关 用来使生成原型时,不调用真正的构成流程init
    this.initPrototype = true
    var prototype = new this()
    this.initPrototype = false

    var items = Array.prototype.slice.call(arguments) || []
    var item

    //支持混入多个属性，并且支持{}也支持 Function
    while (item = items.shift()) {
      _mix(prototype, item.prototype || item)
    }


    // 这边是返回的类，其实就是我们返回的子类
    function SubClass() {
      if (!SubClass.initPrototype && this.init)
        this.init.apply(this, arguments)//调用init真正的构造函数
    }

    // 赋值原型链，完成继承
    SubClass.prototype = prototype

    // 改变constructor引用
    SubClass.prototype.constructor = SubClass

    // 为子类也添加extend方法
    SubClass.extend = _extend

    return SubClass
  }
  //超级父类
  var Class = function() {}
  //为超级父类添加extend方法
  Class.extend = _extend

  return Class
})()


//文章来自：http://www.html-js.com/article/JS-from-zero-single-row-JavaScript-component-development-method
