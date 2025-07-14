from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from haversine import haversine
import numpy as np
from sklearn.cluster import KMeans
import pandas as pd

from flask_cors import CORS



AVERAGE_SPEED_KMPH = 30

# Load environment variables
load_dotenv()

print("Loaded MONGO_URI:", os.getenv("MONGO_URI"))

app = Flask(__name__)
CORS(app)

# MongoDB config
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

def get_db():
    return mongo.db

@app.route('/orders', methods=['POST'])
def place_order():
    data = request.get_json()
    required_fields = ['customer_id', 'items', 'lat', 'lon']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    order = {
        'customer_id': data['customer_id'],
        'items': data['items'],  # Expecting a list of {item, qty}
        'lat': data['lat'],
        'lon': data['lon'],
        'status': 'pending',
        'created_at': datetime.utcnow(),
        'dispatch_time': None,  # To be set after routing
        'assigned_wh': None,    # To be set after routing
        'eta': None            # To be set after routing
    }
    db = get_db()
    result = db.orders.insert_one(order)
    order_id = str(result.inserted_id)
    return jsonify({'message': 'Order placed', 'order_id': order_id}), 201

@app.route('/orders/<customer_id>', methods=['GET'])
def list_orders(customer_id):
    db = get_db()
    orders = list(db.orders.find({'customer_id': customer_id}))
    for order in orders:
        order['_id'] = str(order['_id'])
        order['created_at'] = order['created_at'].isoformat() if 'created_at' in order else None
        if order.get('dispatch_time'):
            order['dispatch_time'] = order['dispatch_time'].isoformat()
    return jsonify({'orders': orders})

@app.route('/orders/<order_id>', methods=['PUT'])
def edit_order(order_id):
    db = get_db()
    order = db.orders.find_one({'_id': ObjectId(order_id)})
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Check if dispatch_time is set and within 30 minutes
    now = datetime.utcnow()
    if order.get('dispatch_time'):
        dispatch_time = order['dispatch_time']
        if isinstance(dispatch_time, str):
            dispatch_time = datetime.fromisoformat(dispatch_time)
        if dispatch_time - now <= timedelta(minutes=30):
            return jsonify({'error': 'Order cannot be edited within 30 minutes of dispatch'}), 403

    # Update allowed fields
    data = request.get_json()
    update_fields = {}
    for field in ['items', 'lat', 'lon']:
        if field in data:
            update_fields[field] = data[field]
    if not update_fields:
        return jsonify({'error': 'No editable fields provided'}), 400

    db.orders.update_one({'_id': ObjectId(order_id)}, {'$set': update_fields})
    return jsonify({'message': 'Order updated successfully'})

@app.route('/route', methods=['POST'])
def route_orders():
    db = get_db()
    data = request.get_json()
    order_ids = data.get('order_ids')
    if not order_ids or not isinstance(order_ids, list):
        return jsonify({'error': 'order_ids (list) required'}), 400

    # Load orders from MongoDB
    orders = list(db.orders.find({'_id': {'$in': [ObjectId(oid) for oid in order_ids]}}))
    if not orders:
        return jsonify({'error': 'No orders found'}), 404

    # Load warehouses and inventory from CSV files
    warehouses_df = pd.read_csv('warehouses.csv')
    inventory_df = pd.read_csv('inventory.csv')

    # Prepare warehouse list
    wh_df = [
        {
            'wh_id': row['wh_id'],
            'lat': row['lat'],
            'lon': row['lon']
        }
        for _, row in warehouses_df.iterrows()
    ]

    inventory = [
        {
            'wh_id': row['wh_id'],
            'item': row['item'],
            'stock': row['stock']
        }
        for _, row in inventory_df.iterrows()
    ]

    routes = []
    dispatch_time = (datetime.utcnow() + timedelta(hours=2)).isoformat()

    def get_closest_wh_with_stock(order_items, order_latlon):
        sorted_wh = sorted(wh_df, key=lambda wh: haversine(order_latlon, (wh['lat'], wh['lon'])))
        for wh in sorted_wh:
            wh_id = wh['wh_id']
            has_all_items = True
            for item in order_items:
                stock_row = next((inv for inv in inventory if inv['wh_id'] == wh_id and inv['item'] == item['item']), None)
                if not stock_row or stock_row['stock'] < item['qty']:
                    has_all_items = False
                    break
            if has_all_items:
                return wh
        return None

    for order in orders:
        order_latlon = (order['lat'], order['lon'])
        order_items = order['items']
        assigned_wh = get_closest_wh_with_stock(order_items, order_latlon)
        if assigned_wh is None:
            result = {
                'order_id': str(order['_id']),
                'assigned_wh': None,
                'status': 'out_of_stock',
                'message': 'No warehouse has all required items'
            }
        else:
            dist_km = haversine(order_latlon, (assigned_wh['lat'], assigned_wh['lon']))
            eta_minutes = round((dist_km / AVERAGE_SPEED_KMPH) * 60)
            # Update order in DB
            db.orders.update_one({'_id': order['_id']}, {'$set': {
                'assigned_wh': assigned_wh['wh_id'],
                'dispatch_time': dispatch_time,
                'eta': f'{eta_minutes} mins',
                'status': 'scheduled'
            }})
            result = {
                'order_id': str(order['_id']),
                'assigned_wh': assigned_wh['wh_id'],
                'dispatch_time': dispatch_time,
                'eta': f'{eta_minutes} mins',
                'status': 'scheduled',
                'warehouse_coords': {'lat': assigned_wh['lat'], 'lon': assigned_wh['lon']},
                'customer_coords': {'lat': order['lat'], 'lon': order['lon']},
                'route': [
                    {'lat': assigned_wh['lat'], 'lon': assigned_wh['lon']},
                    {'lat': order['lat'], 'lon': order['lon']}
                ]
            }
        routes.append(result)

    return jsonify({'routes': routes})

@app.route('/warehouses', methods=['GET'])
def get_warehouses():
    import pandas as pd
    try:
        warehouses_df = pd.read_csv('warehouses.csv')
        warehouses = warehouses_df[['wh_id', 'lat', 'lon']].to_dict(orient='records')
        return jsonify({'warehouses': warehouses})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Try to list collections as a simple DB check
        db = get_db()
        db.list_collection_names()
        return jsonify({'status': 'ok', 'db': 'connected'})
    except Exception as e:
        return jsonify({'status': 'error', 'db': 'not connected', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 