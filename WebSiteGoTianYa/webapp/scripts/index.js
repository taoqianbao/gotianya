function DayModel() {
    this.dayNumber = 1;
    this.isactive = true;
    this.contacts = [];
}

$(document).ready(function () {

    window.myapp = {};

    window.myapp.lushuViewModel = (function (ko) {

        var self = this;

        var dayList = ko.observableArray(),
            error = ko.observable(),
            startAdds = ko.observable({ name: "", point: null }),
            endAdds = ko.observable({ name: "", point: null }),
            contacts = ko.observableArray(),
            points = ko.observableArray(),      //new BMap.Point(106.521436,29.532288)

            
            removePoint = function (i) {

                self.myapp.lushuViewModel.contacts.remove(this);
            },
            daySetActive = function (i) {

                $.each(dayList, function (i, o) {

                    console.log(o);

                });

            };


        var viewmodel = {
            startAdds: startAdds,
            endAdds: endAdds,
            contacts: contacts,

            dayList: dayList,

            dayActive: daySetActive,

            error: error,
            points: points,

            removePoint: removePoint
        };

        return viewmodel;
    })(ko);

    ko.applyBindings(window.myapp.lushuViewModel);

    var d1 = new DayModel();
    d1.dayNumber = 1;
    d1.isactive = true;
    window.myapp.lushuViewModel.dayList.push(d1);
    //window.myapp.lushuViewModel.dayList.push({ dayNumber: 2, isactive: false,  contacts: [] });


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
            text: '加入行程',
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


    $("#driveSearchBtn").bind("click", function () {
        buildPath();
    });

    function search(start, end) {

        driving.search(start, end);
    }

    function buildPath() {

        var points = window.myapp.lushuViewModel.contacts();
        var arrPoints = [];

        $.each(points, function (i, o) {
            var t1 = o.point;
            var p = new BMap.Point(t1.lng, t1.lat);
            arrPoints.push(p);
        });

        var p1 = window.myapp.lushuViewModel.startAdds();
        var p2 = window.myapp.lushuViewModel.endAdds();

        map.clearOverlays();
        driving.search(p1.point, p2.point, { waypoints: arrPoints });
    }

});


$(document).ready(function () {

    window.pageNum = 1;
    /**
     * Reset numbering on tab buttons
     */
    function reNumberPages() {
        pageNum = 1;
        var tabCount = $('#pageTab > li').length;
        $('#pageTab > li').each(function () {
            var pageId = $(this).children('a').attr('href');
            if (pageId == "#page1") {
                return true;
            }
            pageNum++;
            $(this).children('a').html('D ' + pageNum +
                '<button class="close" type="button" ' +
                'title="Remove this page">×</button>');
        });
    }

    /**
     * Add a Tab
     */
    $('#btnAddPage').click(function () {

        pageNum++;


        var d1 = new DayModel();
        d1.dayNumber = pageNum;
        d1.isactive = true;
        window.myapp.lushuViewModel.dayList.push(d1);

        window.myapp.lushuViewModel.dayActive(1);

        return;

       

        $('#pageTab').append(
            $('<li><a href="#page' + pageNum + '">' +
                'D ' + pageNum +
                '<button class="close" type="button" ' +
                'title="Remove this page">×</button>' +
                '</a></li>'));

        $('#pageTabContent').append(
            $('<div class="tab-pane" id="page' + pageNum +
                '">Content page' + pageNum + '</div>'));

        $('#page' + pageNum).tab('show');
    });

    /**
     * Remove a Tab
     */
    $('#pageTab').on('click', ' li a .close', function () {
        var tabId = $(this).parents('li').children('a').attr('href');
        $(this).parents('li').remove('li');
        $(tabId).remove();
        reNumberPages();
        $('#pageTab a:first').tab('show');
    });

    /**
     * Click Tab to show its content
     */
    $("#pageTab").on("click", "a", function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

});

$(document).ready(function () {

    //实例化编辑器
    //建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
    //var ue = UE.getEditor('editor');

    UE.getEditor('editor', {
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
        serverUrl: '/controller.ashx'
    });


    $(document).on("click", "a.EditDescModal", function (ev) {

        $('#ConfirmModel').modal('show');

        ev.preventDefault();
    });

    //resize
    $("#allmap").height($(window).height() - 50);
    $(window).resize(function () {
        $("#allmap").height($(window).height() - 50);
    });

});