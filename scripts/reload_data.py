import sqlite3, csv, os, sys

DB = os.path.join(os.path.dirname(__file__), '..', 'furniture.db')
CSV = os.path.join(os.path.dirname(__file__), '..', 'divany.csv')

if not os.path.exists(CSV):
    print('Файл divany.csv не найден'); sys.exit(1)

conn = sqlite3.connect(DB)
c = conn.cursor()
c.execute('DELETE FROM furniture')
c.execute("DELETE FROM sqlite_sequence WHERE name='furniture'")
conn.commit()
print('Таблица очищена')

added = errors = 0
with open(CSV, encoding='utf-8') as f:
    for row in csv.DictReader(f):
        try:
            def v(key): return row.get(key, '').strip() or None
            def fv(key):
                val = v(key)
                return float(val) if val and val != 'None' else None

            c.execute("""
                INSERT INTO furniture
                (name, type, price, width, length, height,
                 materials, colors, brand, style, image_url, product_url, is_new)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                v('название'), (v('тип') or '').lower(),
                fv('цена'), fv('ширина'), fv('длина'), fv('высота'),
                v('материалы'), v('цвета'), v('бренд'), v('стиль'),
                v('url_картинки'),
                v('url_товара') or 'https://market.yandex.ru',
                1 if v('новое') in ('1','True','true','да') else 0
            ))
            added += 1
        except Exception as e:
            errors += 1
            print(f'  Ошибка: {e}')

conn.commit()
conn.close()
print(f'Загружено: {added}, ошибок: {errors}')
