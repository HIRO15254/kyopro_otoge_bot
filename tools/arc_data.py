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
                urls.append({"url": up.urljoin(url, str(j.get("href"))), "pack": pack_names[counter]})
        counter += 1
    return urls


def getDatas(url, pack):
    soup = get_as(url)["soup"]
    title = [soup.find_all("h2")[0].text]
    td = list(map(lambda x: str(x.text), soup.find_all('td')))
    co = list(map(float, re.findall(r"譜面定数 : .*?(..?\..)", str(soup))))
    try:
        return [title[0].strip(), td[0], pack] + co
    except IndexError as e:
        print(e)
        return None


jsonf = str(Path(__file__).resolve().parent.parent) + "\\credentials.json"
spread_sheet_key = "11PDRjN6gcPexgxuYui5B_Xd0BRQQ8tImKh31SVHnmWo"
worksheet = connect_gspread(jsonf, spread_sheet_key)
li = getlinks("https://wikiwiki.jp/arcaea/%E3%83%91%E3%83%83%E3%82%AF%E9%A0%86")
for i in range(len(li)):
    data = getDatas(li[i]["url"], li[i]["pack"])
    if data is not None:
        cell_list = worksheet.range(f'A{i + 1}:G{i + 1}')
        counter = 0
        for i in cell_list:
            if counter < len(data):
                i.value = data[counter]
            counter += 1
        worksheet.update_cells(cell_list)
    time.sleep(1)
