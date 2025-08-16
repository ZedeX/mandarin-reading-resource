#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
中小学语文示范诵读库 本地开发服务器

这个脚本用于在本地启动一个简单的HTTP服务器，以便正确加载JSON数据文件。
在项目目录下运行此脚本，然后在浏览器中访问 http://localhost:8000

功能：
1. 启动一个简单的HTTP服务器（端口8000）
2. 设置正确的MIME类型以便浏览器正确识别JSON文件
3. 支持CORS（跨源资源共享），方便前端JavaScript访问数据

使用方法：
1. 在命令行中切换到项目目录
2. 运行命令：python server.py
3. 在浏览器中访问：http://localhost:8000
4. 要停止服务器，按 Ctrl+C

注意：
- 请确保你的系统已安装Python 3
- 如果端口8000已被占用，可以修改PORT变量使用其他端口
"""

import http.server
import socketserver
import json
import os
from pathlib import Path

# 服务器端口
PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头部，允许跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def guess_type(self, path):
        """重写guess_type方法，为JSON文件设置正确的MIME类型"""
        # 获取文件扩展名
        ext = Path(path).suffix.lower()
        
        # 为JSON文件设置正确的MIME类型
        if ext == '.json':
            return 'application/json'
        elif ext == '.opus':
            return 'audio/ogg'
        
        # 对于其他文件，使用默认的guess_type方法
        return super().guess_type(path)

    def do_GET(self):
        """处理GET请求"""
        # 如果请求的是根目录，则默认返回index.html
        if self.path == '/':
            self.path = '/index.html'
        
        # 调用父类的do_GET方法处理请求
        return super().do_GET()

    def do_OPTIONS(self):
        """处理OPTIONS请求（CORS预检请求）"""
        self.send_response(200)
        self.end_headers()

def main():
    # 设置当前目录为服务器根目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 创建服务器
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"中小学语文示范诵读库 本地服务器启动成功！")
        print(f"请在浏览器中访问: http://localhost:{PORT}")
        print("按 Ctrl+C 停止服务器")
        
        try:
            # 启动服务器
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
            httpd.server_close()

if __name__ == "__main__":
    main()