#!/usr/bin/env python3
"""
crawler_url.py - Web Crawler untuk Mengumpulkan URL Artikel Teknologi
Mengumpulkan minimal 200 URL dari berbagai sumber berita teknologi Indonesia
"""

import requests
from bs4 import BeautifulSoup
import time
import re
from urllib.parse import urljoin, urlparse

# Konfigurasi
MAX_PAGES_TO_CRAWL = 10
OUTPUT_FILE = "urls_mentah.txt"
MIN_URLS_TARGET = 200
REQUEST_TIMEOUT = 15
DELAY_BETWEEN_REQUESTS = 2

# User Agent untuk menghindari blocking
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
}

SOURCES = [
    {
        'name': 'KompasTekno',
        'base_url': 'https://tekno.kompas.com/gadget',
        'page_pattern': 'https://tekno.kompas.com/gadget?page={}',
        'article_selector': 'article.article__list a.article__link',
        'start_page': 1
    },
    {
        'name': 'VIVA Tekno',
        'base_url': 'https://www.viva.co.id/digital',
        'page_pattern': 'https://www.viva.co.id/digital/index?page={}',
        'article_selector': 'article a[href*="/digital/"]',
        'start_page': 1
    },
    {
        'name': 'Merdeka Tekno',
        'base_url': 'https://www.merdeka.com/teknologi',
        'page_pattern': 'https://www.merdeka.com/teknologi/index/{}',
        'article_selector': 'div.mdk-feed-item h3 a',
        'start_page': 0
    },
    {
        'name': 'Liputan6 Tekno',
        'base_url': 'https://www.liputan6.com/tekno',
        'page_pattern': 'https://www.liputan6.com/tekno?page={}',
        'article_selector': 'article a[href*="/tekno/"]',
        'start_page': 1
    }
]

def is_valid_url(url):
    """Validasi URL"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def fetch_page(url, retries=3):
    """Mengambil halaman dengan retry mechanism"""
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            if response.status_code == 200:
                return response
            elif response.status_code == 404:
                print(f"   ⚠️  404 Not Found: {url}")
                return None
            else:
                print(f"   ⚠️  Status {response.status_code}: {url}")
        except requests.exceptions.Timeout:
            print(f"   ⏱️  Timeout (attempt {attempt + 1}/{retries})")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {str(e)[:50]}")
        
        if attempt < retries - 1:
            time.sleep(2 * (attempt + 1))
    
    return None

def extract_urls_from_page(html, source_config, base_url):
    """Ekstrak URL artikel dari halaman"""
    soup = BeautifulSoup(html, 'html.parser')
    urls = set()
    
    # Coba beberapa selector umum jika selector spesifik gagal
    selectors = [
        source_config['article_selector'],
        'article a',
        'a[href*="202"]',  # URL dengan tahun
        'div.article a',
        'h2 a, h3 a'
    ]
    
    for selector in selectors:
        try:
            links = soup.select(selector)
            for link in links:
                href = link.get('href')
                if href:
                    # Buat absolute URL
                    full_url = urljoin(base_url, href)
                    
                    # Filter URL yang valid dan relevan
                    if (is_valid_url(full_url) and 
                        not full_url.endswith(('.jpg', '.png', '.gif', '.pdf')) and
                        len(full_url) > 30 and
                        ('202' in full_url or 'artikel' in full_url or 'news' in full_url)):
                        urls.add(full_url)
            
            if urls:  # Jika sudah dapat URL, keluar dari loop
                break
        except Exception as e:
            continue
    
    return list(urls)

def crawl_source(source_config):
    """Crawl satu sumber berita"""
    print(f"\n{'='*60}")
    print(f"🔍 Crawling: {source_config['name']}")
    print(f"{'='*60}")
    
    all_urls = set()
    
    for page_num in range(MAX_PAGES_TO_CRAWL):
        # Generate URL halaman
        if page_num == 0:
            page_url = source_config['base_url']
        else:
            page_url = source_config['page_pattern'].format(
                source_config['start_page'] + page_num
            )
        
        print(f"\n📄 Halaman {page_num + 1}: {page_url}")
        
        # Fetch halaman
        response = fetch_page(page_url)
        if not response:
            print(f"   ⛔ Gagal mengambil halaman, skip ke halaman berikutnya")
            continue
        
        # Ekstrak URLs
        urls = extract_urls_from_page(
            response.text, 
            source_config, 
            page_url
        )
        
        new_urls = set(urls) - all_urls
        all_urls.update(new_urls)
        
        print(f"   ✅ Ditemukan {len(new_urls)} URL baru (Total: {len(all_urls)})")
        
        # Delay antar request
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    print(f"\n📊 Total URL dari {source_config['name']}: {len(all_urls)}")
    return list(all_urls)

def main():
    """Fungsi utama crawler"""
    print("="*60)
    print("🚀 TechScope URL Crawler")
    print("="*60)
    print(f"Target: {MIN_URLS_TARGET} URLs")
    print(f"Halaman per sumber: {MAX_PAGES_TO_CRAWL}")
    print(f"Output: {OUTPUT_FILE}")
    
    all_urls = []
    
    # Crawl setiap sumber
    for source in SOURCES:
        try:
            urls = crawl_source(source)
            all_urls.extend(urls)
            print(f"✅ {source['name']}: {len(urls)} URLs berhasil dikumpulkan")
        except Exception as e:
            print(f"❌ Error pada {source['name']}: {str(e)}")
            continue
    
    # Remove duplicates
    all_urls = list(set(all_urls))
    
    # Simpan ke file
    print(f"\n{'='*60}")
    print(f"💾 Menyimpan hasil...")
    print(f"{'='*60}")
    
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            for url in all_urls:
                f.write(url + '\n')
        
        print(f"✅ Total URL disimpan: {len(all_urls)}")
        print(f"📁 File output: {OUTPUT_FILE}")
        
        if len(all_urls) >= MIN_URLS_TARGET:
            print(f"🎉 Target tercapai! ({len(all_urls)} >= {MIN_URLS_TARGET})")
        else:
            print(f"⚠️  Target belum tercapai ({len(all_urls)} < {MIN_URLS_TARGET})")
            print(f"   Pertimbangkan untuk menambah MAX_PAGES_TO_CRAWL")
    
    except Exception as e:
        print(f"❌ Error menyimpan file: {str(e)}")
    
    print(f"\n{'='*60}")
    print("✨ Crawling selesai!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()