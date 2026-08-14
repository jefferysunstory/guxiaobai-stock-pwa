#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 ImageGen 生成的图标（含浅灰边和 AI 水印）处理成 PWA 所需的各尺寸：
- 将浅灰背景与水印替换为深蓝色 #1E63D6（保留圆角方形主体）
- 高质量缩放成 180/192/512/maskable 尺寸
"""
import os
import glob
import numpy as np
from PIL import Image

RAW_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icons', 'raw')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icons')
BG = (30, 99, 214)  # #1E63D6

# 各种尺寸（iOS / PWA / Manifest）
SIZES = {
    'icon-152.png': 152,
    'icon-167.png': 167,
    'icon-180.png': 180,
    'icon-192.png': 192,
    'icon-512.png': 512,
    'maskable-512.png': 512,
}


def clean_image(img):
    """把浅灰背景和水印替换为深蓝色"""
    arr = np.array(img.convert('RGB'))
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    # 浅灰条件：RGB 在 130-240 之间且接近灰（排除纯白和纯深色）
    near_gray = (
        (r > 130) & (r < 240) &
        (g > 130) & (g < 240) &
        (b > 130) & (b < 240) &
        (np.abs(r.astype(int) - g.astype(int)) < 35) &
        (np.abs(g.astype(int) - b.astype(int)) < 35)
    )
    arr[near_gray] = BG
    return Image.fromarray(arr)


def main():
    src_list = glob.glob(os.path.join(RAW_DIR, '*.png'))
    if not src_list:
        print('error: raw 目录里没有 png')
        return
    src = src_list[0]
    print(f'输入: {src}')
    raw = Image.open(src)
    clean = clean_image(raw)
    print(f'去水印后尺寸: {clean.size}')

    for name, sz in SIZES.items():
        out = clean.resize((sz, sz), Image.LANCZOS)
        out.save(os.path.join(OUT_DIR, name), 'PNG', optimize=True)
        print(f'  ✓ {name} ({sz}x{sz})')

    print(f'\n完成。输出目录: {OUT_DIR}')


if __name__ == '__main__':
    main()
