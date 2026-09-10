from django.shortcuts import render

def home(request):
    return render(request, 'index.html')

# Add this new function for your new page
# (Change 'about.html' to whatever you named your new HTML file)
def about(request):
    return render(request, 'about.html')