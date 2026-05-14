from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import or_

db = SQLAlchemy()


class Furniture(db.Model):
    __tablename__ = 'furniture'
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(500), nullable=False)
    type        = db.Column(db.String(100), nullable=False, index=True)
    price       = db.Column(db.Float, index=True)
    width       = db.Column(db.Float)
    length      = db.Column(db.Float)
    height      = db.Column(db.Float)
    materials   = db.Column(db.Text)
    colors      = db.Column(db.Text)
    brand       = db.Column(db.String(200))
    style       = db.Column(db.String(200), index=True)
    image_url   = db.Column(db.Text)
    product_url = db.Column(db.Text, nullable=False)
    is_new      = db.Column(db.Integer, default=0)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    favorites   = db.relationship('Favorite', back_populates='furniture', cascade='all, delete-orphan')

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    favorites     = db.relationship('Favorite', back_populates='user', cascade='all, delete-orphan')


class Favorite(db.Model):
    __tablename__ = 'favorites'
    __table_args__ = (db.UniqueConstraint('user_id', 'furniture_id'),)
    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    furniture_id = db.Column(db.Integer, db.ForeignKey('furniture.id'), nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    user         = db.relationship('User', back_populates='favorites')
    furniture    = db.relationship('Furniture', back_populates='favorites')
