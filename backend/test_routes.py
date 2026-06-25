import main
for route in main.app.routes:
    if hasattr(route, "methods"):
        print(f"{route.path} {route.methods}")
    else:
        print(f"{route.path}")
