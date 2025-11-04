# run_pipeline.py
import asyncio
import subprocess
import sys
from improved_crawler import ImprovedURLCrawler
from improved_scraper import ImprovedMultiPortalScraper
from data_cleaner import DataCleaner
import logging

class PipelineRunner:
    def __init__(self):
        self.setup_logging()
    
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pipeline.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    async def run_crawler(self):
        """Run crawler stage"""
        self.logger.info("Starting crawler stage...")
        crawler = ImprovedURLCrawler()
        await crawler.run()
    
    async def run_scraper(self):
        """Run scraper stage"""
        self.logger.info("Starting scraper stage...")
        scraper = ImprovedMultiPortalScraper()
        await scraper.run()
    
    def run_cleaner(self):
        """Run data cleaning stage"""
        self.logger.info("Starting data cleaning stage...")
        cleaner = DataCleaner()
        
        # Load and clean data
        df = cleaner.load_data('scraped_data.csv')
        if not df.empty:
            cleaned_df = cleaner.clean_dataset(df)
            cleaner.save_cleaned_data(cleaned_df, 'cleaned_tech_data.csv')
            stats = cleaner.generate_stats(cleaned_df)
            self.logger.info("Data cleaning completed successfully")
        else:
            self.logger.error("No data to clean")
    
    async def run_full_pipeline(self):
        """Run complete pipeline"""
        try:
            # Stage 1: Crawling
            await self.run_crawler()
            
            # Stage 2: Scraping
            await self.run_scraper()
            
            # Stage 3: Data Cleaning
            self.run_cleaner()
            
            self.logger.info("Pipeline completed successfully!")
            
        except Exception as e:
            self.logger.error(f"Pipeline failed: {e}")
            raise

# Run pipeline
if __name__ == "__main__":
    runner = PipelineRunner()
    asyncio.run(runner.run_full_pipeline())