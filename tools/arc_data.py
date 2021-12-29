import json
import re
import time
import urllib
import urllib.parse as up
from os import path
from pathlib import Path
from typing import Counter

import gspread
from gspread.models import Spreadsheet
from oauth2client.client import Error
import requests
from bs4 import BeautifulSoup
from oauth2client.service_account import ServiceAccountCredentials


def connect_gspread(jsonf, key):
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_name(jsonf, scope)
    gc = gspread.authorize(credentials)
    SPREADSHEET_KEY = key
    worksheet = gc.open_by_key(SPREADSHEET_KEY).sheet1
    return worksheet


def get_as(url, cookies=None, params={}):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.88 Safari/537.36"}
        res = requests.get(url, cookies=cookies, params=params, headers=headers)
        return {"soup": BeautifulSoup(res.text, 'html.parser'), "cookie": res.cookies}
    except urllib.error.URLError as e:
        print(e)
        return None


def post_as(url, cookies=None, data=None):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.88 Safari/537.36"}
        res = requests.post(url, cookies=cookies, data=data, headers=headers)
        return {"soup": BeautifulSoup(res.text, 'html.parser'), "cookie": res.cookies}
    except urllib.error.URLError as e:
        print(e)
        return None


def getlinks(url):
    soup = get_as(url)["soup"]

    pack_names = ["Memory Archive"]
    pattern = re.compile(r'"(.*?)"')
    counter = 0
    while soup.find("h2", {"id": f"h2_content_1_{counter}"}):
        txt = soup.find("h2", {"id": f"h2_content_1_{counter}"}).text
        match_txt = pattern.match(txt)
        if match_txt:
            pack_names.append(match_txt.group(1))
        counter += 1

    urls = []
    url_tables = soup.find_all("table")
    counter = -1
    for i in url_tables:
        links = i.find_all("a")
        for j in links:
            if "#" not in str(j.get("href")):
                urls.append(up.urljoin(url, str(j.get("href"))))
        counter += 1
    return urls


def getDatas(url):
    try:
        soup = get_as(url)["soup"]
        title = soup.find("h2").text.strip()
        eng_title = re.findall(r"英語版タイトル「(.*?)」", str(soup))
        tr = soup.find_all('tr')
        rows = dict()
        for row in tr:
            try:
                head = row.find('th').text
                data = list(map(lambda x: x.text, row.find_all('td')))
                rows[head] = data
            except Exception:
                pass
        return {
            'title': title,
            'eng_title': eng_title[0] if eng_title else title,
            'pack': rows['Pack'][0][0: -2] if rows['Pack'][0].find('*') != -1 else rows['Pack'][0],
            'composer': rows['Composer'][0],
            'level': list(map(lambda x: x[0:-2] if x.find('*') != -1 else x, rows['Level'])),
            'notes': list(map(int, rows['Notes'])),
            'const': list(map(float, re.findall(r"譜面定数 : .*?(..?\..)", str(soup))))
        }
    except Exception:
        return None


jsonf = str(Path(__file__).resolve().parent.parent) + "\\credentials.json"
spread_sheet_key = "11PDRjN6gcPexgxuYui5B_Xd0BRQQ8tImKh31SVHnmWo"
worksheet = connect_gspread(jsonf, spread_sheet_key)
li = getlinks("https://wikiwiki.jp/arcaea/%E3%83%91%E3%83%83%E3%82%AF%E9%A0%86")
ds = worksheet.range(f'A2:H{len(li) * 4}')
diff_name = ['Past', 'Present', 'Future', 'Beyond']
row = 0
for i in range(len(li) - 1):
    try:
        data = getDatas(li[i])
        for j in range(len(data['level'])):
            ds[row * 8 + 0].value = data['title']
            ds[row * 8 + 1].value = data['eng_title']
            ds[row * 8 + 2].value = data['pack']
            ds[row * 8 + 3].value = data['composer']
            ds[row * 8 + 4].value = diff_name[j]
            ds[row * 8 + 5].value = data['level'][j]
            ds[row * 8 + 6].value = data['const'][j]
            ds[row * 8 + 7].value = data['notes'][j]
            row += 1
        print(f'{i + 1}/{len(li)}: ' + data['title'] + '/' + data['eng_title'])
    except Exception:
        pass
    time.sleep(0.3)
worksheet.update_cells(ds)
