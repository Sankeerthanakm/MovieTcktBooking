import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='root',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    with connection.cursor() as cursor:
        cursor.execute("CREATE DATABASE IF NOT EXISTS Event_ticket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    connection.commit()
    print("Database `Event_ticket_db` created or already exists.")
finally:
    connection.close()
