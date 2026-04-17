from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsCompany(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "company"


class IsDepot(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "depot"


class IsWholesaler(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "wholesaler"


class IsRetailer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "retailer"


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "customer"


class IsAffiliate(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "affiliate"


class IsCompanyOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("company", "admin")


class IsFarmer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("farmer", "admin")


class IsFarmerOrCompany(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("farmer", "company", "admin")


class IsSellerRole(BasePermission):
    """Farmer, Company, Depot, Wholesaler, or Retailer"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            "farmer", "company", "depot", "wholesaler", "retailer", "admin"
        )
