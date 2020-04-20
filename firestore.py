import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import os
import sys
import json

# this will set the required credentials for firebase into os config for localhost.
# rename firebase credentials file to firebase_cred.json
if os.environ.get('project_id') is None:
    with open("firebase_cred.json") as json_file:
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
        "type": os.environ.get('type'),
        "project_id": os.environ.get('project_id'),
        "private_key_id": os.environ.get('private_key_id'),
        "private_key": os.environ.get('private_key'),
        "client_email": os.environ.get('client_email'),
        "client_id": os.environ.get('client_id'),
        "auth_uri": os.environ.get('auth_uri'),
        "token_uri": os.environ.get('token_uri'),
        "auth_provider_x509_cert_url": os.environ.get('auth_provider_x509_cert_url'),
        "client_x509_cert_url": os.environ.get('client_x509_cert_url'),
    })
    firebase_admin.initialize_app(cred)

    db = firestore.client()

    key = sys.argv[1] + ',' + sys.argv[2]
    filename = 'tmp/' + key

    file = open(filename, 'r')
    value = "\n".join(file.readlines())
    data = {
        key: value
    }

    db.collection(u'app').document(key).set(data)
    print(1)
else:
    print("could not create firebase client")
