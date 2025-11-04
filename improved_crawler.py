# improved_crawler.py
import asyncio
import aiohttp
import aiosqlite
import logging
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse, urljoin
import time
import csv
import signal
import sys
from datetime import datetime, timezone
import re
from bs4 import BeautifulSoup
import config

class ImprovedURLCrawler:
    def __init__(self):
        self.config = config
        self.setup_logging()
        self.setup_signal_handlers()
        
        self.stats = {
            'queued': 0, 'processed': 0, 'saved': 0, 
            'failed': 0, 'robots_denied': 0, 'duplicates': 0
        }
        
        self.domain_counters = {}
        self.url_cache = set()
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('improved_crawler.log', encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_signal_handlers(self):
        def signal_handler(sig, frame):
            self.logger.info("Received shutdown signal. Saving state...")
            asyncio.create_task(self.shutdown())
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def shutdown(self):
        self.logger.info("Shutting down crawler gracefully...")
        if hasattr(self, 'session'):
            await self.session.close()
        if hasattr(self, 'db'):
            await self.db.close()
        sys.exit(0)
    
    async def init_database(self):
        self.db = await aiosqlite.connect('crawler_queue.db')
        await self.db.executescript("""
            CREATE TABLE IF NOT EXISTS crawler_queue (
                url TEXT PRIMARY KEY,
                status TEXT CHECK(status IN ('queued', 'processing', 'completed', 'failed')),
                depth INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS domain_delays (
                domain TEXT PRIMARY KEY,
                last_request TIMESTAMP,
                delay_seconds REAL DEFAULT 1.0
            );
            CREATE TABLE IF NOT EXISTS robots_rules (
                domain TEXT PRIMARY KEY,
                rules TEXT,
                last_fetched TIMESTAMP
            );
        """)
        await self.db.commit()
        await self.load_initial_seeds()
    
    async def load_initial_seeds(self):
        for seed in self.config.SEEDS:
            normalized = self.normalize_url(seed)
            await self.add_url_to_queue(normalized, depth=0)
        self.logger.info(f"Loaded {len(self.config.SEEDS)} seed URLs")
    
    def normalize_url(self, url, base_url=None):
        if base_url:
            url = urljoin(base_url, url)
        
        # Remove fragments and normalize
        url = url.split('#')[0]
        parsed = urlparse(url)
        
        # Normalize scheme and hostname
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        
        # Remove www prefix and trailing slashes
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        
        path = parsed.path.rstrip('/')
        if not path:
            path = '/'
            
        normalized = f"{scheme}://{netloc}{path}"
        if parsed.query:
            normalized += f"?{parsed.query}"
            
        return normalized
    
    def get_domain(self, url):
        parsed = urlparse(url)
        return parsed.netloc.lower().replace('www.', '')
    
    def should_crawl_url(self, url):
        domain = self.get_domain(url)
        
        # Check allowed domains
        if domain not in [d.replace('www.', '') for d in self.config.ALLOWED_DOMAINS]:
            return False
        
        # Check keyword filter
        url_lower = url.lower()
        if any(keyword in url_lower for keyword in self.config.KEYWORD_FILTER):
            return True
            
        return False
    
    async def get_robots_parser(self, domain):
        cursor = await self.db.execute(
            "SELECT rules, last_fetched FROM robots_rules WHERE domain = ?", (domain,)
        )
        result = await cursor.fetchone()
        
        if result and (time.time() - result[1]) < 86400:
            rules_text = result[0]
        else:
            try:
                async with self.session.get(f"https://{domain}/robots.txt") as response:
                    if response.status == 200:
                        rules_text = await response.text()
                    else:
                        rules_text = ""
                
                await self.db.execute(
                    "INSERT OR REPLACE INTO robots_rules (domain, rules, last_fetched) VALUES (?, ?, ?)",
                    (domain, rules_text, time.time())
                )
                await self.db.commit()
            except Exception as e:
                self.logger.warning(f"Could not fetch robots.txt for {domain}: {e}")
                rules_text = ""
        
        parser = RobotFileParser()
        parser.parse(rules_text.splitlines())
        return parser
    
    async def can_fetch(self, url):
        domain = self.get_domain(url)
        parser = await self.get_robots_parser(domain)
        return parser.can_fetch("*", url)
    
    async def add_url_to_queue(self, url, depth=0):
        if url in self.url_cache:
            self.stats['duplicates'] += 1
            return False
            
        try:
            await self.db.execute(
                "INSERT OR IGNORE INTO crawler_queue (url, status, depth) VALUES (?, 'queued', ?)",
                (url, depth)
            )
            await self.db.commit()
            self.url_cache.add(url)
            self.stats['queued'] += 1
            return True
        except Exception as e:
            self.logger.error(f"Error adding URL {url} to queue: {e}")
            return False
    
    async def apply_domain_delay(self, domain):
        cursor = await self.db.execute(
            "SELECT last_request FROM domain_delays WHERE domain = ?", (domain,)
        )
        result = await cursor.fetchone()
        
        if result:
            last_request = result[0]
            elapsed = time.time() - last_request
            if elapsed < self.config.PER_DOMAIN_DELAY:
                await asyncio.sleep(self.config.PER_DOMAIN_DELAY - elapsed)
        
        await self.db.execute(
            "INSERT OR REPLACE INTO domain_delays (domain, last_request) VALUES (?, ?)",
            (domain, time.time())
        )
        await self.db.commit()
    
    async def process_url(self, url, depth):
        try:
            domain = self.get_domain(url)
            
            # Check robots.txt
            if not await self.can_fetch(url):
                self.logger.info(f"Robots.txt denied: {url}")
                self.stats['robots_denied'] += 1
                await self.mark_url_completed(url, 'failed')
                return
            
            # Apply domain delay
            await self.apply_domain_delay(domain)
            
            # Fetch URL with retries
            for retry in range(self.config.MAX_RETRIES):
                try:
                    async with self.session.get(
                        url, 
                        timeout=aiohttp.ClientTimeout(total=self.config.REQUEST_TIMEOUT),
                        headers={'User-Agent': 'Mozilla/5.0 (compatible; TechScopeBot/1.0)'}
                    ) as response:
                        
                        if response.status != 200:
                            continue
                            
                        html = await response.text()
                        break
                except Exception as e:
                    if retry == self.config.MAX_RETRIES - 1:
                        raise e
                    await asyncio.sleep(2 ** retry)
            else:
                return
            
            # Parse and extract links
            soup = BeautifulSoup(html, 'lxml')
            links = set()
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                if href.startswith(('http', '//', '/')):
                    normalized = self.normalize_url(href, url)
                    if self.should_crawl_url(normalized):
                        links.add(normalized)
            
            # Add new links to queue
            for link in links:
                if self.stats['saved'] >= self.config.MAX_URLS:
                    break
                await self.add_url_to_queue(link, depth + 1)
            
            # Save to CSV if it's a product page
            if self.is_product_page(soup, url):
                await self.save_url_to_csv(url)
            
            await self.mark_url_completed(url, 'completed')
            
            if self.stats['processed'] % 100 == 0:
                self.logger.info(f"Progress: {self.stats['processed']} processed, {self.stats['saved']} saved")
                
        except Exception as e:
            self.logger.error(f"Error processing {url}: {e}")
            await self.mark_url_completed(url, 'failed')
            self.stats['failed'] += 1
    
    def is_product_page(self, soup, url):
        """Detect if page is a product page"""
        # Check for common product indicators
        product_indicators = [
            soup.find('meta', property='og:type', content='product'),
            soup.find('div', class_=re.compile(r'product', re.I)),
            soup.find('div', class_=re.compile(r'item', re.I)),
            soup.find('span', class_=re.compile(r'price', re.I)),
            soup.find('button', class_=re.compile(r'buy|cart|beli', re.I)),
        ]
        
        return any(indicator for indicator in product_indicators if indicator)
    
    async def save_url_to_csv(self, url):
        url_id = f"07-{self.stats['saved'] + 1:07d}"
        timestamp = datetime.now(timezone.utc).isoformat()
        
        with open('collected_urls.csv', 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([url_id, url, timestamp])
        
        self.stats['saved'] += 1
    
    async def mark_url_completed(self, url, status):
        await self.db.execute(
            "UPDATE crawler_queue SET status = ? WHERE url = ?", (status, url)
        )
        await self.db.commit()
        self.stats['processed'] += 1
    
    async def get_next_url(self):
        cursor = await self.db.execute(
            "SELECT url, depth FROM crawler_queue WHERE status = 'queued' ORDER BY depth LIMIT 1"
        )
        result = await cursor.fetchone()
        
        if result:
            await self.db.execute(
                "UPDATE crawler_queue SET status = 'processing' WHERE url = ?", (result[0],)
            )
            await self.db.commit()
            return result
        return None
    
    async def run(self):
        self.logger.info("Starting improved URL crawler...")
        
        await self.init_database()
        
        # Initialize CSV file
        with open('collected_urls.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['id', 'source_url', 'found_at'])
        
        # Setup HTTP session
        connector = aiohttp.TCPConnector(limit=self.config.MAX_CONCURRENT_TASKS)
        self.session = aiohttp.ClientSession(connector=connector)
        
        # Main processing loop
        tasks = set()
        while self.stats['saved'] < self.config.MAX_URLS:
            while len(tasks) < self.config.MAX_CONCURRENT_TASKS:
                next_url = await self.get_next_url()
                if not next_url:
                    if not tasks:
                        break
                    await asyncio.sleep(1)
                    continue
                
                url, depth = next_url
                task = asyncio.create_task(self.process_url(url, depth))
                tasks.add(task)
                task.add_done_callback(tasks.discard)
            
            await asyncio.sleep(0.1)
        
        # Cleanup
        await asyncio.gather(*tasks, return_exceptions=True)
        await self.session.close()
        await self.db.close()
        
        self.logger.info(f"Crawling completed. Saved {self.stats['saved']} URLs.")