"""Seed the database with sample data for development."""
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nxtecom.settings")
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from products.models import Category, Product
from django.utils.text import slugify

User = get_user_model()


def seed():
    # Create admin
    if not User.objects.filter(username="admin").exists():
        admin = User.objects.create_superuser(
            username="admin", email="admin@nxtecom.com", password="admin1234",
            first_name="Admin", last_name="User", role="admin",
        )
        print(f"Created admin: {admin.username}")

    # Create demo customer
    if not User.objects.filter(username="customer1").exists():
        customer = User(
            username="customer1", email="customer@nxtecom.com",
            first_name="John", last_name="Doe", role="customer", phone="+256700000001",
        )
        customer.set_password("customer1234")
        customer.save()
        from accounts.models import CustomerProfile
        CustomerProfile.objects.get_or_create(user=customer, defaults={"city": "Kampala", "region": "Central"})
        print(f"Created customer: {customer.username}")

    # Create demo retailer
    if not User.objects.filter(username="retailer1").exists():
        retailer = User(
            username="retailer1", email="retailer@nxtecom.com",
            first_name="Jane", last_name="Shop", role="retailer", phone="+256700000002",
        )
        retailer.set_password("retailer1234")
        retailer.save()
        from accounts.models import RetailerProfile
        RetailerProfile.objects.get_or_create(
            user=retailer,
            defaults={"shop_name": "Jane's Shop", "city": "Kampala", "region": "Central", "is_online": True},
        )
        print(f"Created retailer: {retailer.username}")

    # Create categories
    categories_data = [
        ("Electronics", "Electronics and gadgets"),
        ("Food & Beverages", "Food items and drinks"),
        ("Clothing", "Apparel and fashion"),
        ("Home & Kitchen", "Household items"),
        ("Health & Beauty", "Personal care products"),
        ("Agriculture", "Farm products and supplies"),
    ]
    categories = {}
    for name, desc in categories_data:
        cat, _ = Category.objects.get_or_create(
            slug=slugify(name),
            defaults={"name": name, "description": desc},
        )
        categories[name] = cat

    # Create products
    products_data = [
        ("Samsung Galaxy A15", "electronics", "Latest Samsung smartphone with 6.5 inch display", 850000, "SAM-A15-001", "piece"),
        ("Nokia 105", "electronics", "Reliable basic phone with long battery life", 65000, "NOK-105-001", "piece"),
        ("USB-C Charger", "electronics", "Fast charging USB-C adapter", 25000, "USB-C-001", "piece"),
        ("Wireless Earbuds", "electronics", "Bluetooth 5.0 wireless earbuds", 45000, "EAR-BT-001", "piece"),
        ("Rolex (Ugandan)", "food-beverages", "Traditional Ugandan street food - chapati with eggs", 5000, "FD-ROL-001", "piece"),
        ("Nile Special Beer", "food-beverages", "Premium Ugandan lager beer 500ml", 5000, "FD-NIL-001", "bottle"),
        ("Mukwano Cooking Oil 5L", "food-beverages", "Premium cooking oil for everyday use", 32000, "FD-MUK-001", "piece"),
        ("Riham Sugar 1kg", "food-beverages", "Pure white sugar", 5500, "FD-SUG-001", "kg"),
        ("Maize Flour 2kg", "food-beverages", "Fine maize flour for posho", 7500, "FD-MAZ-001", "kg"),
        ("Gomesi Dress", "clothing", "Traditional Ugandan dress for women", 150000, "CL-GOM-001", "piece"),
        ("Kanzu Robe", "clothing", "Traditional Ugandan men's robe", 120000, "CL-KAN-001", "piece"),
        ("Cotton T-Shirt", "clothing", "Comfortable cotton t-shirt", 25000, "CL-TSH-001", "piece"),
        ("Jeans Trouser", "clothing", "Classic blue jeans", 55000, "CL-JNS-001", "piece"),
        ("Cooking Pot Set", "home-kitchen", "3-piece stainless steel pot set", 85000, "HK-POT-001", "set"),
        ("Solar Lamp", "home-kitchen", "Rechargeable solar powered lamp", 35000, "HK-SOL-001", "piece"),
        ("Mosquito Net", "home-kitchen", "Treated mosquito net for double bed", 18000, "HK-NET-001", "piece"),
        ("Herbal Soap", "health-beauty", "Natural herbal body soap", 8000, "HB-SOP-001", "piece"),
        ("Shea Butter 250g", "health-beauty", "Pure shea butter for skin care", 15000, "HB-SHE-001", "jar"),
        ("Coffee Beans 1kg", "agriculture", "Premium Ugandan Arabica coffee beans", 25000, "AG-COF-001", "kg"),
        ("Vanilla Pods 100g", "agriculture", "High quality Ugandan vanilla", 45000, "AG-VAN-001", "pack"),
    ]

    cat_map = {
        "electronics": categories.get("Electronics"),
        "food-beverages": categories.get("Food & Beverages"),
        "clothing": categories.get("Clothing"),
        "home-kitchen": categories.get("Home & Kitchen"),
        "health-beauty": categories.get("Health & Beauty"),
        "agriculture": categories.get("Agriculture"),
    }

    for name, cat_key, desc, price, sku, unit in products_data:
        Product.objects.get_or_create(
            sku=sku,
            defaults={
                "name": name,
                "slug": slugify(name),
                "description": desc,
                "base_price": price,
                "category": cat_map.get(cat_key),
                "unit": unit,
                "is_active": True,
            },
        )

    print(f"Seeded {Product.objects.count()} products in {Category.objects.count()} categories")
    print("Done! Demo accounts:")
    print("  Admin: admin / admin1234")
    print("  Customer: customer1 / customer1234")
    print("  Retailer: retailer1 / retailer1234")


if __name__ == "__main__":
    seed()
