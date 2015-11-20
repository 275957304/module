
(function($){
    var SchoolBox = (function(){
		//1.将目标元素和元素copy定义成私有静态属性
        var $schoolBoxCopy = $(
            '<div class="school-box">' + 
                '<div class="school-box-header">选择学校</div>' + 
                '<div class="school-box-provinces"></div>' + 
                '<div class="school-box-schools"></div>' + 
            '</div>');

        var $provinceCopy = $('<a href="javascript:void(0)" class="province-item"></a>');
        var $schoolCopy = $('<a href="javascript:void(0)" class="school-item"></a>');

        // 非实例化缓存
        var provinces = SCHOOL_LIST;

		//2.将初始化province和school定义成私有静态方法
        var getProvinceById = function(pid){
            for(var i=0; i<provinces.length; i++){
                // NOTE: 前置条件province id可以转成数字
                if(Number(provinces[i]['id']) == Number(pid)){
                    return provinces[i];
                }
            }
            return undefined;
        };

        var initProvinces = function($provinceDiv){
            for(var i=0; i<provinces.length; i++){
                var province = provinces[i];
                var $province = $provinceCopy.clone();
                $province.attr('data-province', province['id'])
                            .text(province['name']);
                $provinceDiv.append($province);
            }
        };

        var initSchools = function($schoolDiv, provinceId){
            var province = getProvinceById(provinceId);
            if(typeof province !== 'undefined'){
                var schools = province['school'];
                $schoolDiv.empty();

                for(var i=0; i<schools.length; i++){
                    var school = schools[i];
                    var $school = $schoolCopy.clone();
                    $school.attr('data-school', school['id'])
                            .text(school['name']);
                    $schoolDiv.append($school);
                }
            }
            return false;
        };

        var onProvinceClick = function($provinceDiv, $schoolDiv, cache){
            cache.lastProvinceIndex = $(this).index();
            var pid = $(this).attr('data-province');

            if(cache.curProvince != pid){
                // set chosen
                $provinceDiv.find('a[data-province="' + cache.curProvince + '"]').removeClass('chosen');
                $provinceDiv.find('a[data-province="' + pid + '"]').addClass('chosen');
                // update
                cache.curProvince = pid;
                initSchools($schoolDiv, pid);
            }
            // 滚动条置顶
            $schoolDiv.scrollTop(0);
        };
		
		//注意这里与先前不一样的是，需要操作元素的方法中得把目标元素作为参数传进去，而实例化的缓存（当前选中的province）也需要作为对象指针传入。
		
		//3.初始化方法及构造函数
        var init = function(instance){  //instance 比方 例子
            // 生成元素
            var $parent = $(instance.opts.appendTo);
            var $el = $('<div class="school-box-wrapper"></div>');

            $el.append($schoolBoxCopy.clone());
            $parent.append($el);

            // 初始化学校
            // NOTE: 这里不能用$el来find（否则live click将失效）
            var $provinceDiv = $parent.find('.school-box-provinces');
            var $schoolDiv = $parent.find('.school-box-schools');

            initProvinces($provinceDiv);

            // 事件
            $provinceDiv.find('a').click(function(event){
                onProvinceClick.apply(this, [$provinceDiv, $schoolDiv, instance.cache]);
            });

            $schoolDiv.find('a').live('click', function(event){
                // 配置里定义的事件回调
                if(instance.opts.schoolClickCallback){  //instance.opts
                    instance.opts.schoolClickCallback.apply(this, []);
                }
                // 自动收起
                instance.hide();
            });

            // 释放变量
            // NOTE: $provinceDiv和$schoolDiv不能释放，在事件中还用到
            $schoolBox = null;
            $parent = null;
            $el = null;
        };

        // 真正的构造函数
        return function(options){ 
            // 默认配置
            //Jquery的扩展方法原型是:　extend(dest,src1,src2,src3...); 它的含义是将src1,src2,src3...合并到dest中,返回值为合并后的dest,由此可以看出该方法合并后，是修改了dest的结构的。
            //如果想要得到合并的结果却又不想修改dest的结构，可以如下使用：var newSrc=$.extend({},src1,src2,src3...)//也就是将"{}"作为dest参数。
            this.opts = $.extend({ 
                appendTo: 'body'
            }, options);

            // 实例化的缓存
            this.cache = {
                curProvince: -1,
                lastProvinceIndex: 0  //最后一次点击的index，用于初始化选中
            };

            // 初始化生成
            init(this);
            this.init();
        };
    })();

	//4.在prototype中添加对外API
    SchoolBox.prototype = {
        init: function(){
            $(this.opts.appendTo).find('.school-box-provinces').find('a').first().click();
        },
        show: function(){
            $(this.opts.appendTo).find('.school-box-wrapper').slideDown();
        },
        hide: function(){
            $(this.opts.appendTo).find('.school-box-wrapper').slideUp();
        }
    };

    // export
    window.SchoolBox = SchoolBox;

})(jQuery);
/*
到这里我们已经将学校选择器的基本功能封装成了一个“类”，具体页面使用时，只需要定义它被包裹的父元素，可以直接new一个对象出来，并在构造时的配置变量里定义事件回调。虽然大体上实现了本文一开始的目标，但是仅仅实现了基本的级联功能，而且只能定义一个事件回调。如果页面有多个元素都需要根据选中的学校进行一些改变，那么这些代码都得写在schoolClickCallback中，这部分代码可能操作着来自页面不同部分的元素（甚至是其他组件），这样就会造成一些耦合。

function siteAdmin(nickName,siteName){
 this.nickName=nickName;
 this.siteName=siteName;
}
siteAdmin.prototype.showAdmin = function() {
 alert(this.nickName+"是"+this.siteName+"的站长!")
};
siteAdmin.prototype.showSite = function(siteUrl) {
 this.siteUrl=siteUrl;
 return this.siteName+"的地址是"+this.siteUrl;
};
var matou=new siteAdmin("网站名字","WEB前端开发");
var matou2=new siteAdmin("网站名字","WEB前端开发");
matou.age="30";
//  matou.showAdmin();
//  alert(matou.showSite("http://www.jb51.net/"));
alert(matou.hasOwnProperty("nickName"));//true
alert(matou.hasOwnProperty("age"));//true
alert(matou.hasOwnProperty("showAdmin"));//false  
alert(matou.hasOwnProperty("siteUrl"));//false
alert(siteAdmin.prototype.hasOwnProperty("showAdmin"));//true
alert(siteAdmin.prototype.hasOwnProperty("siteUrl"));//false
alert(siteAdmin.prototype.isPrototypeOf(matou))//true
alert(siteAdmin.prototype.isPrototypeOf(matou2))//true

*/