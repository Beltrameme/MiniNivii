from Database import load_csv

if __name__ == "__main__":
    load_csv('../data/data.csv')
    print(f"Data imported successfully into database.db")