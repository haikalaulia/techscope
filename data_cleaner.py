# data_cleaner.py
import pandas as pd
import numpy as np
import re
import json
from datetime import datetime
import logging

class DataCleaner:
    def __init__(self):
        self.setup_logging()
    
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def load_data(self, filepath):
        """Load data dari CSV"""
        try:
            df = pd.read_csv(filepath)
            self.logger.info(f"Loaded {len(df)} records from {filepath}")
            return df
        except Exception as e:
            self.logger.error(f"Error loading data: {e}")
            return pd.DataFrame()
    
    def clean_text(self, text):
        """Clean text data"""
        if pd.isna(text):
            return ""
        
        text = str(text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:-]', '', text)
        return text.strip()
    
    def extract_brand_from_title(self, title):
        """Extract brand dari title jika kosong"""
        if pd.isna(title):
            return ""
        
        common_brands = [
            'samsung', 'apple', 'xiaomi', 'oppo', 'vivo', 'realme',
            'asus', 'lenovo', 'dell', 'hp', 'acer', 'msi', 'lg',
            'sony', 'nokia', 'oneplus', 'google', 'huawei'
        ]
        
        title_lower = title.lower()
        for brand in common_brands:
            if brand in title_lower:
                return brand.title()
        
        return ""
    
    def normalize_ram(self, ram_text):
        """Normalize RAM value"""
        if pd.isna(ram_text):
            return ""
        
        ram_text = str(ram_text).lower()
        
        # Extract numeric value
        ram_match = re.search(r'(\d+)\s*(?:gb|g)', ram_text)
        if ram_match:
            return f"{ram_match.group(1)} GB"
        
        return ram_text
    
    def normalize_storage(self, storage_text):
        """Normalize storage value"""
        if pd.isna(storage_text):
            return ""
        
        storage_text = str(storage_text).lower()
        
        # Extract numeric value
        storage_match = re.search(r'(\d+)\s*(?:gb|g|tb)', storage_text)
        if storage_match:
            if 'tb' in storage_text:
                return f"{storage_match.group(1)} TB"
            else:
                return f"{storage_match.group(1)} GB"
        
        return storage_text
    
    def extract_device_features(self, row):
        """Extract features dari content dan specifications"""
        features = []
        
        # Check content
        content = str(row.get('content', '')).lower()
        specs = str(row.get('specification_json', '')).lower()
        
        # Gaming features
        gaming_indicators = ['gaming', 'game', 'rgb', 'rtx', 'gtx']
        if any(indicator in content or indicator in specs for indicator in gaming_indicators):
            features.append('gaming')
        
        # Business features
        business_indicators = ['business', 'enterprise', 'office', 'professional']
        if any(indicator in content or indicator in specs for indicator in business_indicators):
            features.append('business')
        
        # Budget features
        budget_indicators = ['budget', 'murah', 'harga terjangkau', 'value']
        if any(indicator in content or indicator in specs for indicator in budget_indicators):
            features.append('budget')
        
        return features
    
    def clean_dataset(self, df):
        """Clean entire dataset"""
        self.logger.info("Starting data cleaning...")
        
        # Remove duplicates
        initial_count = len(df)
        df = df.drop_duplicates(subset=['source_url'])
        self.logger.info(f"Removed {initial_count - len(df)} duplicates")
        
        # Clean text fields
        text_columns = ['title', 'brand', 'model', 'content', 'tags']
        for col in text_columns:
            if col in df.columns:
                df[col] = df[col].apply(self.clean_text)
        
        # Fill missing brands
        mask = (df['brand'].isna()) | (df['brand'] == '')
        df.loc[mask, 'brand'] = df.loc[mask, 'title'].apply(self.extract_brand_from_title)
        
        # Normalize RAM and Storage
        if 'ram' in df.columns:
            df['ram'] = df['ram'].apply(self.normalize_ram)
        
        if 'storage' in df.columns:
            df['storage'] = df['storage'].apply(self.normalize_storage)
        
        # Extract features
        df['features'] = df.apply(self.extract_device_features, axis=1)
        
        # Clean price values
        if 'price_value' in df.columns:
            df['price_value'] = pd.to_numeric(df['price_value'], errors='coerce')
            df['price_value'] = df['price_value'].fillna(0)
        
        # Validate device types
        valid_device_types = ['Laptop', 'Handphone', 'Tablet', 'News', 'Other']
        mask = ~df['device_type'].isin(valid_device_types)
        df.loc[mask, 'device_type'] = 'Other'
        
        self.logger.info(f"Data cleaning completed. Final records: {len(df)}")
        return df
    
    def save_cleaned_data(self, df, output_path):
        """Save cleaned data"""
        df.to_csv(output_path, index=False, encoding='utf-8')
        self.logger.info(f"Cleaned data saved to {output_path}")
    
    def generate_stats(self, df):
        """Generate statistics tentang dataset"""
        stats = {
            'total_records': len(df),
            'device_types': df['device_type'].value_counts().to_dict(),
            'top_brands': df['brand'].value_counts().head(10).to_dict(),
            'price_range': {
                'min': df['price_value'].min(),
                'max': df['price_value'].max(),
                'mean': df['price_value'].mean()
            },
            'records_with_images': (df['image'] != '').sum(),
            'records_with_content': (df['content'] != '').sum()
        }
        
        self.logger.info("Dataset Statistics:")
        for key, value in stats.items():
            self.logger.info(f"{key}: {value}")
        
        return stats

# Contoh penggunaan
def main():
    cleaner = DataCleaner()
    
    # Load data
    df = cleaner.load_data('scraped_data.csv')
    
    if not df.empty:
        # Clean data
        cleaned_df = cleaner.clean_dataset(df)
        
        # Save cleaned data
        cleaner.save_cleaned_data(cleaned_df, 'cleaned_tech_data.csv')
        
        # Generate statistics
        stats = cleaner.generate_stats(cleaned_df)
        
        # Save statistics
        with open('dataset_stats.json', 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()