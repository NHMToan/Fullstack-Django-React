from django.urls import path
from .views import (ItemListView, AddToCartView, OrderDetailView,
                    PaymentView, AddCouponView, ItemDetailView, AddressListView,
                    AddressCreateView, CountryListView, UserIDView, AddressUpdateView, AddressDeleteView)

urlpatterns = [
    path("products/", ItemListView.as_view(), name="product-list"),
    path("products/<pk>/", ItemDetailView.as_view(), name="product-detail"),
    path("add-to-cart/", AddToCartView.as_view(), name="add-to-cart"),
    path("order-summary/", OrderDetailView.as_view(), name="order-summary"),
    path("checkout/", PaymentView.as_view(), name="checkout"),
    path("add-coupon/", AddCouponView.as_view(), name="add-coupon"),
    path("addresses/", AddressListView.as_view(), name="address-list"),
    path("addresses/<pk>/update/",
         AddressUpdateView.as_view(), name="address-update"),
    path("addresses/<pk>/delete/",
         AddressDeleteView.as_view(), name="address-delete"),
    path("countries/", CountryListView.as_view(), name="country-list"),
    path("user-id/", UserIDView.as_view(), name="user-id"),
    path("addresses/create/", AddressCreateView.as_view(), name="address-create")
]
