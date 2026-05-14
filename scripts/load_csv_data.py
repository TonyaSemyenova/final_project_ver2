import sys
import os
import pandas as pd
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from database import Database

def load_csv_data(csv_path='divany.csv'):
    """Загрузка данных из CSV файла в базу данных"""
    
    if not os.path.exists(csv_path):
        print(f"Ошибка: файл {csv_path} не найден")
        return
    
    db = Database()
    
    try:
        df = pd.read_csv(csv_path, encoding='utf-8')
        print(f"Загружено {len(df)} записей из CSV")
        
        # id,название,тип,цена,ширина,длина,высота,материалы,цвета,новое,бренд,url_товара,url_картинки,стиль
        
        added = 0
        for _, row in df.iterrows():
            try:
                data = {
                    'name': row['название'],
                    'type': row['тип'],
                    'price': float(row['цена']) if pd.notna(row['цена']) else None,
                    'width': float(row['ширина']) if pd.notna(row['ширина']) else None,
                    'length': float(row['длина']) if pd.notna(row['длина']) else None,
                    'height': float(row['высота']) if pd.notna(row['высота']) else None,
                    'materials': row['материалы'] if pd.notna(row['материалы']) else None,
                    'colors': row['цвета'] if pd.notna(row['цвета']) else None,
                    'brand': row['бренд'] if pd.notna(row['бренд']) else None,
                    'style': row['стиль'] if pd.notna(row['стиль']) else None,
                    'image_url': row['url_картинки'] if pd.notna(row['url_картинки']) else None,
                    'product_url': row['url_товара'] if pd.notna(row['url_товара']) else 'https://market.yandex.ru',
                    'is_new': 1 if pd.notna(row['новое']) and row['новое'] else 0
                }
                
                db.add_furniture(data)
                added += 1
                
                if added % 100 == 0:
                    print(f"Добавлено {added} товаров...")
            
            except Exception as e:
                print(f"Ошибка добавления товара: {e}")
                continue
        
        print(f"\n✓ Успешно загружено {added} товаров из {len(df)}")
    
    except Exception as e:
        print(f"✗ Ошибка загрузки CSV: {e}")

if __name__ == '__main__':
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'divany.csv'
    load_csv_data(csv_file)
