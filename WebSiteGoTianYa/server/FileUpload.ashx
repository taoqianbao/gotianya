<%@ WebHandler Language="C#" Class="FileUpload" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Text;


    /// <summary>
    /// Summary description for fileupload
    /// </summary>
    public class FileUpload : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            //指定字符集
            context.Response.ContentEncoding = Encoding.UTF8;
            if (context.Request["REQUEST_METHOD"] == "OPTIONS")
            {
                context.Response.End();
            }
            SaveFile();
        }
        /// <summary>
        /// 文件保存操作
        /// </summary>
        /// <param name="basePath"></param>
        private void SaveFile()
        {
            string DatePath = DateTime.Now.Year.ToString() + DateTime.Now.Month.ToString() + DateTime.Now.Day.ToString();
            string basePath = "/Upload/CompanyProductImages/"+DatePath+"/";
            string basePath1 = "/Upload/CompanyProductImages/" + DatePath + "/";
            string name = string.Empty;
            basePath =System.Web.HttpContext.Current.Server.MapPath(basePath);
           
            
            HttpFileCollection files = System.Web.HttpContext.Current.Request.Files;
            //如果目录不存在，则创建目录
            if (!Directory.Exists(basePath))
            {
                Directory.CreateDirectory(basePath);
            }

            string[] suffix = files[0].ContentType.Split('/');
            //获取文件格式
            string _suffix = suffix[1].Equals("jpeg", StringComparison.CurrentCultureIgnoreCase) ? "jpg" : suffix[1];
          
           
          //  string _temp = System.Web.HttpContext.Current.Request["name"];
            
            
            string _temp = string.Empty;
            
            //如果不修改文件名，则创建随机文件名
            if (!string.IsNullOrEmpty(_temp))
            {
                name = _temp+ "." + _suffix;
            }
            else
            {
                Random rand = new Random(24 * (int)DateTime.Now.Ticks);
                name = rand.Next() + "." + _suffix;
            }
            
            //文件保存
            string full = basePath + name;
            
            files[0].SaveAs(full);

            string _result = "{\"jsonrpc\" : \"2.0\", \"result\" : null, \"id\" : \"" + basePath1 + name + "\"}";

            System.Web.HttpContext.Current.Response.Write(_result);
            
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
