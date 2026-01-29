"""
==============================================================================
REMA Backend - Property Model
==============================================================================

WHAT IT DOES:
    SQLAlchemy ORM model for the property_listing table.
    Represents real estate properties in Jordan.

HOW IT WORKS:
    Maps to the existing `property_listing` PostgreSQL table.
    Provides methods for converting to dict and handling image generation.

KEY FIELDS:
    - id: Primary key (auto-increment)
    - type: Property type (apartment, villa, etc.)
    - city: City name (Amman, Irbid, etc.)
    - neighborhood: Neighborhood within city
    - surface_area: Size in square meters
    - bedroom: Number of bedrooms or 'studio'
    - bathroom: Number of bathrooms
    - furnishing: Furnishing status
    - floor: Floor description
    - price_clean: Listed price in JOD
    - listing: 'rent' or 'sale'

METHODS:
    - to_dict(): Convert model to dictionary for JSON response
    - get_images(): Generate type-specific placeholder images

DATABASE TABLE:
    property_listing (existing table, not managed by Alembic)

==============================================================================
"""

from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.ext.hybrid import hybrid_property
from app.database import Base
import random
import hashlib


                             
                                                           
PROPERTY_IMAGES = {
    "apartment": [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    ],
    "town house": [
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
        "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
    ],
    "villas and palaces": [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
        "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800",
    ],
    "whole building": [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800",
        "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
        "https://media.licdn.com/dms/image/v2/C4D1BAQGnU-dgmVR5EA/company-background_10000/company-background_10000/0/1626274278022/al_hussein_technical_university_htu_cover?e=2147483647&v=beta&t=PJLW_qKVlj3jRdfKtxU9PGNugYPNX8GBffEeit3Ktfk"
    ],
    "farms and chalets": [
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
        "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800",
    ],
}

                                  
DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
]


class Property(Base):
    """
    SQLAlchemy model for property listings.
    Maps to the existing 'property_listing' table in PostgreSQL.
    """
    
    __tablename__ = "property_listing"
    
                 
    id = Column(Integer, primary_key=True, index=True)
    
                      
    type = Column(String(100), nullable=True)
    furnishing = Column(String(100), nullable=True)
    surface_area = Column(Float, nullable=True)
    bedroom = Column(String(50), nullable=True)
    bathroom = Column(Float, nullable=True)
    floor = Column(String(50), nullable=True)
    
           
    price_clean = Column(Float, nullable=True)
    
              
    city = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    
                  
    listing = Column(Text, nullable=True)
    
                                         
    predicted_price = Column(Float, nullable=True)
    valuation = Column(String(20), nullable=True)                                       
    valuation_percentage = Column(Float, nullable=True)                                     
    
    def get_images(self) -> list:
        """
        Generate consistent, type-specific images for this property.
        Uses property ID as seed for consistent randomization.
        
        Returns:
            list: List of 3-5 image URLs appropriate for property type
        """
                                                  
        prop_type = (self.type or "").lower().strip()
        
                                           
        images = PROPERTY_IMAGES.get(prop_type, DEFAULT_IMAGES)
        
                                                              
        seed = int(hashlib.md5(str(self.id).encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)
        
                                                          
        num_images = rng.randint(3, min(5, len(images)))
        selected = rng.sample(images, num_images)
        
        return selected
    
    def to_dict(self) -> dict:
        """
        Convert property to dictionary for JSON serialization.
        
        Returns:
            dict: Property data with all fields and generated images
        """
        return {
            "id": self.id,
            "type": self.type,
            "furnishing": self.furnishing,
            "surface_area": self.surface_area,
            "bedroom": self.bedroom,
            "bathroom": int(self.bathroom) if self.bathroom else None,
            "floor": self.floor,
            "price": int(self.price_clean) if self.price_clean else None,
            "city": self.city,
            "neighborhood": self.neighborhood,
            "listing": self.listing,
            "images": self.get_images(),
                                                             
            "predicted_price": int(self.predicted_price) if self.predicted_price else None,
            "valuation": self.valuation,
            "valuation_percentage": round(self.valuation_percentage, 1) if self.valuation_percentage else None,
        }
    
    def __repr__(self):
        return f"<Property(id={self.id}, {self.neighborhood}, {self.city})>"
