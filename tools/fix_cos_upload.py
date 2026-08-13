#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
股小白 PWA —— 重新上传到腾讯云 COS（清除 Content-Disposition 强制下载标记）。

原理：put_object 覆盖上传时，显式设置正确的 Content-Type，且不设置
Content-Disposition，从而去掉之前对象上的 attachment 标记。

用法：
    python fix_cos_upload.py <SecretId> <SecretKey> [Bucket] [Region]

默认桶名 guxiaobai-1467806129、地域 ap-guangzhou。
"""
import os
import sys

from qcloud_cos import CosConfig, CosS3Client

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 排除的目录（这些不进仓库/不参与网站运行）
EXCLUDE_DIRS = {'.workbuddy', '.git', '__pycache__'}
# 只上传这些顶层内容，其余忽略
ALLOWED_TOP = {
    'index.html', 'manifest.webmanifest', 'sw.js', '.gitignore',
    'deploy-guide.md', 'css', 'js', 'data', 'assets',
}

CTYPE = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.webmanifest': 'application/manifest+json',
    '.md': 'text/markdown; charset=utf-8',
    '': 'text/plain',
}


def guess_ctype(name):
    ext = os.path.splitext(name)[1].lower()
    if name == 'manifest.webmanifest':
        return 'application/manifest+json'
    if name == '.gitignore':
        return 'text/plain'
    return CTYPE.get(ext, 'application/octet-stream')


def main():
    if len(sys.argv) < 3:
        print('用法: python fix_cos_upload.py <SecretId> <SecretKey> [Bucket] [Region]')
        sys.exit(1)

    secret_id = sys.argv[1]
    secret_key = sys.argv[2]
    bucket = sys.argv[3] if len(sys.argv) > 3 else 'guxiaobai-1467806129'
    region = sys.argv[4] if len(sys.argv) > 4 else 'ap-guangzhou'

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    client = CosS3Client(config)

    uploaded = []
    for name in sorted(os.listdir(PROJECT_ROOT)):
        if name not in ALLOWED_TOP:
            continue
        full = os.path.join(PROJECT_ROOT, name)
        if os.path.isfile(full):
            _put(client, bucket, name, full, uploaded)
        elif os.path.isdir(full) and name not in EXCLUDE_DIRS:
            for root, dirs, files in os.walk(full):
                dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
                for f in files:
                    fp = os.path.join(root, f)
                    rel = os.path.relpath(fp, PROJECT_ROOT)
                    _put(client, bucket, rel, fp, uploaded)

    print('\n===== 完成 =====')
    print(f'共上传 {len(uploaded)} 个文件')
    print(f'访问地址: https://{bucket}.cos-website.{region}.myqcloud.com')
    print('请用浏览器强制刷新（Mac: Cmd+Shift+R / iPhone: 重新输入地址）后查看')


def _put(client, bucket, key, local_path, uploaded):
    ctype = guess_ctype(key)
    with open(local_path, 'rb') as fp:
        client.put_object(
            Bucket=bucket,
            Body=fp,
            Key=key,
            ContentType=ctype,
        )
    print(f'  ✓ {key}  ({ctype})')
    uploaded.append(key)


if __name__ == '__main__':
    main()
