from flask import Flask
import pandas as pd

app = Flask(__name__)

data_url = "https://raw.githubusercontent.com/viavalderrama/data101-project/main/earthquakes%20(1).csv"
data_url2 = "https://raw.githubusercontent.com/viavalderrama/data101-project/main/eruptions%20(1).csv"

@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run(debug=True)
