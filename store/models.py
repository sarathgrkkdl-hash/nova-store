from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True
    )

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    description = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    old_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True
    )

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0
    )

    reviews_count = models.PositiveIntegerField(default=0)

    is_new = models.BooleanField(default=False)
    is_sale = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name