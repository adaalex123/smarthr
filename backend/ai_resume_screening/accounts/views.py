from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # For now we accept any email/password. Later we'll check real users
    return Response({
        "message": "Login successful", 
        "token": "fake-token-123"
    })