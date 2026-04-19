"""
Role-Based Visibility Middleware for NxtEcom Unified Trade & Agriculture OS.

Enforces strict visibility rules:
- Farmers can see companies and marketplaces
- Companies can see farmers and wholesalers
- Wholesalers can see companies and retailers
- Retailers can see wholesalers and customers
- Customers can see retailers only
- Admin can see everything
"""

from django.http import JsonResponse


# Maps each role to the set of roles it is allowed to view/interact with
VISIBILITY_RULES = {
    "farmer": {"farmer", "company", "admin"},
    "company": {"company", "farmer", "wholesaler", "depot", "admin"},
    "depot": {"depot", "company", "wholesaler", "retailer", "admin"},
    "wholesaler": {"wholesaler", "company", "depot", "retailer", "admin"},
    "retailer": {"retailer", "wholesaler", "depot", "customer", "admin"},
    "customer": {"customer", "retailer", "admin"},
    "affiliate": {"affiliate", "retailer", "wholesaler", "company", "admin"},
    "admin": {
        "admin", "farmer", "company", "depot",
        "wholesaler", "retailer", "customer", "affiliate",
    },
}

# API paths that are exempt from visibility checks (public endpoints)
EXEMPT_PATHS = [
    "/api/auth/",
    "/api/products/items/",
    "/api/products/categories/",
    "/api/cart/",
    "/api/market/",
    "/admin/",
    "/api/production/crops/",
]


class RoleVisibilityMiddleware:
    """
    Middleware that enforces role-based visibility rules.

    For API requests that include a `target_role` query parameter,
    this middleware checks whether the requesting user's role is
    allowed to view data belonging to the target role.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip for unauthenticated users (auth middleware handles that)
        if not hasattr(request, "user") or not request.user.is_authenticated:
            return self.get_response(request)

        # Skip exempt paths
        path = request.path
        for exempt in EXEMPT_PATHS:
            if path.startswith(exempt):
                return self.get_response(request)

        # Check target_role parameter if provided
        target_role = request.GET.get("target_role")
        if target_role:
            user_role = getattr(request.user, "role", None)
            if user_role and user_role != "admin":
                allowed = VISIBILITY_RULES.get(user_role, set())
                if target_role not in allowed:
                    return JsonResponse(
                        {
                            "error": "Access denied",
                            "detail": f"Your role ({user_role}) cannot view {target_role} data.",
                        },
                        status=403,
                    )

        # Store visibility rules on request for views to use
        user_role = getattr(request.user, "role", None)
        if user_role:
            request.visible_roles = VISIBILITY_RULES.get(user_role, set())
        else:
            request.visible_roles = set()

        return self.get_response(request)
