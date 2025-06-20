from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/home')
def home():
    return render_template('home.html')

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', '').lower() in ('1', 'true', 'yes')
    app.run(debug=debug_mode)
