﻿/* 分页相关变量定义 */
var pageCount = 10; //每页显示记录数
var totalRecord = 0; //总记录数
var pagerStyle = "flickr"; //jPagerBar样式
var currentPageIndex = 1; //当前页
var orderBy = "ID ASC"; //排序字段


//查询条件
function fnGetSearch() {

    var strUrl = "";
    var ProdID = $("#txtProdID").val();          //单据状态
    var StartDate = $.trim($("#txtStartDate").val()); //开始日期
    var EndDate = $.trim($("#txtEndDate").val()); //截止日期

    strUrl = 'ProdID=' + escape(ProdID) + '&StartDate=' + escape(StartDate) + '&EndDate=' + escape(EndDate);
    $("#hiddSearch").val(strUrl);
    return strUrl;
}

/*
* 改页显示
*/
function ChangePageCountIndex(newPageCount, newPageIndex) {
    var fieldText = "";
    var msgText = "";
    var isFlag = true;
    if (!IsNumber(newPageIndex) || newPageIndex == 0) {
        isFlag = false;
        fieldText = fieldText + "跳转页面|";
        msgText = msgText + "必须为正整数格式|";
    }
    if (!IsNumber(newPageCount) || newPageCount == 0) {
        isFlag = false;
        fieldText = fieldText + "每页显示|";
        msgText = msgText + "必须为正整数格式|";
    }
    if (!isFlag) {
        popMsgObj.Show(fieldText, msgText);
    }
    else {
        if (newPageCount <= 0 || newPageIndex <= 0 || newPageIndex > ((totalRecord - 1) / newPageCount) + 1) {
            showPopup("../../../Images/Pic/Close.gif", "../../../Images/Pic/note.gif", "转到页数超出查询范围！");
            return false;
        }
        else {
            this.pageCount = parseInt(newPageCount);
            TurnToPage(parseInt(newPageIndex));
        }
    }
}
function Fun_FillParent_Content(id,no,productname,price,unitid,unit,taxrate,taxprice,discount,standard)
{
    $("#txtProdID").val(id);
    $("#txtProd").val(productname);
}

function fnSearch()
{
    if (!CheckInput()) {
        return;
    }
    fnGetSearch();
    TurnToPage(currentPageIndex);
}
/*
* 翻页处理
*/
function TurnToPage(pageIndex) {
    
    //设置当前页
    currentPageIndex = pageIndex;

    var strUrl = "Action=Select&"+$("#hiddSearch").val() + '&pageIndex=' + pageIndex + '&pageCount=' + pageCount + '&orderby=' + escape(orderBy);

    $.ajax({
        type: "POST", //用POST方式传输
        url: '../../../Handler/OperatingModel/PurchaseManager/PurchasePriceQuery.ashx', //目标地址
        dataType: "json", //数据格式:JSON
        cache: false,
        data: strUrl,
        beforeSend: function() {
            AddPop();
        }, //发送数据之前
        success: function(msg) {
            //数据获取完毕，填充页面据显示
            //数据列表
            $("#tblDetailInfo tbody").find("tr.newrow").remove();
            if (msg != null) {
                if (msg.data.length != 0) {
                    //$("#btnPrint").css("display", "inline");

                    $.each(msg.data, function(i, item) {
                    $("<tr class='newrow'></tr>").append("<td height='22' align='center'>" + item.ProductName + "</td>"
                        + "<td height='22' align='center'>" + item.ProviderName + "</td>"
                        + "<td height='22' align='center'>" + (parseFloat(item.TaxPrice)).toFixed($("#hidPoint").val()) + "</td>"
                              + "<td height='22' align='center'>" + item.DisCount + "</td>"
                                    + "<td height='22' align='center'>" + (parseFloat(item.TaxPriceAfterDisCount)).toFixed($("#hidPoint").val()) + "</td>"
                        + "<td height='22' align='center'>" + item.OrderDate + "</td>"
                        + "<td height='22' align='center'>" + item.OrderNo + "</td>"
                        + "<td height='22' align='center'>" + item.PurchaserName + "</td>"
//                        + "<td height='22' align='center'>" + FormatAfterDotNumber(item.RealTotal,2) + "</td>"
//                        + "<td height='22' align='center'>" + item.RealTotal + "</td>"
                       ).appendTo($("#tblDetailInfo tbody")
                    );
                    });
                }
                else {
                    //$("#btnPrint").css("display", "none");
                }
            }
            else {
                //$("#btnPrint").css("display", "none");
            }


            //页码
            ShowPageBar(
                "divPageClickInfo", //[containerId]提供装载页码栏的容器标签的客户端ID
                "<%= Request.Url.AbsolutePath %>", //[url]
                {
                style: pagerStyle, mark: "DetailListMark",
                totalCount: msg.totalCount,
                showPageNumber: 3,
                pageCount: pageCount,
                currentPageIndex: pageIndex,
                noRecordTip: "没有符合条件的记录",
                preWord: "上一页",
                nextWord: "下一页",
                First: "首页",
                End: "末页",
                onclick: "TurnToPage({pageindex});return false;"
            }
            );
            totalRecord = msg.totalCount;
            $("#txtShowPageCount").val(pageCount);
            ShowTotalPage(msg.totalCount, pageCount, pageIndex, $("#pagecount"));
            $("#txtToPage").val(pageIndex);
        },
        error: function() {
            popMsgObj.ShowMsg('请求发生错误！');
        },
        complete: function() {
            hidePopup();
            $("#divPageClickInfo").show();
            SetTableRowColor("tblDetailInfo", "#E7E7E7", "#FFFFFF", "#cfc", "cfc");
        }
    });
}

//打印
function fnPrint() {
    
//    if(ordering=="a")
//    {
//        ordering="asc";
//    }
//    else
//    {
//        ordering="desc"
//    }
    orderBy=orderBy.split('_')[0];
    var strRul = $("#hiddSearch").val();
    window.open("PurchasePriceQueryPrint.aspx?orderby="+orderBy+"&ordering="+"&" + strRul);
}

/*

*
* 设置数据明细表的行颜色
*/
function SetTableRowColor(elem, colora, colorb, colorc, colord) {
    //获取DIV中 行数据
    var tableTr = document.getElementById(elem).getElementsByTagName("tr");
    for (var i = 0; i < tableTr.length; i++) {
        //设置行颜色
        tableTr[i].style.backgroundColor = (tableTr[i].sectionRowIndex % 2 == 0) ? colora : colorb;
        //设置鼠标落在行上时的颜色
        tableTr[i].onmouseover = function() {
            if (this.x != "1") this.style.backgroundColor = colorc;
        }
        //设置鼠标离开行时的颜色
        tableTr[i].onmouseout = function() {
            if (this.x != "1") this.style.backgroundColor = (this.sectionRowIndex % 2 == 0) ? colora : colorb;
        }
    }
}

/*
* 排序处理
*/
function OrderBy(orderColum, orderTip) {
    //如果未检索，不做任何操作
    if(totalRecord == 0)
    return;    
    var ordering = "asc";
    //var orderTipDOM = $("#"+orderTip);
    var allOrderTipDOM = $(".orderTip");
    if ($("#" + orderTip).html() == "↓") {
        allOrderTipDOM.empty();
        $("#" + orderTip).html("↑");
    }
    else {
        ordering = "desc";
        allOrderTipDOM.empty();
        $("#" + orderTip).html("↓");
    }
    orderBy = orderColum + " " + ordering;
    TurnToPage(1);
}



//表单验证
function CheckInput() {
    var fieldText = "";
    var isFlag = true;
    var msgText = "";

    var FindDate = $.trim($("#txtStartDate").val()); //发现日期
    var FindDate1 = $.trim($("#txtEndDate").val()); //发现日期
    
    if(FindDate == ''){
        isFlag = false;
        fieldText = fieldText + "起始日期|";
        msgText = msgText + "请选择起始日期|";
    }
    if (FindDate1 == '') {
        isFlag = false;
        fieldText = fieldText + "结束日期|";
        msgText = msgText + "请选择结束日期|";
    }
    if (FindDate != '' && FindDate1 != '') {
        if (CompareDate(FindDate, FindDate1) == 1) {
            isFlag = false;
            fieldText = fieldText + "日期|";
            msgText = msgText + "结束日期不能早于起始日期|";
        }
    }
    if (!isFlag) {
        //注：两个方法显示弹出提示信息层,方法一是对字段用红色处理，方法二是所有的提示信息传入未处理颜色

        //方法一
        popMsgObj.Show(fieldText, msgText);

        //方法二
        //popMsgObj.ShowMsg('所有的错误信息字符串');
    }
    return isFlag;
}

function ClearPkroductInfo() {
    document.getElementById("txtProd").value = "";
    document.getElementById("txtProdID").value = "";
    closeProductdiv();
}