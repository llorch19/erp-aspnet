﻿<%@ WebHandler Language="C#" Class="ReportByDeptAndSellerAndDate" %>

using System;
using System.Web;
using System.Collections;
using System.Data;
using System.Linq;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.Xml.Linq;
using System.Web.Script.Serialization;
using System.IO;
using XBase.Common;
using XBase.Business.Office.SellManager;
using XBase.Model.Office.SellManager;
public class ReportByDeptAndSellerAndDate : IHttpHandler, System.Web.SessionState.IRequiresSessionState
{

    public void ProcessRequest(HttpContext context)
    {
        GetLsit(context);
    }

    private void GetLsit(HttpContext context)
    {
        //设置行为参数
        string orderString = (context.Request.Form["orderby"].ToString());//排序
        string order = "asc";//排序：升序
        string orderBy = (!string.IsNullOrEmpty(orderString)) ? orderString.Substring(0, orderString.Length - 2) : "DeptName";//要排序的字段，如果为空，默认为"ID"
        if (orderString.EndsWith("_d"))
        {
            order = "desc";//排序：降序
        }
        int pageCount = int.Parse(context.Request.Form["pageCount"].ToString());//每页显示记录数
        int pageIndex = int.Parse(context.Request.Form["pageIndex"].ToString());//当前页
        string strstartDate = context.Request.Params["startDate"].ToString().Trim();
        string strendDate = context.Request.Params["endDate"].ToString().Trim();
        DateTime StartDate = Convert.ToDateTime(strstartDate);
        DateTime EndDate = Convert.ToDateTime(strendDate);
        string DeptID = context.Request.Params["SellDeptId"].ToString().Trim();
        string strSeller = context.Request.Params["SellerId"].ToString().Trim();
        string strCurrencyType = context.Request.Params["CurrencyType"].ToString().Trim();
        int? SellerId = strSeller.Length == 0 ? null : (int?)Convert.ToInt32(strSeller);
        int? SellDeptId = DeptID.Length == 0 ? null : (int?)Convert.ToInt32(DeptID);
        int totalCount = 0;
        string ord = orderBy + " " + order;
        DataTable dt = new DataTable();
        if (strCurrencyType == "")
        {
            dt = SellOrderBus.ReportByDeptAndSellerAndDate(SellDeptId,SellerId, StartDate, EndDate, "2", pageIndex, pageCount, ord, ref totalCount);
        }
        else
        {
            dt = SellOrderBus.ReportByDeptAndSellerAndDate(SellDeptId, SellerId, Convert.ToInt32(strCurrencyType), StartDate, EndDate, "2", pageIndex, pageCount, ord, ref totalCount);
        }

        System.Text.StringBuilder sb = new System.Text.StringBuilder();
        sb.Append("{");
        sb.Append("totalCount:");
        sb.Append(totalCount.ToString());
        sb.Append(",data:");
        if (dt.Rows.Count == 0)
            sb.Append("[{\"DeptName\":\"\"}]");
        else
            sb.Append(JsonClass.DataTable2Json(dt));
        sb.Append("}");

        context.Response.ContentType = "text/plain";
        context.Response.Write(sb.ToString());
        context.Response.End();
    }
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}