"""Seed the database with sample data for development."""
import os
import sys
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nxtecom.settings")
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from products.models import Category, Product, Inventory
from accounts.models import (
    CompanyProfile, DepotProfile, WholesalerProfile,
    RetailerProfile, CustomerProfile, FarmerProfile,
)
from production.models import Crop, PlantingRecord, HarvestRecord, LivestockRecord, PurchaseOffer
from finance.models import Transaction, CreditAccount, CreditLimit, Budget, Expense
from django.utils.text import slugify

User = get_user_model()


def _create_user(username, password, role, first_name, last_name, phone):
    if User.objects.filter(username=username).exists():
        return User.objects.get(username=username)
    user = User(
        username=username, email=f"{username}@nxtecom.com",
        first_name=first_name, last_name=last_name, role=role, phone=phone,
    )
    user.set_password(password)
    user.save()
    print(f"  Created {role}: {username}")
    return user


def seed():
    print("Seeding NxtEcom - Unified Trade and Agriculture OS...")

    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser(
            username="admin", email="admin@nxtecom.com", password="admin1234",
            first_name="Admin", last_name="User", role="admin",
        )
        print("  Created admin")

    farmer1 = _create_user("farmer1", "farmer1234", "farmer", "Moses", "Kato", "+256700100001")
    if farmer1:
        FarmerProfile.objects.get_or_create(user=farmer1, defaults={
            "farm_name": "Kato Family Farm", "farm_size": Decimal("50"),
            "location": "Mukono District", "city": "Mukono", "region": "Central",
            "contact_phone": "+256700100001", "primary_crops": ["maize", "beans", "coffee"],
            "has_livestock": True,
        })

    farmer2 = _create_user("farmer2", "farmer1234", "farmer", "Grace", "Nalubega", "+256700100002")
    if farmer2:
        FarmerProfile.objects.get_or_create(user=farmer2, defaults={
            "farm_name": "Nalubega Poultry & Crops", "farm_size": Decimal("25"),
            "location": "Jinja District", "city": "Jinja", "region": "Eastern",
            "contact_phone": "+256700100002", "primary_crops": ["rice", "vanilla"],
            "has_livestock": True,
        })

    company1 = _create_user("company1", "company1234", "company", "David", "Ssemakula", "+256700200001")
    if company1:
        CompanyProfile.objects.get_or_create(user=company1, defaults={
            "name": "Ssemakula Agri-Processing Ltd", "city": "Kampala",
            "region": "Central", "contact_email": "info@ssemakula.ug",
        })

    depot1 = _create_user("depot1", "depot1234", "depot", "Sarah", "Nambi", "+256700300001")
    if depot1:
        DepotProfile.objects.get_or_create(user=depot1, defaults={
            "name": "Central Distribution Hub", "city": "Kampala",
            "region": "Central", "location": "Industrial Area, Kampala", "capacity": 5000,
        })

    wholesaler1 = _create_user("wholesaler1", "wholesaler1234", "wholesaler", "Peter", "Mukasa", "+256700400001")
    if wholesaler1:
        WholesalerProfile.objects.get_or_create(user=wholesaler1, defaults={
            "business_name": "Mukasa Wholesale Traders", "city": "Kampala", "region": "Central",
        })

    retailer1 = _create_user("retailer1", "retailer1234", "retailer", "Jane", "Achieng", "+256700500001")
    if retailer1:
        RetailerProfile.objects.get_or_create(user=retailer1, defaults={
            "shop_name": "Jane's Shop", "city": "Kampala", "region": "Central", "is_online": True,
        })

    retailer2 = _create_user("retailer2", "retailer1234", "retailer", "Tom", "Ochieng", "+256700500002")
    if retailer2:
        RetailerProfile.objects.get_or_create(user=retailer2, defaults={
            "shop_name": "Tom's Mart", "city": "Gulu", "region": "Northern", "is_online": True,
        })

    customer1 = _create_user("customer1", "customer1234", "customer", "John", "Doe", "+256700600001")
    if customer1:
        CustomerProfile.objects.get_or_create(user=customer1, defaults={"city": "Kampala", "region": "Central"})

    # Categories & Products
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
        cat, _ = Category.objects.get_or_create(slug=slugify(name), defaults={"name": name, "description": desc})
        categories[name] = cat

    products_data = [
        ("Samsung Galaxy A15", "Electronics", "Latest Samsung smartphone", 850000, "SAM-A15-001", "piece"),
        ("Nokia 105", "Electronics", "Reliable basic phone", 65000, "NOK-105-001", "piece"),
        ("USB-C Charger", "Electronics", "Fast charging adapter", 25000, "USB-C-001", "piece"),
        ("Wireless Earbuds", "Electronics", "Bluetooth 5.0 earbuds", 45000, "EAR-BT-001", "piece"),
        ("Rolex (Ugandan)", "Food & Beverages", "Chapati with eggs", 5000, "FD-ROL-001", "piece"),
        ("Nile Special Beer", "Food & Beverages", "Premium lager 500ml", 5000, "FD-NIL-001", "bottle"),
        ("Mukwano Cooking Oil 5L", "Food & Beverages", "Premium cooking oil", 32000, "FD-MUK-001", "piece"),
        ("Riham Sugar 1kg", "Food & Beverages", "Pure white sugar", 5500, "FD-SUG-001", "kg"),
        ("Maize Flour 2kg", "Food & Beverages", "Fine maize flour", 7500, "FD-MAZ-001", "kg"),
        ("Gomesi Dress", "Clothing", "Traditional Ugandan dress", 150000, "CL-GOM-001", "piece"),
        ("Kanzu Robe", "Clothing", "Traditional men's robe", 120000, "CL-KAN-001", "piece"),
        ("Cotton T-Shirt", "Clothing", "Comfortable cotton t-shirt", 25000, "CL-TSH-001", "piece"),
        ("Cooking Pot Set", "Home & Kitchen", "3-piece steel pot set", 85000, "HK-POT-001", "set"),
        ("Solar Lamp", "Home & Kitchen", "Solar powered lamp", 35000, "HK-SOL-001", "piece"),
        ("Mosquito Net", "Home & Kitchen", "Treated mosquito net", 18000, "HK-NET-001", "piece"),
        ("Herbal Soap", "Health & Beauty", "Natural herbal soap", 8000, "HB-SOP-001", "piece"),
        ("Shea Butter 250g", "Health & Beauty", "Pure shea butter", 15000, "HB-SHE-001", "jar"),
        ("Coffee Beans 1kg", "Agriculture", "Ugandan Arabica coffee", 25000, "AG-COF-001", "kg"),
        ("Vanilla Pods 100g", "Agriculture", "High quality vanilla", 45000, "AG-VAN-001", "pack"),
        ("Fresh Maize (sack)", "Agriculture", "Freshly harvested maize", 80000, "AG-MAZ-001", "sack"),
    ]
    for name, cat_name, desc, price, sku, unit in products_data:
        Product.objects.get_or_create(sku=sku, defaults={
            "name": name, "slug": slugify(name), "description": desc,
            "base_price": price, "category": categories.get(cat_name), "unit": unit, "is_active": True,
        })

    # Inventory
    retailer_user = User.objects.filter(username="retailer1").first()
    wholesaler_user = User.objects.filter(username="wholesaler1").first()
    farmer_user = User.objects.filter(username="farmer1").first()
    company_user = User.objects.filter(username="company1").first()

    for product in Product.objects.all()[:10]:
        for otype, usr, qty, reorder in [("retailer", retailer_user, 50, 10), ("wholesaler", wholesaler_user, 200, 50), ("company", company_user, 1000, 200)]:
            if usr:
                Inventory.objects.get_or_create(product=product, owner_type=otype, owner_id=usr.id, defaults={"quantity": qty, "reorder_level": reorder})

    for product in Product.objects.filter(category=categories.get("Agriculture")):
        if farmer_user:
            Inventory.objects.get_or_create(product=product, owner_type="farmer", owner_id=farmer_user.id, defaults={"quantity": 500, "reorder_level": 100})

    # Crops
    crops_data = [
        ("Maize", "cereal", "March-July", Decimal("800")),
        ("Beans", "legume", "March-July, Sept-Dec", Decimal("600")),
        ("Coffee (Arabica)", "cash_crop", "Oct-Feb", Decimal("500")),
        ("Coffee (Robusta)", "cash_crop", "Oct-Feb", Decimal("700")),
        ("Vanilla", "cash_crop", "Perennial", Decimal("50")),
        ("Rice", "cereal", "April-August", Decimal("1000")),
        ("Cassava", "tuber", "Year-round", Decimal("5000")),
        ("Banana (Matooke)", "fruit", "Year-round", Decimal("8000")),
        ("Tomatoes", "vegetable", "Year-round", Decimal("3000")),
        ("Groundnuts", "legume", "Two seasons", Decimal("500")),
    ]
    crops = {}
    for name, cat, season, yld in crops_data:
        crop, _ = Crop.objects.get_or_create(name=name, defaults={"category": cat, "growing_season": season, "avg_yield_per_acre": yld})
        crops[name] = crop

    # Planting & Harvest
    if farmer_user and not PlantingRecord.objects.filter(farmer=farmer_user).exists():
        today = date.today()
        PlantingRecord.objects.create(farmer=farmer_user, crop=crops["Maize"], field_name="Field A", area_acres=Decimal("10"), planting_date=today - timedelta(days=90), expected_harvest_date=today + timedelta(days=30), status="growing")
        p2 = PlantingRecord.objects.create(farmer=farmer_user, crop=crops["Beans"], field_name="Field B", area_acres=Decimal("5"), planting_date=today - timedelta(days=120), expected_harvest_date=today - timedelta(days=10), status="harvested")
        PlantingRecord.objects.create(farmer=farmer_user, crop=crops["Coffee (Arabica)"], field_name="Coffee Plot", area_acres=Decimal("15"), planting_date=today - timedelta(days=365), expected_harvest_date=today + timedelta(days=60), status="growing")
        HarvestRecord.objects.create(planting_record=p2, farmer=farmer_user, harvest_date=today - timedelta(days=10), yield_kg=Decimal("2800"), quality_grade="grade_a", storage_location="Farm Store A")

    # Livestock
    if farmer_user and not LivestockRecord.objects.filter(farmer=farmer_user).exists():
        LivestockRecord.objects.create(farmer=farmer_user, animal_type="cattle", breed="Ankole", count=25, health_status="healthy", location="Pasture A")
        LivestockRecord.objects.create(farmer=farmer_user, animal_type="poultry", breed="Local Layers", count=500, health_status="healthy", location="Poultry House")
        LivestockRecord.objects.create(farmer=farmer_user, animal_type="goats", breed="Boer Cross", count=40, health_status="healthy", location="Pasture B")

    # Purchase Offers
    if farmer_user and company_user and not PurchaseOffer.objects.exists():
        PurchaseOffer.objects.create(buyer=company_user, farmer=farmer_user, crop=crops["Coffee (Arabica)"], product_description="Arabica Coffee Beans - Grade AA", quantity_kg=Decimal("5000"), price_per_kg=Decimal("8500"), delivery_date=date.today() + timedelta(days=30), status="open")
        PurchaseOffer.objects.create(buyer=company_user, farmer=farmer_user, crop=crops["Maize"], product_description="Dried Maize - Premium Quality", quantity_kg=Decimal("10000"), price_per_kg=Decimal("1200"), delivery_date=date.today() + timedelta(days=60), status="accepted")

    # Credit Limits
    if company_user and wholesaler_user:
        CreditLimit.objects.get_or_create(creditor=company_user, debtor=wholesaler_user, defaults={"credit_limit": Decimal("50000000"), "used_amount": Decimal("15000000"), "risk_score": 25})
    if wholesaler_user and retailer_user:
        CreditLimit.objects.get_or_create(creditor=wholesaler_user, debtor=retailer_user, defaults={"credit_limit": Decimal("10000000"), "used_amount": Decimal("3500000"), "risk_score": 20})

    # Credit Accounts
    if wholesaler_user and retailer_user and not CreditAccount.objects.exists():
        CreditAccount.objects.create(creditor=wholesaler_user, debtor=retailer_user, amount=Decimal("2000000"), amount_paid=Decimal("500000"), due_date=timezone.now() + timedelta(days=30), status="active", risk_score=20)
        CreditAccount.objects.create(creditor=wholesaler_user, debtor=retailer_user, amount=Decimal("1500000"), amount_paid=Decimal("1500000"), due_date=timezone.now() - timedelta(days=10), status="paid", risk_score=15)

    # Transactions
    if retailer_user and not Transaction.objects.filter(user=retailer_user).exists():
        for i in range(5):
            Transaction.objects.create(user=retailer_user, type="credit", amount=Decimal(str(500000 + i * 100000)), description=f"Sale #{i+1}", reference=f"SALE-{i+1:04d}")
            Transaction.objects.create(user=retailer_user, type="debit", amount=Decimal(str(200000 + i * 50000)), description=f"Purchase #{i+1}", reference=f"PUR-{i+1:04d}")

    # Budgets
    if retailer_user and not Budget.objects.filter(user=retailer_user).exists():
        Budget.objects.create(user=retailer_user, name="Monthly Inventory Budget", category="inventory", amount=Decimal("5000000"), spent=Decimal("3200000"), period="monthly", start_date=date.today().replace(day=1), end_date=(date.today().replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1))

    # Expenses
    if retailer_user and not Expense.objects.filter(user=retailer_user).exists():
        for cat, desc, amt, d in [("inventory", "Purchased 50 bags of sugar", Decimal("2750000"), date.today() - timedelta(days=5)), ("transport", "Delivery from wholesaler", Decimal("150000"), date.today() - timedelta(days=5)), ("rent", "Shop rent April 2026", Decimal("800000"), date.today() - timedelta(days=15)), ("utilities", "Electricity bill", Decimal("120000"), date.today() - timedelta(days=10)), ("salary", "Shop assistant salary", Decimal("400000"), date.today() - timedelta(days=2))]:
            Expense.objects.create(user=retailer_user, category=cat, description=desc, amount=amt, date=d)

    print(f"\nSeeded: {Product.objects.count()} products, {Crop.objects.count()} crops, {Inventory.objects.count()} inventory records")
    print(f"  {CreditLimit.objects.count()} credit limits, {CreditAccount.objects.count()} credit accounts")
    print("\nDemo accounts:")
    print("  admin / admin1234")
    print("  farmer1 / farmer1234, farmer2 / farmer1234")
    print("  company1 / company1234")
    print("  depot1 / depot1234")
    print("  wholesaler1 / wholesaler1234")
    print("  retailer1 / retailer1234, retailer2 / retailer1234")
    print("  customer1 / customer1234")


if __name__ == "__main__":
    seed()
