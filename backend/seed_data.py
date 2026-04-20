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
from production.models import Crop, PlantingRecord, HarvestRecord, LivestockRecord, PurchaseOffer, SupplyContract, HarvestForecast
from finance.models import Transaction, CreditAccount, CreditLimit, Budget, Expense, FarmerPayment, BatchCostTracking, ProfitMarginReport
from aggregation.models import AggregationCenter, Batch, IntakeRecord, QualityAssessment
from processing.models import ProcessingFacility, ProcessingJob, ProcessingCost, YieldRecord
from intelligence.models import DemandForecast, SupplyDemandMatch, PricingRule, AnalyticsSnapshot
from logistics.models import Warehouse, WarehouseStock, DeliverySchedule
from affiliate.models import AffiliateAccount, AffiliateProduct, AffiliatePerformance
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

    # ── Agri Value Chain seed data ──

    # Supply Contracts
    if farmer_user and company_user and not SupplyContract.objects.exists():
        SupplyContract.objects.create(
            farmer=farmer_user, buyer=company_user, crop=crops.get("Coffee (Arabica)"),
            committed_quantity_kg=Decimal("5000"), delivered_quantity_kg=Decimal("2000"),
            price_per_kg=Decimal("8500"), start_date=date.today() - timedelta(days=60),
            end_date=date.today() + timedelta(days=120), status="active",
            terms="Premium Arabica beans, Grade AA minimum, bi-weekly deliveries",
        )
        SupplyContract.objects.create(
            farmer=farmer_user, buyer=company_user, crop=crops.get("Maize"),
            committed_quantity_kg=Decimal("10000"), delivered_quantity_kg=Decimal("10000"),
            price_per_kg=Decimal("1200"), start_date=date.today() - timedelta(days=120),
            end_date=date.today() - timedelta(days=10), status="fulfilled",
            terms="Dried maize, moisture < 13%",
        )
        print("  Created supply contracts")

    # Harvest Forecasts
    planting_maize = PlantingRecord.objects.filter(farmer=farmer_user, crop=crops.get("Maize")).first() if farmer_user else None
    planting_coffee = PlantingRecord.objects.filter(farmer=farmer_user, crop=crops.get("Coffee (Arabica)")).first() if farmer_user else None
    if planting_maize and not HarvestForecast.objects.exists():
        HarvestForecast.objects.create(
            planting_record=planting_maize, farmer=farmer_user,
            estimated_yield_kg=Decimal("7500"), confidence=Decimal("85"),
            forecast_date=date.today() + timedelta(days=30), methodology="Historical average + weather data",
        )
        if planting_coffee:
            HarvestForecast.objects.create(
                planting_record=planting_coffee, farmer=farmer_user,
                estimated_yield_kg=Decimal("3500"), confidence=Decimal("72"),
                forecast_date=date.today() + timedelta(days=60), methodology="Seasonal pattern analysis",
            )
        print("  Created harvest forecasts")

    # Aggregation Centers
    if depot1 and not AggregationCenter.objects.exists():
        center1 = AggregationCenter.objects.create(
            name="Mukono Collection Point", manager=depot1,
            center_type="collection_point", location="Mukono Town Center",
            address="Plot 12, Main Street, Mukono", region="Central",
            capacity_kg=Decimal("50000"), current_stock_kg=Decimal("12500"),
        )
        center2 = AggregationCenter.objects.create(
            name="Jinja Cooperative Hub", manager=depot1,
            center_type="cooperative", location="Jinja Industrial Area",
            address="Plot 45, Industrial Rd, Jinja", region="Eastern",
            capacity_kg=Decimal("80000"), current_stock_kg=Decimal("35000"),
        )
        print("  Created aggregation centers")

        # Batches
        batch1 = Batch.objects.create(
            center=center1, crop=crops.get("Maize"),
            total_quantity_kg=Decimal("8000"), quality_grade="Grade A",
            status="complete", notes="Ready for processing",
        )
        batch2 = Batch.objects.create(
            center=center2, crop=crops.get("Coffee (Arabica)"),
            total_quantity_kg=Decimal("3000"), quality_grade="Premium",
            status="aggregating", notes="Still accepting deliveries",
        )
        batch3 = Batch.objects.create(
            center=center1, crop=crops.get("Beans"),
            total_quantity_kg=Decimal("5000"), quality_grade="Grade B",
            status="dispatched", notes="Sent to Ssemakula Agri-Processing",
        )
        print("  Created batches")

        # Intake Records
        if farmer_user:
            intake1 = IntakeRecord.objects.create(
                center=center1, farmer=farmer_user, batch=batch1,
                crop=crops.get("Maize"), quantity_kg=Decimal("5000"),
                unit_price=Decimal("1200"), received_by=depot1,
                notes="Good quality dried maize",
            )
            intake2 = IntakeRecord.objects.create(
                center=center2, farmer=farmer_user, batch=batch2,
                crop=crops.get("Coffee (Arabica)"), quantity_kg=Decimal("2000"),
                unit_price=Decimal("8500"), received_by=depot1,
                notes="Arabica Grade AA",
            )
            print("  Created intake records")

            # Quality Assessments
            QualityAssessment.objects.create(
                intake=intake1, grade="grade_a", moisture_content=Decimal("12.5"),
                impurity_pct=Decimal("1.2"), size_uniformity="Uniform",
                color_assessment="Golden yellow", assessed_by=depot1,
                notes="Meets Grade A standards",
            )
            QualityAssessment.objects.create(
                intake=intake2, grade="premium", moisture_content=Decimal("11.0"),
                impurity_pct=Decimal("0.5"), size_uniformity="Very uniform",
                color_assessment="Dark green", assessed_by=depot1,
                notes="Premium quality Arabica",
            )
            print("  Created quality assessments")

        # Processing Facilities
        if company_user:
            facility1 = ProcessingFacility.objects.create(
                name="Ssemakula Maize Mill", owner=company_user,
                facility_type="mill", location="Kampala Industrial Area",
                capacity_kg_per_day=Decimal("5000"),
            )
            facility2 = ProcessingFacility.objects.create(
                name="Ssemakula Coffee Packhouse", owner=company_user,
                facility_type="packhouse", location="Kampala Industrial Area",
                capacity_kg_per_day=Decimal("2000"),
            )
            print("  Created processing facilities")

            # Processing Jobs
            maize_flour = Product.objects.filter(sku="FD-MAZ-001").first()
            coffee_product = Product.objects.filter(sku="AG-COF-001").first()

            job1 = ProcessingJob.objects.create(
                facility=facility1, input_batch=batch1,
                output_product=maize_flour, input_crop=crops.get("Maize"),
                input_quantity_kg=Decimal("8000"), output_quantity_kg=Decimal("6400"),
                waste_kg=Decimal("1600"), status="completed",
                started_at=timezone.now() - timedelta(days=5),
                completed_at=timezone.now() - timedelta(days=3),
                notes="Standard milling process",
            )
            job2 = ProcessingJob.objects.create(
                facility=facility2, input_batch=batch2,
                output_product=coffee_product, input_crop=crops.get("Coffee (Arabica)"),
                input_quantity_kg=Decimal("3000"), output_quantity_kg=Decimal("0"),
                status="in_progress", started_at=timezone.now() - timedelta(hours=12),
                notes="Sorting and packaging",
            )
            print("  Created processing jobs")

            # Processing Costs
            ProcessingCost.objects.create(job=job1, cost_type="labor", description="Mill workers (3 days)", amount=Decimal("450000"))
            ProcessingCost.objects.create(job=job1, cost_type="energy", description="Electricity for milling", amount=Decimal("180000"))
            ProcessingCost.objects.create(job=job1, cost_type="packaging", description="50kg flour bags x128", amount=Decimal("320000"))
            ProcessingCost.objects.create(job=job2, cost_type="labor", description="Sorting workers", amount=Decimal("200000"))
            print("  Created processing costs")

            # Yield Records
            YieldRecord.objects.create(
                job=job1, input_kg=Decimal("8000"), output_kg=Decimal("6400"),
                notes="80% yield - standard for maize milling",
            )
            print("  Created yield records")

            # Batch Cost Tracking
            BatchCostTracking.objects.create(batch=batch1, cost_type="procurement", description="Farmer payments for maize", amount=Decimal("9600000"), incurred_by=company_user)
            BatchCostTracking.objects.create(batch=batch1, cost_type="aggregation", description="Collection and grading", amount=Decimal("500000"), incurred_by=depot1)
            BatchCostTracking.objects.create(batch=batch1, cost_type="processing", description="Milling costs", amount=Decimal("950000"), incurred_by=company_user)
            BatchCostTracking.objects.create(batch=batch1, cost_type="transport", description="Farm to collection point", amount=Decimal("300000"), incurred_by=depot1)
            print("  Created batch cost tracking")

        # Warehouses
        if company_user and depot1:
            wh1 = Warehouse.objects.create(
                name="Central Kampala Warehouse", owner=company_user,
                location="Industrial Area, Kampala", address="Plot 78, 7th Street",
                region="Central", storage_type="dry",
                capacity_kg=Decimal("100000"), current_stock_kg=Decimal("45000"),
            )
            wh2 = Warehouse.objects.create(
                name="Mukono Cold Storage", owner=depot1,
                location="Mukono", address="Plot 3, Bypass Rd",
                region="Central", storage_type="cold",
                capacity_kg=Decimal("30000"), current_stock_kg=Decimal("12000"),
            )
            print("  Created warehouses")

            # Warehouse Stock
            if maize_flour:
                WarehouseStock.objects.create(
                    warehouse=wh1, product=maize_flour,
                    batch=batch1 if 'batch1' in dir() else None,
                    quantity_kg=Decimal("6400"), quantity_units=128,
                    location_in_warehouse="Aisle A, Shelf 1-4",
                )
            if coffee_product:
                WarehouseStock.objects.create(
                    warehouse=wh2, product=coffee_product,
                    quantity_kg=Decimal("1500"), quantity_units=60,
                    location_in_warehouse="Cold Room B",
                )
            print("  Created warehouse stock")

        # Intelligence: Demand Forecasts
        if maize_flour and not DemandForecast.objects.exists():
            DemandForecast.objects.create(
                product=maize_flour, region="Central",
                period="monthly", period_start=date.today().replace(day=1),
                period_end=(date.today().replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1),
                predicted_demand_qty=Decimal("500"), predicted_demand_kg=Decimal("25000"),
                confidence=Decimal("82"), data_sources=["historical_sales", "seasonal_patterns"],
            )
            if coffee_product:
                DemandForecast.objects.create(
                    product=coffee_product, region="Central",
                    period="monthly", period_start=date.today().replace(day=1),
                    period_end=(date.today().replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1),
                    predicted_demand_qty=Decimal("200"), predicted_demand_kg=Decimal("10000"),
                    confidence=Decimal("75"), data_sources=["export_trends", "market_prices"],
                )
            print("  Created demand forecasts")

        # Supply-Demand Matching
        if maize_flour and not SupplyDemandMatch.objects.exists():
            SupplyDemandMatch.objects.create(
                product=maize_flour, region="Central",
                supply_available_kg=Decimal("45000"), demand_forecast_kg=Decimal("25000"),
                recommended_action="maintain", price_suggestion=Decimal("7500"),
                notes="Supply exceeds demand - maintain current pricing",
            )
            if coffee_product:
                SupplyDemandMatch.objects.create(
                    product=coffee_product, region="Central",
                    supply_available_kg=Decimal("5000"), demand_forecast_kg=Decimal("10000"),
                    recommended_action="increase_supply", price_suggestion=Decimal("28000"),
                    notes="Demand exceeds supply - consider increasing procurement",
                )
            print("  Created supply-demand matches")

        # Pricing Rules
        if maize_flour and not PricingRule.objects.exists():
            admin_user = User.objects.filter(username="admin").first()
            PricingRule.objects.create(
                name="Bulk Maize Flour Discount", product=maize_flour,
                rule_type="bulk_discount", conditions={"min_qty": 50, "discount_pct": 10},
                price_modifier=Decimal("0.9000"), is_active=True,
                start_date=date.today(), end_date=date.today() + timedelta(days=90),
                created_by=admin_user,
            )
            PricingRule.objects.create(
                name="Seasonal Coffee Premium", product=coffee_product,
                rule_type="seasonal", conditions={"season": "harvest", "premium_pct": 15},
                price_modifier=Decimal("1.1500"), is_active=True,
                start_date=date.today(), end_date=date.today() + timedelta(days=60),
                created_by=admin_user,
            )
            print("  Created pricing rules")

        # Analytics Snapshots
        if company_user and not AnalyticsSnapshot.objects.exists():
            AnalyticsSnapshot.objects.create(
                user=company_user, snapshot_type="sales",
                period_start=date.today() - timedelta(days=30), period_end=date.today(),
                data={"total_revenue": 45000000, "orders_count": 85, "avg_order_value": 529412, "top_products": ["Maize Flour", "Coffee Beans"]},
                insights=["Revenue up 12% from last month", "Coffee demand increasing in Eastern region"],
            )
            AnalyticsSnapshot.objects.create(
                user=company_user, snapshot_type="production",
                period_start=date.today() - timedelta(days=30), period_end=date.today(),
                data={"total_processed_kg": 15000, "avg_yield_pct": 78.5, "facilities_active": 2, "jobs_completed": 8},
                insights=["Yield efficiency improved by 3%", "Consider expanding cold storage capacity"],
            )
            print("  Created analytics snapshots")

        # Farmer Payments
        if farmer_user and company_user and not FarmerPayment.objects.exists():
            FarmerPayment.objects.create(
                farmer=farmer_user, payer=company_user,
                amount=Decimal("6000000"), payment_method="mobile_money",
                reference="MTN-PAY-001", status="processed",
                paid_at=timezone.now() - timedelta(days=7),
                notes="Payment for maize intake batch",
            )
            FarmerPayment.objects.create(
                farmer=farmer_user, payer=company_user,
                amount=Decimal("17000000"), payment_method="bank_transfer",
                reference="BANK-PAY-002", status="pending",
                notes="Payment for coffee delivery - pending approval",
            )
            print("  Created farmer payments")

        # Profit Margin Reports
        if company_user and maize_flour and not ProfitMarginReport.objects.exists():
            ProfitMarginReport.objects.create(
                user=company_user, product=maize_flour,
                period_start=date.today() - timedelta(days=30), period_end=date.today(),
                revenue=Decimal("48000000"), cost_of_goods=Decimal("32000000"),
                operating_expenses=Decimal("6000000"), units_sold=640,
            )
            if coffee_product:
                ProfitMarginReport.objects.create(
                    user=company_user, product=coffee_product,
                    period_start=date.today() - timedelta(days=30), period_end=date.today(),
                    revenue=Decimal("25000000"), cost_of_goods=Decimal("18000000"),
                    operating_expenses=Decimal("3000000"), units_sold=100,
                )
            print("  Created profit margin reports")

        # Affiliate Products & Performance
        affiliate_user = User.objects.filter(role="affiliate").first()
        if affiliate_user:
            aff_account, _ = AffiliateAccount.objects.get_or_create(
                user=affiliate_user,
                defaults={"referral_code": f"REF-{affiliate_user.username.upper()[:6]}", "total_earnings": Decimal("1200000"), "pending_earnings": Decimal("300000")},
            )
            if maize_flour and not AffiliateProduct.objects.exists():
                AffiliateProduct.objects.create(
                    affiliate=aff_account, product=maize_flour,
                    custom_price=Decimal("8000"), commission_rate=Decimal("15.00"),
                )
                if coffee_product:
                    AffiliateProduct.objects.create(
                        affiliate=aff_account, product=coffee_product,
                        commission_rate=Decimal("20.00"),
                    )
                print("  Created affiliate products")

            if not AffiliatePerformance.objects.exists():
                AffiliatePerformance.objects.create(
                    affiliate=aff_account, period="monthly",
                    period_start=date.today() - timedelta(days=30), period_end=date.today(),
                    orders_generated=25, revenue_generated=Decimal("5000000"),
                    commission_earned=Decimal("900000"), conversion_rate=Decimal("12.50"),
                    clicks=200,
                )
                print("  Created affiliate performance")

    print(f"\nSeeded: {Product.objects.count()} products, {Crop.objects.count()} crops, {Inventory.objects.count()} inventory records")
    print(f"  {CreditLimit.objects.count()} credit limits, {CreditAccount.objects.count()} credit accounts")
    print(f"  {AggregationCenter.objects.count()} aggregation centers, {Batch.objects.count()} batches")
    print(f"  {ProcessingFacility.objects.count()} processing facilities, {ProcessingJob.objects.count()} processing jobs")
    print(f"  {Warehouse.objects.count()} warehouses, {DemandForecast.objects.count()} demand forecasts")
    print(f"  {SupplyContract.objects.count()} supply contracts, {FarmerPayment.objects.count()} farmer payments")
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
