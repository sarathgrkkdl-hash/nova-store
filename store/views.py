import json
from decimal import Decimal
from django.shortcuts import render
from .models import Category, Product

CATEGORY_ICONS = {
    "Electronics & Gadgets": "🎧",
    "Men's Fashion": "👔",
    "Women's Fashion": "👗",
    "Home & Living": "🛋️",
    "Beauty & Personal Care": "✨",
    "Sports & Fitness": "🏃",
    "Books & Stationery": "📚",
    "Footwear & Shoes": "👟",
    "Jewelry & Accessories": "💍",
    "Kitchen & Dining": "🍳",
}

GRADIENTS = [
    "linear-gradient(135deg,#d9d8ff,#8e89ff)",
    "linear-gradient(135deg,#e7f4ff,#9bd0ff)",
    "linear-gradient(135deg,#fff2d9,#ffc86b)",
    "linear-gradient(135deg,#ffe5ee,#ff9fbc)",
    "linear-gradient(135deg,#e8f7ef,#9bd8b4)",
    "linear-gradient(135deg,#f0e5ff,#c19aff)",
    "linear-gradient(135deg,#e5e5e9,#a4a5ae)",
    "linear-gradient(135deg,#fff0fa,#e99bd5)",
    "linear-gradient(135deg,#e5f1ff,#87b8ff)",
    "linear-gradient(135deg,#f5e5d5,#c89569)",
    "linear-gradient(135deg,#fff1e2,#ffc38e)",
    "linear-gradient(135deg,#e9efff,#a9baff)",
]

PRODUCT_EMOJIS = {
    # Electronics & Gadgets
    "aero-pro-wireless-headphones": "🎧",
    "pulse-smartwatch-series-7": "⌚",
    "soundcore-mini-bluetooth-speaker": "🔊",
    "ultraview-15-6-4k-portable-monitor": "🖥️",
    "hypercharge-65w-gan-charger": "🔌",
    # Men's Fashion
    "classic-oxford-slim-fit-shirt": "👔",
    "heavyweight-fleece-pullover-hoodie": "🧥",
    "tailored-stretch-chino-trousers": "👖",
    "vintage-washed-denim-trucker-jacket": "🧥",
    "premium-supima-crewneck-tshirt-3pack": "👕",
    # Women's Fashion
    "floral-print-summer-midi-dress": "👗",
    "oversized-chunky-knit-cardigan": "🧶",
    "high-waisted-wide-leg-linen-trousers": "👖",
    "elegant-silk-blend-wrap-blouse": "👚",
    "cozy-ribbed-2piece-loungewear-set": "🥻",
    # Home & Living
    "nordic-minimalist-ceramic-table-lamp": "💡",
    "cloud-boucle-accent-armchair": "🪑",
    "organic-washed-cotton-duvet-cover-set": "🛏️",
    "ultrasonic-aromatherapy-essential-oil-diffuser": "🏺",
    "handwoven-bohemian-jute-area-rug": "🪴",
    # Beauty & Personal Care
    "hydrating-hyaluronic-acid-serum": "🧴",
    "daily-invisible-mineral-sunscreen-spf50": "🧴",
    "botanical-glow-facial-cleansing-oil": "🧼",
    "peptide-multiaction-eye-repair-cream": "✨",
    "organic-rosewater-balancing-face-mist": "🌸",
    # Sports & Fitness
    "non-slip-high-density-yoga-mat": "🧘",
    "quick-adjust-dumbbell-set-50lbs": "🏋️",
    "insulated-stainless-steel-water-bottle-32oz": "🍶",
    "deep-tissue-muscle-foam-roller": "🪵",
    "high-speed-pro-cable-jump-rope": "🪢",
    # Books & Stationery
    "hardcover-dotted-bullet-journal-160gsm": "📓",
    "solid-brass-weighted-rollerball-pen": "✒️",
    "waterproof-vegan-leather-desk-mat": "💼",
    "undated-productivity-daily-planner": "📅",
    "precision-fine-liner-pen-set-12pack": "🖊️",
    # Footwear & Shoes
    "aeroflex-lightweight-road-running-shoes": "👟",
    "classic-leather-casual-low-top-sneakers": "👟",
    "weatherproof-suede-chelsea-boots": "🥾",
    "knit-breathable-casual-slip-on-loafers": "👞",
    "cloudcushion-ergonomic-recovery-slides": "🩴",
    # Jewelry & Accessories
    "18k-gold-vermeil-herringbone-chain-necklace": "📿",
    "classic-polarized-acetate-sunglasses": "🕶️",
    "slim-rfid-blocking-leather-wallet": "👛",
    "brushed-titanium-minimalist-cuff-bracelet": "💍",
    "chunky-gold-huggie-hoop-earrings": "✨",
    # Kitchen & Dining
    "matte-black-gooseneck-electric-kettle": "🫖",
    "japanese-damascus-steel-chefs-knife-8inch": "🔪",
    "pre-seasoned-cast-iron-skillet-10inch": "🍳",
    "double-walled-glass-coffee-mugs-set": "☕",
    "organic-acacia-wood-cutting-board": "🪵",
}


def home(request):
    categories_qs = Category.objects.all().order_by("name")
    products_qs = Product.objects.filter(is_active=True).select_related("category").order_by("id")

    categories_data = []
    for cat in categories_qs:
        categories_data.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "icon": CATEGORY_ICONS.get(cat.name, "🏷️"),
            "product_count": cat.products.filter(is_active=True).count(),
        })

    products_list = []
    for idx, p in enumerate(products_qs):
        if p.is_new:
            badge = "NEW"
        elif p.is_sale:
            badge = "SALE"
        elif float(p.rating) >= 4.9:
            badge = "TOP RATED"
        elif p.reviews_count >= 300:
            badge = "BESTSELLER"
        else:
            badge = "POPULAR"

        color = GRADIENTS[idx % len(GRADIENTS)]
        emoji = PRODUCT_EMOJIS.get(p.slug, CATEGORY_ICONS.get(p.category.name, "🛍️"))

        products_list.append({
            "id": p.id,
            "name": p.name,
            "category": p.category.name,
            "price": float(p.price),
            "oldPrice": float(p.old_price) if p.old_price is not None else None,
            "rating": float(p.rating),
            "reviews": p.reviews_count,
            "emoji": emoji,
            "color": color,
            "badge": badge,
            "description": p.description,
            "image": p.image.url if p.image else None,
        })

    context = {
        "categories": categories_data,
        "products_json": json.dumps(products_list),
        "total_products_count": len(products_list),
        "total_categories_count": len(categories_data),
    }
    return render(request, "index.html", context)


# Add this new function for your new page
# (Change 'about.html' to whatever you named your new HTML file)
def about(request):
    return render(request, 'about.html')