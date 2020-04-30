import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import datetime
import os
import sys
import json

# this will set the required credentials for firebase into os config for localhost.
# rename firebase credentials file to firebase_cred.json
if os.environ.get('project_id') is None:
    with open("../firebase_cred.json") as json_file:
        data = json.load(json_file)
        os.environ['type'] = data['type']
        os.environ['project_id'] = data['project_id']
        os.environ['private_key_id'] = data['private_key_id']
        os.environ['private_key'] = data['private_key']
        os.environ['client_email'] = data['client_email']
        os.environ['client_id'] = data['client_id']
        os.environ['auth_uri'] = data['auth_uri']
        os.environ['token_uri'] = data['token_uri']
        os.environ['auth_provider_x509_cert_url'] = data['auth_provider_x509_cert_url']
        os.environ['client_x509_cert_url'] = data['client_x509_cert_url']


if os.environ.get('project_id') is not None:
    cred = credentials.Certificate({
        "type": os.environ.get('type').replace('\\n', '\n'),
        "project_id": os.environ.get('project_id').replace('\\n', '\n'),
        "private_key_id": os.environ.get('private_key_id').replace('\\n', '\n'),
        "private_key": os.environ.get('private_key').replace('\\n', '\n'),
        "client_email": os.environ.get('client_email').replace('\\n', '\n'),
        "client_id": os.environ.get('client_id').replace('\\n', '\n'),
        "auth_uri": os.environ.get('auth_uri').replace('\\n', '\n'),
        "token_uri": os.environ.get('token_uri').replace('\\n', '\n'),
        "auth_provider_x509_cert_url": os.environ.get('auth_provider_x509_cert_url').replace('\\n', '\n'),
        "client_x509_cert_url": os.environ.get('client_x509_cert_url').replace('\\n', '\n'),
    })
    firebase_admin.initialize_app(cred)

    db = firestore.client()

    key = sys.argv[1] + ',' + sys.argv[2]

    user = sys.argv[3].replace("'", '')

    room_ref = db.collection(u'app').document(key)
    timeoffset = datetime.timedelta(minutes=60*3)
    users_to_delete = []
    room_dict = room_ref.get().to_dict()
    if bool(room_dict):
        for room_key in room_dict:
            if room_key == "users":
                for room_user in room_dict[room_key]:
                    if room_user == user:
                        continue
                    if room_dict[room_key][room_user]['timestamp'].replace(tzinfo=None) < (datetime.datetime.now() - timeoffset):
                        users_to_delete.append(
                            room_dict[room_key][room_user]['user'])
        data = {}
        data["users." + user] = {
            'user': user,
            'timestamp': datetime.datetime.now().replace(tzinfo=None)
        }
        for user_to_delete in users_to_delete:
            data["users." + user_to_delete] = firestore.DELETE_FIELD  # pylint: disable=no-member
        room_ref.update(data)
    else:
        room_ref.set({
            "pixels": '{"data":{}}',
            "users": {
                user: {
                    "user": user,
                    "timestamp": datetime.datetime.now().replace(tzinfo=None)
                }
            }
        })

    print(1)
else:
    print("could not create firebase client")
