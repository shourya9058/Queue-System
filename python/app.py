from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

DATA_FILE = 'queue.json'

def read_queue():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_queue(queue):
    with open(DATA_FILE, 'w') as f:
        json.dump(queue, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/book', methods=['POST'])
def book_slot():
    data = request.json
    queue = read_queue()
    
    booking = {
        'id': len(queue) + 1,
        'service_type': data['serviceType'],
        'date': data['date'],
        'time': data['time'],
        'customer_name': data['name'],
        'status': 'waiting'
    }
    
    queue.append(booking)
    save_queue(queue)
    return jsonify({'message': 'Booking successful'})

@app.route('/queue')
def get_queue():
    queue = read_queue()
    return jsonify([{
        'name': item['customer_name'],
        'serviceType': item['service_type'],
        'time': item['time']
    } for item in queue if item['status'] == 'waiting'])

@app.route('/next', methods=['POST'])
def next_customer():
    queue = read_queue()
    next_cust = next((item for item in queue if item['status'] == 'waiting'), None)
    
    if next_cust:
        next_cust['status'] = 'called'
        save_queue(queue)
        announcement = f"Next customer: {next_cust['customer_name']}, please proceed to {next_cust['service_type']} counter"
        return jsonify({
            'message': announcement,
            'serviceType': next_cust['service_type']
        })
    
    return jsonify({'message': 'No more customers in queue'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)