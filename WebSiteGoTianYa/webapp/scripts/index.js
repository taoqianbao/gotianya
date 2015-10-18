function CityModel(p) {
    var self = this;
    self.name = ko.observable(p);
    return {
        name: self.name
    };
}

function ImageModel(p) {
    var self = this;
    self.name = ko.observable(p.name);
    self.src = ko.observable(p.src);
    return {
        name: self.name,
        src: self.src
    }
}

function DayModel(p) {

    var self = this;
    var _default = {
        dayNumber: 1,
        description: "",
    };
    p = $.extend({}, _default, p);

    self.dayNumber = ko.observable(p.dayNumber);
    self.description = ko.observable(p.description);
    self.cities = ko.observableArray([]);
    self.images = ko.observableArray([]);

    self.addCity = function () {
        var city = new CityModel("");
        self.cities.push(city);
    },
    self.removeCity = function (p) {
        self.cities.remove(p);
    },
    self.addImage = function (p) {
        var img = new ImageModel(p);
        self.images.push(img);
    },
    self.removeImage = function (p) {
        self.images.remove(p);
    };

    return {
        dayNumber: self.dayNumber,
        cities: self.cities,
        images: self.images,
        description: self.description

        , addCity: self.addCity
        , removeCity: self.removeCity

        , addImage: self.addImage
        , removeImage: self.removeImage
    };
}

$(document).ready(function () {

    window.myapp = {};

    window.myapp.lushuViewModel = (function (ko) {

        var self = this;

        var name = ko.observable(),
            dayList = ko.observableArray(),
            dayActive = ko.observable(1),

            error = ko.observable(),
            startAdds = ko.observable({ name: "", point: null }),
            endAdds = ko.observable({ name: "", point: null }),
            contacts = ko.observableArray(),
            points = ko.observableArray(),      //new BMap.Point(106.521436,29.532288)

            removePoint = function (i) {
                self.myapp.lushuViewModel.contacts.remove(this);
            },

            addDay = function (day) {
                dayList.push(day);
            },
            removeDay = function () {
                self.myapp.lushuViewModel.dayActive(1);
                self.myapp.lushuViewModel.dayList.remove(this);

                reNameDay();
            },
            reNameDay = function () {
                var daylist = dayList();
                $.each(daylist, function (i, o) {
                    o.dayNumber(i + 1);
                });
            };

        var viewmodel = {

            name: name,

            startAdds: startAdds,
            endAdds: endAdds,
            contacts: contacts,

            dayList: dayList,
            dayActive: dayActive,

            error: error,
            points: points,

            removePoint: removePoint,

            addDay: addDay,
            removeDay: removeDay
        };

        return viewmodel;
    })(ko);

    var d1 = new DayModel({ dayNumber: 1 });
    window.myapp.lushuViewModel.dayList.push(d1);

    ko.applyBindings(window.myapp.lushuViewModel);


    // 百度地图API功能
    var map = new BMap.Map("allmap");
    var geoc = new BMap.Geocoder();     //根据地址描述获得坐标
    //三种驾车策略：最少时间，最短距离，避开高速
    var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME, BMAP_DRIVING_POLICY_LEAST_DISTANCE, BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
    var renderOptions = {
        map: map,
        autoViewport: true,
        enableDragging: false //起终点是否进行拖拽
    };
    var drivingRouteOptions = {
        renderOptions: renderOptions,
        policy: routePolicy[0],
        onSearchComplete: function (results) {
            console.log("onSearchComplete", arguments);
        },
        onMarkersSet: function () { console.log("onMarkersSet", arguments); },
        onInfoHtmlSet: function () { console.log("onInfoHtmlSet", arguments); },
        onPolylinesSet: function () { console.log("onPolylinesSet", arguments); },
        onResultsHtmlSet: function () { console.log("onResultsHtmlSet", arguments); }
    };
    var driving = new BMap.DrivingRoute(map, drivingRouteOptions);


    var point = new BMap.Point(116.404, 39.915);            //实际环境-根据GPS获取当前位置
    //map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
    map.centerAndZoom(point, 15);

    var menu = new BMap.ContextMenu();
    var txtMenuItem = [
        {
            text: '加入途经点',
            callback: function (h, p) {

                console.log(h, p);  //h.lat ,h.lng,     //p.x,p.y

                geoc.getLocation(h, function (rs) {
                    var addComp = rs.addressComponents;
                    var straddFull = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                    //console.log(addComp);
                    var point = new BMap.Point(h.lng, h.lat);
                    addMarker(point, "新增途经点");
                    window.myapp.lushuViewModel.contacts.push({ name: straddFull, point: point });

                });
            }
        },
        {
            text: '设为起点',
            callback: function (h, p) {
                geoc.getLocation(h, function (rs) {
                    var addComp = rs.addressComponents;
                    var straddFull = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                    var point = new BMap.Point(h.lng, h.lat);
                    addMarker(point, "起点");
                    window.myapp.lushuViewModel.startAdds({ name: straddFull, point: point });//;
                });
            }
        },
        {
            text: '设为终点',
            callback: function (h, p) {
                geoc.getLocation(h, function (rs) {
                    var addComp = rs.addressComponents;
                    var straddFull = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                    var point = new BMap.Point(h.lng, h.lat);
                    addMarker(point, "终点");
                    window.myapp.lushuViewModel.endAdds({ name: straddFull, point: point });//
                });
            }
        }
    ];
    for (var i = 0; i < txtMenuItem.length; i++) {
        menu.addItem(new BMap.MenuItem(txtMenuItem[i].text, txtMenuItem[i].callback, 100));
    }
    map.addContextMenu(menu);

    /*
    var iscreatr = false;
    map.addEventListener("click", function (e) {
        if (iscreatr == true) return;
        //---------------------------------------------遮盖物---------------------------------------------  
        iscreatr = true;
        var point = new BMap.Point(e.point.lng, e.point.lat);//默认  
        // 创建标注对象并添加到地图    
        var marker = new BMap.Marker(point);
        var label = new BMap.Label("我是可以拖动的", { offset: new BMap.Size(20, -10) });
        marker.setLabel(label)
        map.addOverlay(marker);
        marker.enableDragging();    //可拖拽  
        marker.addEventListener("dragend", function (e) {

            console.log(e.point.lng + ", " + e.point.lat);//打印拖动结束坐标  
        });
    });
    */

    function addMarker(p, labeltext) {
        var marker = new BMap.Marker(p);
        var label = new BMap.Label(labeltext, { offset: new BMap.Size(20, -10) });
        marker.setLabel(label)
        map.addOverlay(marker);
    }


    $("#driveSearchBtn").bind("click", buildPath);

    function search(start, end) {

        driving.search(start, end);
    }

    function buildPath() {

        var p1 = window.myapp.lushuViewModel.startAdds();
        var p2 = window.myapp.lushuViewModel.endAdds();

        if (p1 == null || p1.point == null
            || p2 == null || p2.point == null) {
            alert("请设置起点和终点");
            return;
        }

        var points = window.myapp.lushuViewModel.contacts();
        var arrPoints = [];

        $.each(points, function (i, o) {
            var t1 = o.point;
            var p = new BMap.Point(t1.lng, t1.lat);
            arrPoints.push(p);
        });

        map.clearOverlays();
        driving.search(p1.point, p2.point, { waypoints: arrPoints });

        buildStaticMap();





    }

    function buildStaticMap() {


        //http://api.map.baidu.com/staticimage?center=116.403874,39.914888&width=500&height=500&zoom=11&paths=116.288891,40.004261;116.487812,40.017524;116.525756,39.967111;116.536105,39.872373&pathStyles=0xff0000,5,1

        var p1 = window.myapp.lushuViewModel.startAdds();
        var p2 = window.myapp.lushuViewModel.endAdds();
        var points = window.myapp.lushuViewModel.contacts();


        var keyPoints = [];
        keyPoints.push(p1.point.lng + ',' + p1.point.lat);
        $.each(points, function (i, o) {
            var t1 = o.point;
            keyPoints.push(t1.lng + ',' + t1.lat);
        });
        keyPoints.push(p2.point.lng + ',' + p2.point.lat);

        var url = "http://api.map.baidu.com/staticimage?";
        var parameters = [];
        //parameters.push("center=116.403874,39.914888");
        parameters.push("width=500");
        parameters.push("height=500");
        //parameters.push("zoom=11");
        parameters.push("paths=" + keyPoints.join(";") + "");
        parameters.push("pathStyles=0xff0000,5,1");
        parameters.push("markers=" + keyPoints.join("|"));
        parameters.push("markerStyles=l,S,0x00ff00|s,0xff0000");
        url += parameters.join("&");
        $("#staticImage").attr("src", url);
    }

});

$(document).ready(function () {

    /**
     * Add a Tab
     */
    $('#btnAddPage').click(function () {

        var list = window.myapp.lushuViewModel.dayList();

        var pageNum = 1;

        if (list != null) {
            pageNum = window.myapp.lushuViewModel.dayList().length + 1;
        }

        var d1 = new DayModel({ dayNumber: pageNum });

        window.myapp.lushuViewModel.dayList.push(d1);

        window.myapp.lushuViewModel.dayActive(pageNum);

        $('#page' + pageNum).tab('show');
    });

    /**
     * Click Tab to show its content
     */
    $("#pageTab").on("click", "a", function (e) {
        e.preventDefault();
        var dayid = $(this).attr("dataid");
        window.myapp.lushuViewModel.dayActive(dayid);
    });


    //实例化编辑器
    //建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
    //var ue = UE.getEditor('editor');

    var ue = UE.getEditor('editor', {
        //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
        toolbars: [['FullScreen', 'Source', 'Undo', 'Redo', 'Bold', 'test', 'simpleupload']],
        //focus时自动清空初始化时的内容
        autoClearinitialContent: true,
        //关闭字数统计
        wordCount: false,
        //关闭elementPath
        elementPathEnabled: false,
        //默认的编辑区域高度
        initialFrameHeight: 300,
        //更多其他参数，请参考ueditor.config.js中的配置项
        serverUrl: '/server/ueditorcontroller.ashx'
    });

    $("#btnSaveEditor").bind("click", function () {

        ue.ready(function () {

            //设置编辑器的内容
            //ue.setContent('hello');
            //获取html内容，返回: <p>hello</p>
            var html = ue.getContent();
            //获取纯文本内容，返回: hello
            //var txt = ue.getContentTxt();

            var i = window.myapp.lushuViewModel.dayActive();
            var currentDay = "#page" + i;
            $("div.txtDescription", currentDay).html(html);

            $('#ConfirmModel').modal('hide');

        });
    });

    $(document).on("click", "a.EditDescModal", function (ev) {

        $('#ConfirmModel').modal('show');

        var i = window.myapp.lushuViewModel.dayActive();
        var currentDay = "#page" + i;
        var html = $("div.txtDescription", currentDay).html();
        ue.setContent(html);

        ev.preventDefault();
    });

    $(document).on("click", "a.EditPicModal", function (ev) {

        $('#uploadPicModal').modal('show');

        var i = window.myapp.lushuViewModel.dayActive();
        var currentDay = "#page" + i;

        window.uploader.refresh();

        ev.preventDefault();
    });

    //resize
    $(window).resize(function () {
    });
    function onResize() {
        $("#allmap").height($(window).height() - 50);
        $("#contentContainer").height($(window).height() - 50);
    }
});