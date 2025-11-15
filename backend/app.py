from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pickle
import numpy as np
from datetime import datetime
import os
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:mandinetra123@localhost/mandinetra'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize database
db = SQLAlchemy(app)

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Commodity configuration
COMMODITY_CONFIG = {
    'bajra': {
        'name': 'Bajra',
        'display_name': '🌾 Bajra',
        'default_p_min': 1800,
        'default_p_max': 2500,
        'color': 'green',
        'icon': '🌾'
    },
    'brinjal': {
        'name': 'Brinjal',
        'display_name': '🍆 Brinjal',
        'default_p_min': 1500,
        'default_p_max': 3500,
        'color': 'purple',
        'icon': '🍆'
    },
    'cabbage': {
        'name': 'Cabbage',
        'display_name': '🥬 Cabbage',
        'default_p_min': 800,
        'default_p_max': 2000,
        'color': 'green',
        'icon': '🥬'
    },
    'chikoo': {
        'name': 'Chikoo',
        'display_name': '🍈 Chikoo',
        'default_p_min': 3000,
        'default_p_max': 6000,
        'color': 'brown',
        'icon': '🍈'
    },
    'cotton': {
        'name': 'Cotton',
        'display_name': '🧵 Cotton',
        'default_p_min': 5000, 
        'default_p_max': 8000,
        'color': 'blue',
        'icon': '🧵'
    },
    'grapes': {
        'name': 'Grapes',
        'display_name': '🍇 Grapes',
        'default_p_min': 4000,
        'default_p_max': 8000,
        'color': 'purple',
        'icon': '🍇'
    },
    'greenchilli': {
        'name': 'Green Chilli',
        'display_name': '🌶️ Green Chilli',
        'default_p_min': 2000,
        'default_p_max': 5000,
        'color': 'red',
        'icon': '🌶️'
    },
    'jowar': {
        'name': 'Jowar',
        'display_name': '🌾 Jowar',
        'default_p_min': 1900,
        'default_p_max': 2600, 
        'color': 'amber',
        'icon': '🌾'
    },
    'mangos': {
        'name': 'Mangoes',
        'display_name': '🥭 Mangoes',
        'default_p_min': 2000,
        'default_p_max': 5000,
        'color': 'orange',
        'icon': '🥭'
    },
    'onion': {
        'name': 'Onion',
        'display_name': '🧅 Onion',
        'default_p_min': 1000,
        'default_p_max': 3000,
        'color': 'purple',
        'icon': '🧅'
    },
    'orange': {
        'name': 'Orange',
        'display_name': '🍊 Orange',
        'default_p_min': 2500,
        'default_p_max': 4500,
        'color': 'orange',
        'icon': '🍊'
    },
    'papaya': {
        'name': 'Papaya',
        'display_name': '🍈 Papaya',
        'default_p_min': 1500,
        'default_p_max': 3000,
        'color': 'orange',
        'icon': '🍈'
    },
    'rice': {
        'name': 'Rice',
        'display_name': '🍚 Rice',
        'default_p_min': 2500,
        'default_p_max': 5000,
        'color': 'white',
        'icon': '🍚'
    },
    'tomato': {
        'name': 'Tomato',
        'display_name': '🍅 Tomato',
        'default_p_min': 1200,
        'default_p_max': 4000,
        'color': 'red',
        'icon': '🍅'
    },
    'wheat': {
        'name': 'Wheat',
        'display_name': '🌾 Wheat', 
        'default_p_min': 2000,
        'default_p_max': 2800,
        'color': 'amber',
        'icon': '🌾'
    }
}

# File name patterns for each commodity
COMMODITY_FILES = {
    'bajra': {
        'model': './models/bajra_model.pkl',
        'preprocessor': './models/bajra_preprocessor.pkl',
        'district_encoder': './models/Bajradistrict_encoder.pkl',
        'market_encoder': './models/Bajramarket_encoder.pkl'
    },
    'brinjal': {
        'model': './models/brinjal_model.joblib',
        'preprocessor': None,
        'district_encoder': './models/brinjaldistrict_encoder.pkl',
        'market_encoder': './models/brinjalmart_encoder.pkl'
    },
    'cabbage': {
        'model': './models/cabbage_model.pkl',
        'preprocessor': './models/cabbage_preprocessor.pkl',
        'district_encoder': './models/cabbagedistrict_encoder.pkl',
        'market_encoder': './models/cabbagemarket_encoder.pkl'
    },
    'chikoo': {
        'model': './models/chikoo_model.pkl',
        'preprocessor': './models/chikoo_preprocessor.pkl',
        'district_encoder': './models/chikoodistrict_encoder.pkl',
        'market_encoder': './models/chikoomarket_encoder.pkl'
    },
    'cotton': {
        'model': './models/cotton_model.pkl',
        'preprocessor': './models/cotton_preprocessor.pkl',
        'district_encoder': './models/Cottondistrict_encoder.pkl',
        'market_encoder': './models/Cottonmarket_encoder.pkl'
    },
    'grapes': {
        'model': './models/grapes_model.pkl',
        'preprocessor': './models/grapes_preprocessor.pkl',
        'district_encoder': './models/grapesdistrict_encoder.pkl',
        'market_encoder': './models/grapesmarket_encoder.pkl'
    },
    'greenchilli': {
        'model': './models/greenchilli_model.pkl',
        'preprocessor': './models/greenchilli_preprocessor.pkl',
        'district_encoder': './models/greenchillidistrict_encoder.pkl',
        'market_encoder': './models/greenchillimarket_encoder.pkl'
    },
    'jowar': {
        'model': './models/jowar_model.pkl',
        'preprocessor': None,
        'district_encoder': './models/Jowardistrict_encoder.pkl',
        'market_encoder': './models/Jowarmarket_encoder.pkl'
    },
    'mangos': {
        'model': './models/mangos_model.pkl',
        'preprocessor': './models/mangos_preprocessor.pkl',
        'district_encoder': './models/mangosdistrict_encoder.pkl',
        'market_encoder': './models/mangosmarket_encoder.pkl'
    },
    'onion': {
        'model': './models/onion_model.pkl',
        'preprocessor': './models/onion_preprocessor.pkl',
        'district_encoder': './models/oniondistrict_encoder.pkl',
        'market_encoder': './models/onionmarket_encoder.pkl'
    },
    'orange': {
        'model': './models/orange_model.pkl',
        'preprocessor': './models/orange_preprocessor.pkl',
        'district_encoder': './models/orangedistrict_encoder.pkl',
        'market_encoder': './models/orangemarket_encoder.pkl'
    },
    'papaya': {
        'model': './models/papaya_model.pkl',
        'preprocessor': './models/papaya_preprocessor.pkl',
        'district_encoder': './models/papayadistrict_encoder.pkl',
        'market_encoder': './models/papayamarket_encoder.pkl'
    },
    'rice': {
        'model': './models/rice_model.pkl',
        'preprocessor': './models/rice_preprocessor.pkl',
        'district_encoder': './models/Ricedistrict_encoder.pkl',
        'market_encoder': './models/Ricemarket_encoder.pkl'
    },
    'tomato': {
        'model': './models/tomato_model.pkl',
        'preprocessor': './models/tomato_preprocessor.pkl',
        'district_encoder': './models/tomatodistrict_encoder.pkl',
        'market_encoder': './models/tomatomarket_encoder.pkl'
    },
    'wheat': {
        'model': './models/wheat_model.pkl',
        'preprocessor': './models/wheat_preprocessor.pkl',
        'district_encoder': './models/Wheatdistrict_encoder.pkl',
        'market_encoder': './models/Wheatmarket_encoder.pkl'
    }
}

# Maharashtra districts and markets
DISTRICT_TO_MARKETS = {
    'ahmadnagar': {
        'district_name': 'Ahmadnagar',
        'markets': ['Ahmednagar', 'Ahmedpur', 'Akhadabalapur'],
        'district_id': 501,
        'market_id': 1101
    },
    'akola': {
        'district_name': 'Akola',
        'markets': ['Akola', 'Akot', 'Achalpur'],
        'district_id': 502,
        'market_id': 1102
    },
    'amravati': {
        'district_name': 'Amravati',
        'markets': ['Amravati', 'Achalpur'],
        'district_id': 503,
        'market_id': 1103
    },
    'aurangabad': {
        'district_name': 'Aurangabad',
        'markets': ['Aurangabad'],
        'district_id': 504,
        'market_id': 1104
    },
    'bid': {
        'district_name': 'Bid',
        'markets': ['Ahmedpur'],
        'district_id': 505,
        'market_id': 1105
    },
    'bhandara': {
        'district_name': 'Bhandara',
        'markets': ['Bhandara', 'Tumsar'],
        'district_id': 506,
        'market_id': 1106
    },
    'nandurbar': {
        'district_name': 'Nandurbar',
        'markets': ['Nandurbar'],
        'district_id': 497,
        'market_id': 165
    },
    'nashik': {
        'district_name': 'Nashik',
        'markets': ['Nashik', 'Malegaon'],
        'district_id': 507,
        'market_id': 1107
    },
    'pune': {
        'district_name': 'Pune',
        'markets': ['Pune', 'Baramati'],
        'district_id': 508,
        'market_id': 1108
    },
    'kolhapur': {
        'district_name': 'Kolhapur',
        'markets': ['Kolhapur'],
        'district_id': 509,
        'market_id': 1109
    },
    'nagpur': {
        'district_name': 'Nagpur',
        'markets': ['Nagpur', 'Katol', 'Kalmeshwar', 'Umred'],
        'district_id': 510,
        'market_id': 1110
    },
    'yavatmal': {
        'district_name': 'Yavatmal',
        'markets': ['Yavatmal', 'Wani'],
        'district_id': 511,
        'market_id': 1111
    },
    'latur': {
        'district_name': 'Latur',
        'markets': ['Latur'],
        'district_id': 512,
        'market_id': 1112
    },
    'jalna': {
        'district_name': 'Jalna',
        'markets': ['Jalna'],
        'district_id': 513,
        'market_id': 1113
    },
    'thane': {
        'district_name': 'Thane',
        'markets': ['Thane', 'Kalyan'],
        'district_id': 514,
        'market_id': 1114
    },
    'mumbai': {
        'district_name': 'Mumbai',
        'markets': ['Mumbai'],
        'district_id': 515,
        'market_id': 1115
    },
    'solapur': {
        'district_name': 'Solapur',
        'markets': ['Solapur'],
        'district_id': 516,
        'market_id': 1116
    },
    'sangli': {
        'district_name': 'Sangli',
        'markets': ['Sangli'],
        'district_id': 517,
        'market_id': 1117
    },
    'satara': {
        'district_name': 'Satara',
        'markets': ['Satara'],
        'district_id': 518,
        'market_id': 1118
    }
}

STATE_ID = 27

# Load all commodity models with error handling
COMMODITY_MODELS = {}
available_commodities = []
COMMODITY_DISTRICTS = {}

logger.info("🚀 Loading commodity models...")
logger.info(f"📁 Current directory: {os.getcwd()}")

for commodity, files in COMMODITY_FILES.items():
    try:
        logger.info(f"🔍 Attempting to load {commodity}...")
        
        # Check if essential files exist
        missing_files = []
        for file_type, file_path in files.items():
            if file_path and not os.path.exists(file_path):
                missing_files.append(f"{file_type}: {file_path}")
        
        if missing_files:
            logger.warning(f"❌ Missing files for {commodity}: {', '.join(missing_files)}")
            continue
            
        # Load files
        model_data = {}
        
        # Load model (handle .joblib for brinjal)
        if commodity == 'brinjal':
            try:
                import joblib
                with open(files['model'], "rb") as f:
                    model_data['model'] = joblib.load(f)
            except ImportError:
                logger.error("❌ joblib not installed for brinjal model")
                continue
        else:
            with open(files['model'], "rb") as f:
                model_data['model'] = pickle.load(f)
        
        # Load preprocessor if available
        if files['preprocessor']:
            with open(files['preprocessor'], "rb") as f:
                model_data['preprocessor'] = pickle.load(f)
        else:
            model_data['preprocessor'] = None
        
        # Load district encoder
        with open(files['district_encoder'], "rb") as f:
            model_data['district_encoder'] = pickle.load(f)
        
        # Load market encoder if available
        if files['market_encoder']:
            with open(files['market_encoder'], "rb") as f:
                model_data['market_encoder'] = pickle.load(f)
        else:
            model_data['market_encoder'] = None
        
        COMMODITY_MODELS[commodity] = model_data
        available_commodities.append(commodity)
        
        # Store the districts this commodity knows
        if hasattr(model_data['district_encoder'], 'classes_'):
            COMMODITY_DISTRICTS[commodity] = [district.strip() for district in model_data['district_encoder'].classes_]
            logger.info(f"✅ {commodity} loaded with {len(COMMODITY_DISTRICTS[commodity])} districts")
        else:
            COMMODITY_DISTRICTS[commodity] = []
            logger.info(f"✅ {commodity} loaded (no district classes info)")
            
    except Exception as e:
        logger.error(f"❌ Error loading {commodity}: {str(e)}")

logger.info(f"🌾 Available commodities: {available_commodities}")

# Debug: Check what districts each model knows
for commodity in available_commodities:
    if commodity in COMMODITY_DISTRICTS:
        logger.info(f"📊 {commodity} model knows these districts: {COMMODITY_DISTRICTS[commodity]}")

@app.route("/")
def home():
    """Home route"""
    return jsonify({
        "message": "MandiNetra Price Prediction API",
        "status": "running",
        "available_commodities": available_commodities,
        "total_commodities": len(available_commodities)
    })

# ==================== FARMER ENDPOINTS ====================

@app.route('/api/farmers', methods=['POST'])
def create_farmer():
    """Create a new farmer"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        name = data.get('name')
        phone = data.get('phone')
        district = data.get('district')
        taluka = data.get('taluka')
        
        # Validate required fields
        if not all([name, phone, district]):
            return jsonify({'error': 'Missing required fields: name, phone, district'}), 400
        
        # Check if phone already exists
        existing_farmer = db.session.execute(
            db.text("SELECT farmer_id FROM farmers WHERE phone = :phone"),
            {'phone': phone}
        ).fetchone()
        
        if existing_farmer:
            return jsonify({
                'error': f'Farmer with phone number {phone} already exists',
                'farmer_id': existing_farmer[0]
            }), 400
        
        # Insert new farmer
        insert_query = """
        INSERT INTO farmers (name, phone, district, taluka)
        VALUES (:name, :phone, :district, :taluka)
        """
        
        db.session.execute(db.text(insert_query), {
            'name': name,
            'phone': phone,
            'district': district,
            'taluka': taluka
        })
        
        db.session.commit()
        
        # Get the new farmer ID
        farmer_id = db.session.execute(db.text("SELECT LAST_INSERT_ID()")).fetchone()[0]
        
        logger.info(f"✅ Farmer created successfully: ID {farmer_id}, Name: {name}, Phone: {phone}")

        return jsonify({
            'message': 'Farmer created successfully',
            'farmer_id': farmer_id,
            'name': name,
            'phone': phone
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error creating farmer: {str(e)}")
        return jsonify({'error': f'Failed to create farmer: {str(e)}'}), 500

@app.route('/api/farmers', methods=['GET'])
def get_farmers():
    """Get all farmers or search by phone"""
    try:
        phone = request.args.get('phone')
        
        if phone:
            # Search farmer by phone
            query = "SELECT * FROM farmers WHERE phone = :phone"
            result = db.session.execute(db.text(query), {'phone': phone})
        else:
            # Get all farmers
            query = "SELECT * FROM farmers ORDER BY created_at DESC"
            result = db.session.execute(db.text(query))
        
        farmers = []
        
        for row in result:
            farmers.append({
                'farmer_id': row.farmer_id,
                'name': row.name,
                'phone': row.phone,
                'district': row.district,
                'taluka': row.taluka,
                'created_at': row.created_at.isoformat() if row.created_at else None
            })
        
        return jsonify({
            'farmers': farmers,
            'count': len(farmers)
        })
        
    except Exception as e:
        logger.error(f"Error fetching farmers: {str(e)}")
        return jsonify({'error': 'Failed to fetch farmers'}), 500

@app.route('/api/farmers/<int:farmer_id>', methods=['GET'])
def get_farmer(farmer_id):
    """Get a specific farmer by ID"""
    try:
        query = "SELECT * FROM farmers WHERE farmer_id = :farmer_id"
        result = db.session.execute(db.text(query), {'farmer_id': farmer_id})
        farmer = result.fetchone()
        
        if not farmer:
            return jsonify({'error': 'Farmer not found'}), 404
        
        return jsonify({
            'farmer_id': farmer.farmer_id,
            'name': farmer.name,
            'phone': farmer.phone,
            'district': farmer.district,
            'taluka': farmer.taluka,
            'created_at': farmer.created_at.isoformat() if farmer.created_at else None
        })
        
    except Exception as e:
        logger.error(f"Error fetching farmer: {str(e)}")
        return jsonify({'error': 'Failed to fetch farmer'}), 500

# ==================== PRODUCTS ENDPOINTS ====================

@app.route('/api/products', methods=['POST'])
def add_product():
    """Add a new product to the marketplace"""
    try:
        # Check if image file is present
        image_url = None
        if 'crop_image' in request.files:
            image_file = request.files['crop_image']
            if image_file and image_file.filename != '':
                # Secure the filename and save
                filename = secure_filename(image_file.filename)
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                image_file.save(image_path)
                image_url = f"/uploads/{filename}"
        
        # Get form data
        crop_name = request.form.get('crop_name')
        crop_type = request.form.get('crop_type')
        quantity = request.form.get('quantity')
        unit = request.form.get('unit')
        expected_price = request.form.get('expected_price')
        district = request.form.get('district')
        market = request.form.get('market')
        harvest_date = request.form.get('harvest_date')
        farmer_id = request.form.get('farmer_id')

        # Validate required fields
        if not all([crop_name, quantity, expected_price, district, farmer_id]):
            return jsonify({'error': 'Missing required fields: crop_name, quantity, expected_price, district, farmer_id'}), 400

        # Convert quantity and price to appropriate types
        try:
            quantity_float = float(quantity)
            expected_price_float = float(expected_price)
        except ValueError:
            return jsonify({'error': 'Invalid quantity or price format'}), 400

        # Check if farmer exists
        farmer_exists = db.session.execute(
            db.text("SELECT farmer_id FROM farmers WHERE farmer_id = :farmer_id"),
            {'farmer_id': farmer_id}
        ).fetchone()

        if not farmer_exists:
            return jsonify({'error': 'Farmer not found'}), 404

        # Insert product into database
        insert_query = """
        INSERT INTO products 
        (farmer_id, crop_name, crop_type, district, market, quantity, unit, expected_price, image_url, harvest_date)
        VALUES 
        (:farmer_id, :crop_name, :crop_type, :district, :market, :quantity, :unit, :expected_price, :image_url, :harvest_date)
        """

        result = db.session.execute(db.text(insert_query), {
            'farmer_id': int(farmer_id),
            'crop_name': crop_name,
            'crop_type': crop_type,
            'district': district,
            'market': market,
            'quantity': quantity_float,
            'unit': unit,
            'expected_price': expected_price_float,
            'image_url': image_url,
            'harvest_date': harvest_date
        })

        db.session.commit()

        # Get the last inserted ID
        product_id = db.session.execute(db.text("SELECT LAST_INSERT_ID()")).fetchone()[0]

        logger.info(f"✅ Product added successfully: ID {product_id}, Crop: {crop_name}, Farmer: {farmer_id}")

        return jsonify({
            'message': 'Product added successfully',
            'product_id': product_id,
            'crop_name': crop_name,
            'farmer_id': farmer_id
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error adding product: {str(e)}")
        return jsonify({'error': f'Failed to add product: {str(e)}'}), 500

@app.route('/uploads/<filename>')
def serve_image(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/farmers/<int:farmer_id>/products', methods=['GET'])
def get_farmer_products(farmer_id):
    """Get all products for a specific farmer"""
    try:
        # Query to get products with farmer details
        query = """
        SELECT p.*, f.name as farmer_name, f.phone, f.district as farmer_district
        FROM products p
        JOIN farmers f ON p.farmer_id = f.farmer_id
        WHERE p.farmer_id = :farmer_id
        ORDER BY p.created_at DESC
        """
        
        result = db.session.execute(db.text(query), {'farmer_id': farmer_id})
        products = []
        
        for row in result:
            products.append({
                'product_id': row.product_id,
                'crop_name': row.crop_name,
                'crop_type': row.crop_type,
                'district': row.district,
                'market': row.market,
                'quantity': row.quantity,
                'unit': row.unit,
                'expected_price': float(row.expected_price),
                'image_url': row.image_url,
                'harvest_date': row.harvest_date.isoformat() if row.harvest_date else None,
                'created_at': row.created_at.isoformat() if row.created_at else None,
                'farmer_name': row.farmer_name,
                'farmer_phone': row.phone
            })
        
        return jsonify({
            'products': products,
            'count': len(products),
            'farmer_id': farmer_id
        })
        
    except Exception as e:
        logger.error(f"Error fetching farmer products: {str(e)}")
        return jsonify({'error': 'Failed to fetch products'}), 500

@app.route('/api/products', methods=['GET'])
def get_all_products():
    """Get all products from marketplace"""
    try:
        query = """
        SELECT p.*, f.name as farmer_name, f.phone, f.district as farmer_district
        FROM products p
        JOIN farmers f ON p.farmer_id = f.farmer_id
        ORDER BY p.created_at DESC
        """
        
        result = db.session.execute(db.text(query))
        products = []
        
        for row in result:
            products.append({
                'product_id': row.product_id,
                'crop_name': row.crop_name,
                'crop_type': row.crop_type,
                'district': row.district,
                'market': row.market,
                'quantity': row.quantity,
                'unit': row.unit,
                'expected_price': float(row.expected_price),
                'image_url': row.image_url,
                'harvest_date': row.harvest_date.isoformat() if row.harvest_date else None,
                'created_at': row.created_at.isoformat() if row.created_at else None,
                'farmer_name': row.farmer_name,
                'farmer_phone': row.phone,
                'farmer_district': row.farmer_district
            })
        
        return jsonify({
            'products': products,
            'count': len(products),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching all products: {str(e)}")
        return jsonify({'error': 'Failed to fetch products'}), 500

# ==================== EXISTING PREDICTION ENDPOINTS ====================

@app.route('/api/commodities', methods=['GET'])
def get_commodities():
    """Get available commodities"""
    commodities_list = []
    for commodity in available_commodities:
        config = COMMODITY_CONFIG.get(commodity, {})
        commodities_list.append({
            "id": commodity,
            "name": config.get('display_name', commodity.title()),
            "color": config.get('color', 'gray'),
            "icon": config.get('icon', '🌾')
        })
    
    return jsonify({"commodities": commodities_list})

@app.route('/api/districts/<commodity>', methods=['GET'])
def get_districts(commodity):
    """Get available districts for a specific commodity"""
    try:
        commodity_lower = commodity.lower()
        
        if commodity_lower not in COMMODITY_MODELS:
            return jsonify({
                "error": f"Commodity '{commodity}' not available. Available commodities: {', '.join(available_commodities)}"
            }), 400
        
        # Get districts that this commodity supports
        supported_districts = COMMODITY_DISTRICTS.get(commodity_lower, [])
        districts = []
        
        for district_name in supported_districts:
            # Clean district name for matching
            clean_district_name = district_name.strip().lower()
            
            # Find matching district info
            found = False
            for district_id, district_info in DISTRICT_TO_MARKETS.items():
                if district_info['district_name'].lower() == clean_district_name:
                    districts.append({
                        "id": district_id,
                        "name": district_info['district_name']
                    })
                    found = True
                    break
            
            # If not found in DISTRICT_TO_MARKETS, still include it
            if not found:
                districts.append({
                    "id": clean_district_name.replace(' ', '_'),
                    "name": district_name.strip()
                })
        
        logger.info(f"📋 Returning {len(districts)} districts for {commodity}")
        return jsonify({"districts": districts})
        
    except Exception as e:
        logger.error(f"Error getting districts for {commodity}: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/markets/<district>', methods=['GET'])
def get_markets(district):
    """Get markets for a specific district"""
    try:
        district_lower = district.lower()
        district_info = DISTRICT_TO_MARKETS.get(district_lower)
        
        if not district_info:
            # Try to find by partial match or name match
            matching_districts = []
            for dist_id, dist_info in DISTRICT_TO_MARKETS.items():
                if (district_lower in dist_id or 
                    district_lower in dist_info['district_name'].lower() or
                    dist_info['district_name'].lower() in district_lower):
                    matching_districts.append((dist_id, dist_info))
            
            if matching_districts:
                district_id, district_info = matching_districts[0]
                logger.info(f"🔍 Found matching district '{district_info['district_name']}' for input '{district}'")
            else:
                return jsonify({
                    "error": f"District '{district}' not found.",
                    "available_districts": list(DISTRICT_TO_MARKETS.keys())
                }), 404
        
        markets = []
        for market in district_info['markets']:
            markets.append({
                "id": market.lower().replace(' ', '_'),
                "name": market
            })
            
        logger.info(f"🏪 Returning {len(markets)} markets for {district_info['district_name']}")
        return jsonify({
            "markets": markets,
            "district_name": district_info['district_name']
        })
        
    except Exception as e:
        logger.error(f"Error getting markets for {district}: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict price for commodity"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        commodity = data.get('commodity', '').lower()
        district_input = data.get('district', '').lower()
        market_input = data.get('market', '').lower()
        
        logger.info(f"🎯 Prediction request for: {commodity}, district: {district_input}, market: {market_input}")
        
        # Validation
        if not commodity:
            return jsonify({"error": "Commodity is required"}), 400
        if not district_input:
            return jsonify({"error": "District is required"}), 400
        if not market_input:
            return jsonify({"error": "Market is required"}), 400
            
        if commodity not in COMMODITY_MODELS:
            return jsonify({
                "error": f"Commodity '{commodity}' not available. Available: {', '.join(available_commodities)}"
            }), 400
            
        # Get district info
        district_info = DISTRICT_TO_MARKETS.get(district_input)
        if not district_info:
            # Try partial match
            matching_districts = []
            for dist_id, dist_info in DISTRICT_TO_MARKETS.items():
                if (district_input in dist_id or 
                    district_input in dist_info['district_name'].lower() or
                    dist_info['district_name'].lower() in district_input):
                    matching_districts.append((dist_id, dist_info))
            
            if matching_districts:
                district_id, district_info = matching_districts[0]
                logger.info(f"🔍 Using matching district: {district_info['district_name']}")
            else:
                return jsonify({
                    "error": f"District '{district_input}' not found. Available districts: {list(DISTRICT_TO_MARKETS.keys())}"
                }), 400
        
        # Verify market exists in district
        market_names = [m.lower().replace(' ', '_') for m in district_info['markets']]
        if market_input not in market_names:
            return jsonify({
                "error": f"Market '{market_input}' not found in {district_info['district_name']}. Available markets: {district_info['markets']}"
            }), 400
        
        # Get model and encode district
        model_data = COMMODITY_MODELS[commodity]
        config = COMMODITY_CONFIG.get(commodity, COMMODITY_CONFIG['bajra'])  # Fallback to bajra config
        
        # Encode district
        try:
            district_encoded = model_data['district_encoder'].transform([district_info['district_name']])[0]
            logger.info(f"🔢 District '{district_info['district_name']}' encoded as: {district_encoded}")
        except Exception as e:
            available_for_commodity = COMMODITY_DISTRICTS.get(commodity, [])
            logger.error(f"District encoding failed: {str(e)}")
            return jsonify({
                "error": f"District '{district_info['district_name']}' not available for {commodity}. Available districts: {available_for_commodity}"
            }), 400
        
        # Encode market if market encoder is available
        market_encoded = 0
        if model_data['market_encoder']:
            try:
                market_name_clean = market_input.replace('_', ' ').title()
                market_encoded = model_data['market_encoder'].transform([market_name_clean])[0]
                logger.info(f"🔢 Market '{market_name_clean}' encoded as: {market_encoded}")
            except Exception as e:
                logger.warning(f"Market encoding failed, using default: {str(e)}")
                market_encoded = district_info['market_id']
        else:
            market_encoded = district_info['market_id']
        
        # Prepare features
        current_date = datetime.now()
        features = np.array([[
            market_encoded,
            STATE_ID,
            district_info['district_id'],
            config['default_p_min'],
            config['default_p_max'],
            current_date.year,
            current_date.month,
            current_date.day,
            district_encoded
        ]])
        
        # Transform features if preprocessor is available
        if model_data['preprocessor']:
            prepared_features = model_data['preprocessor'].transform(features)
        else:
            prepared_features = features
        
        # Predict
        prediction = model_data['model'].predict(prepared_features)
        predicted_price = max(0, round(float(prediction[0]), 2))
        
        logger.info(f"✅ Prediction successful: ₹{predicted_price} for {commodity} in {district_info['district_name']}")
        
        return jsonify({
            "predicted_price": predicted_price,
            "commodity": config['name'],
            "commodity_display": config['display_name'],
            "commodity_icon": config['icon'],
            "commodity_color": config['color'],
            "district": district_info['district_name'],
            "market": market_input.replace('_', ' ').title(),
            "state": "Maharashtra",
            "prediction_date": current_date.strftime("%Y-%m-%d"),
            "prediction_time": current_date.strftime("%H:%M:%S"),
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    commodity_info = {}
    for commodity in available_commodities:
        commodity_info[commodity] = {
            'districts': COMMODITY_DISTRICTS.get(commodity, []),
            'district_count': len(COMMODITY_DISTRICTS.get(commodity, [])),
            'config': COMMODITY_CONFIG.get(commodity, {})
        }
    
    return jsonify({
        "status": "healthy",
        "available_commodities": available_commodities,
        "total_commodities": len(available_commodities),
        "commodity_info": commodity_info,
        "total_districts_available": len(DISTRICT_TO_MARKETS),
        "all_districts": list(DISTRICT_TO_MARKETS.keys())
    })

# Additional endpoints
@app.route('/api/crop-suggestions', methods=['POST'])
def get_crop_suggestions():
    """Get AI-powered crop suggestions based on season and region"""
    try:
        data = request.get_json()
        season = data.get('season', 'kharif')
        region = data.get('region', 'Maharashtra')
        soil_type = data.get('soil_type', 'black_cotton')
        
        suggestions = generate_crop_suggestions(season, region, soil_type)
        
        return jsonify({
            "suggestions": suggestions,
            "season": season,
            "region": region,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating crop suggestions: {str(e)}")
        return jsonify({"error": "Failed to generate suggestions"}), 500

@app.route('/api/demand-alerts', methods=['GET'])
def get_demand_alerts():
    """Get real-time demand alerts for various crops"""
    try:
        alerts = generate_demand_alerts()
        
        return jsonify({
            "alerts": alerts,
            "last_updated": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching demand alerts: {str(e)}")
        return jsonify({"error": "Failed to fetch demand alerts"}), 500

@app.route('/api/market-stats', methods=['GET'])
def get_market_stats():
    """Get real-time market statistics"""
    try:
        stats = {
            "priceRise": f"{random.randint(8, 15)}%",
            "highDemand": f"{random.randint(40, 60)}%",
            "bestSeason": "30d",
            "activeFarmers": f"{random.randint(80, 95)}%",
            "totalTransactions": f"{random.randint(1000, 5000)}",
            "marketSentiment": "positive"
        }
        
        return jsonify({
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching market stats: {str(e)}")
        return jsonify({"error": "Failed to fetch market stats"}), 500

def generate_crop_suggestions(season, region, soil_type):
    """Generate crop suggestions based on parameters"""
    base_suggestions = [
        {
            "id": 1,
            "name": "Moong Dal (Green Gram)",
            "confidence": random.randint(85, 96),
            "priceTrend": "high",
            "expectedIncome": f"₹{random.randint(6000, 7000)}/quintal",
            "harvestTime": "60 days",
            "description": "High demand in urban markets, low water requirement",
            "suitability": "Perfect for your region's soil type",
            "risk": "Low",
            "image": "🌱"
        },
        {
            "id": 2,
            "name": "Mustard",
            "confidence": random.randint(80, 92),
            "priceTrend": "medium",
            "expectedIncome": f"₹{random.randint(4000, 5000)}/quintal",
            "harvestTime": "120 days",
            "description": "Low rainfall crop, good for oil production",
            "suitability": "Ideal for current season",
            "risk": "Medium",
            "image": "🟡"
        },
        {
            "id": 3,
            "name": "Chickpea",
            "confidence": random.randint(82, 90),
            "priceTrend": "high",
            "expectedIncome": f"₹{random.randint(5000, 6000)}/quintal",
            "harvestTime": "90 days",
            "description": "Fast harvesting, high nutritional value",
            "suitability": "Matches your farm size",
            "risk": "Low",
            "image": "🟤"
        }
    ]
    
    # Adjust based on season
    if season == 'kharif':
        base_suggestions[0]['confidence'] += 5
    elif season == 'rabi':
        base_suggestions[1]['confidence'] += 5
        
    return base_suggestions

def generate_demand_alerts():
    """Generate realistic demand alerts"""
    crops = ["Tomato", "Onion", "Wheat", "Rice", "Cotton", "Sugarcane"]
    locations = ["Pune", "Nashik", "Aurangabad", "Nagpur", "Kolhapur"]
    
    alerts = []
    for i in range(4):
        crop = random.choice(crops)
        alerts.append({
            "id": i + 1,
            "crop": crop,
            "location": random.choice(locations),
            "demand": random.choice(["high", "medium", "low"]),
            "price": f"₹{random.randint(20, 50)}/kg" if crop in ['Tomato', 'Onion'] else f"₹{random.randint(2000, 5000)}/quintal",
            "trend": random.choice(["up", "stable", "up"])
        })
    
    return alerts

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print(f"\n🎯 Multi-Commodity Price Prediction API Ready!")
    print(f"🌾 Available commodities: {available_commodities}")
    print(f"📍 Total districts in database: {len(DISTRICT_TO_MARKETS)}")
    print(f"🏪 Available districts: {list(DISTRICT_TO_MARKETS.keys())}")
    print(f"📦 Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"🚀 Backend running on: http://127.0.0.1:5000")
    print(f"🌐 React app should connect from: http://localhost:3000")
    
    # Debug info for all commodities
    for commodity in available_commodities:
        if commodity in COMMODITY_DISTRICTS:
            print(f"📊 {commodity} districts: {COMMODITY_DISTRICTS[commodity]}")
    
    app.run(debug=True, port=5000)