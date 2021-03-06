﻿<%@ WebHandler Language="C#" Class="NotPass" %>

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
using XBase.Business.Office.StorageManager;
using XBase.Model.Office.StorageManager;
using System.Web.SessionState;

public class NotPass : IHttpHandler, IRequiresSessionState
{

    public void ProcessRequest(HttpContext context)
    {
        if (context.Request.RequestType == "POST")
        {
            int User = ((UserInfoUtil)SessionUtil.Session["UserInfo"]).EmployeeID;
            string CompanyCD = ((UserInfoUtil)SessionUtil.Session["UserInfo"]).CompanyCD;
            //string ActionPlan = context.Request.QueryString["ActionPlan"];
            //设置行为参数
            int pageCount = 10;
            string orderString = context.Request.Form["orderBy"].ToString();//排序
            string order = "asc";//排序：升序
            string orderBy = (!string.IsNullOrEmpty(orderString)) ? orderString.Substring(0, orderString.Length - 2) : "NotPassNum";//要排序的字段，如果为空，默认为"ID"
            if (orderString.EndsWith("_d"))
                order = "desc";//排序：降序
            pageCount = int.Parse(context.Request.Form["pageCount"].ToString());//每页显示记录数
            int pageIndex = int.Parse(context.Request.Form["pageIndex"].ToString());//当前页
            string myOrder = orderBy + " " + order;


            DateTime EndCheckDate = Convert.ToDateTime("9999-2-3");
            string BeginDate = context.Request.Form["BeginTime"].ToString().Trim();
            string EndDate = context.Request.Form["EndTime"].ToString().Trim();
            string ReasonID = context.Request.Form["ReasonID"].ToString();
            string TotalNotPassCount="0";
            int TotalCount = 0;              
            DataTable dt =PurchaseApplyNoPassBus.SearchNoPass("0",BeginDate,EndDate,ReasonID,myOrder,pageIndex,pageCount,ref TotalNotPassCount,ref TotalCount );
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            sb.Append("{");
            sb.Append("totalCount:");
            sb.Append(TotalCount.ToString());
            sb.Append(",data:");
            if (dt.Rows.Count == 0)
                sb.Append("[{\"ID\":\"\"}]");
            else
                sb.Append(JsonClass.DataTable2Json(dt));
            sb.Append("}");
            context.Response.ContentType = "text/plain";
            context.Response.Write(sb.ToString());
            context.Response.End();
            //  }
        }
    }

    /// <summary>
    /// datatabletoxml
    /// </summary>
    /// <param name="xmlDS"></param>
    /// <returns></returns>
    private XElement ConvertDataTableToXML(DataTable xmlDS)
    {
        StringWriter sr = new StringWriter();
        xmlDS.TableName = "Data";
        xmlDS.WriteXml(sr, System.Data.XmlWriteMode.IgnoreSchema, true);
        string contents = sr.ToString();
        return XElement.Parse(contents);
    }

    public static string ToJSON(object obj)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        return serializer.Serialize(obj);
    }


    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
    //数据源结构
    public class DataSourceModel
    {
        public string ID { get; set; }
        public string NotPassNum { get; set; }
        public string ProductName { get; set; }
        public string CodeName { get; set; }
        public string Specification { get; set; }
        public string ProcessWay { get; set; }

    }
    

}