from .forms import UserSerializer


def response_handler(token, user=None, request=None):
    return {
        'token': token,
        'user': UserSerializer(user).data
    }
