from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    prepopulated_fields = {
        "slug": ("name",)
    }


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "old_price",
        "is_new",
        "is_sale",
        "is_active",
    )

    list_filter = (
        "category",
        "is_new",
        "is_sale",
        "is_active",
    )

    search_fields = ("name",)

    prepopulated_fields = {
        "slug": ("name",)
    }