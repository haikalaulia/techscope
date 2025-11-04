# improved_scraper.py
import asyncio
import aiohttp
import csv
import logging
import re
import json
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import pandas as pd
import config

class ImprovedMultiPortalScraper:
    def __init__(self):
        self.setup_logging()
        self.domain_handlers = {
            'bhinneka.com': self.handle_bhinneka,
            'tokopedia.com': self.handle_tokopedia,
            'bukalapak.com': self.handle_bukalapak,
            'shopee.co.id': self.handle_shopee,
            'lazada.co.id': self.handle_lazada,
            'blibli.com': self.handle_blibli,
            'pricebook.co.id': self.handle_pricebook,
            'gadgetren.com': self.handle_gadgetren,
            'gsmarena.com': self.handle_gsmarena,
            'techradar.com': self.handle_techradar,
        }
        
        self.stats = {
            'total': 0, 'processed': 0, 'successful': 0, 
            'failed': 0, 'skipped': 0
        }
        
        self.output_fields = [
            'id', 'title', 'brand', 'model', 'processor', 'gpu', 'ram', 
            'storage', 'display', 'battery', 'weight', 'os', 'harga', 
            'price_value', 'price_currency', 'content', 'image', 
            'source_url', 'crawl_date', 'device_type', 'specification_json',
            'tags', 'author', 'release_date'
        ]
    
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('improved_scraper.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def get_domain(self, url):
        parsed = urlparse(url)
        return parsed.netloc.lower().replace('www.', '')
    
    def init_output_file(self):
        with open('scraped_data.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=self.output_fields)
            writer.writeheader()
    
    def get_existing_urls(self):
        try:
            df = pd.read_csv('scraped_data.csv')
            return set(df['source_url'].tolist())
        except FileNotFoundError:
            return set()
    
    async def handle_bhinneka(self, soup, url):
        """Handler untuk Bhinneka.com"""
        try:
            # Extract title
            title = self.extract_title(soup)
            
            # Extract price
            harga, price_value, currency = self.extract_price_bhinneka(soup)
            
            # Extract specifications
            specs = self.extract_specifications_bhinneka(soup)
            
            # Extract content/description
            content = self.extract_content_bhinneka(soup)
            
            # Extract image
            image = self.extract_image(soup, url)
            
            # Determine device type
            device_type = self.determine_device_type(title, specs)
            
            # Extract tags
            tags = self.extract_tags(title, specs, device_type)
            
            data = {
                'title': title,
                'brand': specs.get('brand', ''),
                'model': specs.get('model', ''),
                'processor': specs.get('processor', ''),
                'gpu': specs.get('gpu', ''),
                'ram': specs.get('ram', ''),
                'storage': specs.get('storage', ''),
                'display': specs.get('display', ''),
                'battery': specs.get('battery', ''),
                'weight': specs.get('weight', ''),
                'os': specs.get('os', ''),
                'harga': harga,
                'price_value': price_value,
                'price_currency': currency,
                'content': content,
                'image': image,
                'device_type': device_type,
                'specification_json': json.dumps(specs, ensure_ascii=False),
                'tags': ','.join(tags),
                'author': 'Bhinneka',
                'release_date': ''
            }
            
            return data
        except Exception as e:
            self.logger.error(f"Error in handle_bhinneka: {e}")
            return {}
    
    def extract_title(self, soup):
        """Extract judul dari berbagai sumber"""
        # Priority: h1 -> og:title -> meta title
        h1 = soup.find('h1')
        if h1:
            return h1.get_text(strip=True)
        
        og_title = soup.find('meta', property='og:title')
        if og_title:
            return og_title.get('content', '').strip()
        
        meta_title = soup.find('title')
        if meta_title:
            return meta_title.get_text(strip=True)
        
        return ""
    
    def extract_price_bhinneka(self, soup):
        """Extract harga dari Bhinneka"""
        try:
            # Cari elemen harga
            price_selectors = [
                '[class*="price"]',
                '[class*="harga"]',
                '.oe_currency_value',
                '.product-price',
                '.final-price'
            ]
            
            for selector in price_selectors:
                price_elem = soup.select_one(selector)
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    # Extract angka dari teks harga
                    price_match = re.search(r'Rp\s*([\d.,]+)', price_text)
                    if price_match:
                        price_str = price_match.group(1).replace('.', '').replace(',', '')
                        price_value = int(price_str) if price_str.isdigit() else 0
                        harga_text = f"Rp {price_match.group(1)}"
                        return harga_text, price_value, "IDR"
            
            return "", 0, "IDR"
        except Exception as e:
            self.logger.error(f"Error extracting price: {e}")
            return "", 0, "IDR"
    
    def extract_specifications_bhinneka(self, soup):
        """Extract spesifikasi dari Bhinneka"""
        specs = {}
        
        try:
            # Cari tabel spesifikasi
            spec_tables = soup.find_all('table', class_=re.compile(r'spec', re.I))
            
            for table in spec_tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        key = cells[0].get_text(strip=True)
                        value = cells[1].get_text(strip=True)
                        if key and value:
                            specs[key] = value
            
            # Mapping key spesifikasi
            spec_mapping = {
                'Merek': 'brand',
                'Model': 'model', 
                'Processor': 'processor',
                'Memori Standar': 'ram',
                'Penyimpanan': 'storage',
                'Ukuran Layar': 'display',
                'Sistem Operasi': 'os',
                'Berat': 'weight',
                'Baterai': 'battery',
                'Graphics': 'gpu'
            }
            
            # Normalize specs
            normalized_specs = {}
            for key, value in specs.items():
                normalized_key = spec_mapping.get(key, key)
                normalized_specs[normalized_key] = value
            
            return normalized_specs
            
        except Exception as e:
            self.logger.error(f"Error extracting specifications: {e}")
            return {}
    
    def extract_content_bhinneka(self, soup):
        """Extract konten/deskripsi produk"""
        content_selectors = [
            '[id*="description"]',
            '[class*="description"]',
            '[id*="detail"]',
            '[class*="detail"]',
            '.product-description',
            '.product-details'
        ]
        
        for selector in content_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text and len(text) > 10:
                    return text[:500]  # Limit content length
        
        return ""
    
    def extract_image(self, soup, url):
        """Extract image URL"""
        image_selectors = [
            'meta[property="og:image"]',
            '.product-image img',
            '.carousel img',
            '[class*="image"] img',
            'img[src*="product"]'
        ]
        
        for selector in image_selectors:
            if selector.startswith('meta'):
                meta = soup.select_one(selector)
                if meta and meta.get('content'):
                    return self.normalize_image_url(meta['content'], url)
            else:
                img = soup.select_one(selector)
                if img and img.get('src'):
                    return self.normalize_image_url(img['src'], url)
        
        return ""
    
    def normalize_image_url(self, img_url, base_url):
        """Normalize image URL"""
        if img_url.startswith('//'):
            return f"https:{img_url}"
        elif img_url.startswith('/'):
            return urljoin(base_url, img_url)
        else:
            return img_url
    
    def determine_device_type(self, title, specs):
        """Determine device type dari judul dan spesifikasi"""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ['laptop', 'notebook', 'macbook']):
            return 'Laptop'
        elif any(word in title_lower for word in ['smartphone', 'handphone', 'iphone', 'android']):
            return 'Handphone'
        elif any(word in title_lower for word in ['tablet', 'ipad']):
            return 'Tablet'
        else:
            return 'Other'
    
    def extract_tags(self, title, specs, device_type):
        """Extract tags dari judul dan spesifikasi"""
        tags = set()
        
        # Add device type
        tags.add(device_type.lower())
        
        # Add brand jika ada
        if specs.get('brand'):
            tags.add(specs['brand'].lower())
        
        # Add keywords dari title
        title_words = re.findall(r'\w+', title.lower())
        common_tags = ['gaming', 'flagship', 'budget', 'premium', 'new', 'latest']
        
        for word in title_words:
            if word in common_tags or len(word) > 3:
                tags.add(word)
        
        return list(tags)[:10]  # Limit to 10 tags
    
    # Handler untuk domain lainnya (stub implementations)
    async def handle_tokopedia(self, soup, url):
        self.logger.info(f"Processing Tokopedia: {url}")
        return await self.generic_handler(soup, url, "Tokopedia")
    
    async def handle_bukalapak(self, soup, url):
        self.logger.info(f"Processing Bukalapak: {url}")
        return await self.generic_handler(soup, url, "Bukalapak")
    
    async def handle_shopee(self, soup, url):
        self.logger.info(f"Processing Shopee: {url}")
        return await self.generic_handler(soup, url, "Shopee")
    
    async def handle_lazada(self, soup, url):
        self.logger.info(f"Processing Lazada: {url}")
        return await self.generic_handler(soup, url, "Lazada")
    
    async def handle_blibli(self, soup, url):
        self.logger.info(f"Processing Blibli: {url}")
        return await self.generic_handler(soup, url, "Blibli")
    
    async def handle_pricebook(self, soup, url):
        self.logger.info(f"Processing Pricebook: {url}")
        return await self.generic_handler(soup, url, "Pricebook")
    
    async def handle_gadgetren(self, soup, url):
        self.logger.info(f"Processing Gadgetren: {url}")
        return await self.news_handler(soup, url, "Gadgetren")
    
    async def handle_gsmarena(self, soup, url):
        self.logger.info(f"Processing GSMArena: {url}")
        return await self.news_handler(soup, url, "GSMArena")
    
    async def handle_techradar(self, soup, url):
        self.logger.info(f"Processing TechRadar: {url}")
        return await self.news_handler(soup, url, "TechRadar")
    
    async def generic_handler(self, soup, url, source):
        """Generic handler untuk e-commerce"""
        title = self.extract_title(soup)
        image = self.extract_image(soup, url)
        content = self.extract_content_generic(soup)
        
        data = {
            'title': title,
            'brand': '',
            'model': '',
            'processor': '',
            'gpu': '',
            'ram': '',
            'storage': '',
            'display': '',
            'battery': '',
            'weight': '',
            'os': '',
            'harga': '',
            'price_value': 0,
            'price_currency': 'IDR',
            'content': content,
            'image': image,
            'device_type': self.determine_device_type(title, {}),
            'specification_json': '{}',
            'tags': '',
            'author': source,
            'release_date': ''
        }
        
        return data
    
    async def news_handler(self, soup, url, source):
        """Handler untuk situs berita/review"""
        title = self.extract_title(soup)
        image = self.extract_image(soup, url)
        content = self.extract_content_news(soup)
        
        data = {
            'title': title,
            'brand': '',
            'model': '',
            'processor': '',
            'gpu': '',
            'ram': '',
            'storage': '',
            'display': '',
            'battery': '',
            'weight': '',
            'os': '',
            'harga': '',
            'price_value': 0,
            'price_currency': 'IDR',
            'content': content,
            'image': image,
            'device_type': 'News',
            'specification_json': '{}',
            'tags': '',
            'author': source,
            'release_date': self.extract_publish_date(soup)
        }
        
        return data
    
    def extract_content_generic(self, soup):
        """Extract content generic"""
        content_selectors = [
            'meta[name="description"]',
            '.product-description',
            '.description',
            '[class*="content"]',
            '[class*="detail"]'
        ]
        
        for selector in content_selectors:
            element = soup.select_one(selector)
            if element:
                if selector.startswith('meta'):
                    content = element.get('content', '')
                else:
                    content = element.get_text(strip=True)
                
                if content and len(content) > 10:
                    return content[:500]
        
        return ""
    
    def extract_content_news(self, soup):
        """Extract content dari artikel berita"""
        content_selectors = [
            'article',
            '.article-content',
            '.post-content',
            '.entry-content',
            '[class*="content"]'
        ]
        
        for selector in content_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text and len(text) > 50:
                    return text[:1000]  # Longer content for news
        
        return self.extract_content_generic(soup)
    
    def extract_publish_date(self, soup):
        """Extract tanggal publish dari artikel"""
        date_selectors = [
            'meta[property="article:published_time"]',
            '.publish-date',
            '.post-date',
            '.date',
            'time'
        ]
        
        for selector in date_selectors:
            element = soup.select_one(selector)
            if element:
                if selector.startswith('meta'):
                    return element.get('content', '')[:10]
                else:
                    return element.get_text(strip=True)[:10]
        
        return ""
    
    async def scrape_url(self, url_id, url):
        """Scrape single URL"""
        try:
            self.stats['processed'] += 1
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url, 
                    timeout=30,
                    headers={'User-Agent': 'Mozilla/5.0 (compatible; TechScopeBot/1.0)'}
                ) as response:
                    
                    if response.status != 200:
                        self.stats['failed'] += 1
                        return None
                    
                    html = await response.text()
            
            soup = BeautifulSoup(html, 'lxml')
            domain = self.get_domain(url)
            
            # Pilih handler berdasarkan domain
            handler = self.domain_handlers.get(domain, self.generic_handler)
            product_data = await handler(soup, url)
            
            if product_data:
                # Add metadata
                product_data.update({
                    'id': url_id,
                    'source_url': url,
                    'crawl_date': datetime.now().isoformat()
                })
                
                self.stats['successful'] += 1
                return product_data
            else:
                self.stats['failed'] += 1
                return None
                
        except Exception as e:
            self.logger.error(f"Error scraping {url}: {e}")
            self.stats['failed'] += 1
            return None
    
    def save_product_data(self, product_data):
        """Save data ke CSV"""
        with open('scraped_data.csv', 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=self.output_fields)
            
            # Ensure all fields are present
            row = {field: product_data.get(field, "") for field in self.output_fields}
            writer.writerow(row)
    
    async def run(self):
        """Main scraper loop"""
        self.logger.info("Starting improved multi-portal scraper...")
        
        self.init_output_file()
        processed_urls = self.get_existing_urls()
        
        # Read input URLs
        try:
            with open('collected_urls.csv', 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                urls = [(row['id'], row['source_url']) for row in reader]
        except FileNotFoundError:
            self.logger.error("collected_urls.csv not found")
            return
        
        self.stats['total'] = len(urls)
        self.logger.info(f"Processing {self.stats['total']} URLs")
        
        # Process URLs
        for i, (url_id, url) in enumerate(urls):
            if url in processed_urls:
                self.stats['skipped'] += 1
                continue
            
            if i % 10 == 0:
                self.logger.info(
                    f"Progress: {i}/{self.stats['total']} - "
                    f"Successful: {self.stats['successful']}, "
                    f"Failed: {self.stats['failed']}"
                )
            
            product_data = await self.scrape_url(url_id, url)
            if product_data:
                self.save_product_data(product_data)
            
            # Delay untuk politeness
            await asyncio.sleep(0.5)
        
        self.logger.info(
            f"Scraping completed. "
            f"Successful: {self.stats['successful']}, "
            f"Failed: {self.stats['failed']}, "
            f"Skipped: {self.stats['skipped']}"
        )