from flask import Flask, jsonify, render_template, request, Response

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import datetime
import os
import sys
import json
import uuid
import subprocess

app = Flask(__name__)

cred = None
# this will set the required credentials for firebase into os config for localhost.
# rename firebase credentials file to firebase_cred.json
if os.environ.get('project_id') is None:
    with open("firebase_cred.json") as json_file:
        data = json.load(json_file)
        cred = credentials.Certificate({
            "type": data['type'],
            "project_id": data['project_id'],
            "private_key_id": data['private_key_id'],
            "private_key": data['private_key'],
            "client_email": data['client_email'],
            "client_id": data['client_id'],
            "auth_uri": data['auth_uri'],
            "token_uri": data['token_uri'],
            "auth_provider_x509_cert_url": data['auth_provider_x509_cert_url'],
            "client_x509_cert_url": data['client_x509_cert_url'],
        })

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

if cred == None:
    raise RuntimeError("Failed to fetch firebase credentials")

firebase_admin.initialize_app(cred)
db = firestore.client()


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/draw')
def draw():
    return render_template("draw.html")


@app.route('/backdoor/remove_inactive')
def remove_inactive():
    try:
        admin = os.environ.get('admin')
    except:
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    if request.args.get('admin') != admin:
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    p = subprocess.run(
        "py ./static/scripts/_scheduled_remove_inactive_users.py 1", stdout=subprocess.PIPE, shell=True)
    return Response(p.stdout, status=200, mimetype='application/json')


@app.route('/endpoints/adjust_status')
def adjust_drawing_status():
    key = request.args.get('x') + ',' + request.args.get('y')
    user = request.args.get('user')
    is_drawing = request.args.get('isDrawing')
    if key == "," or user == None or is_drawing == None:
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    room_ref = db.collection(u'app').document(key)
    room_dict = room_ref.get().to_dict()
    is_already_drawing = False
    should_draw = False
    if (is_drawing == "true"):
        should_draw = True

    if bool(room_dict) and should_draw == True:
        for _user in room_dict['users']:
            if (room_dict['users'][_user]['isDrawing'] == True):
                is_already_drawing = True

    if not is_already_drawing:
        room_ref.update(
            {
                'users.' + user + ".isDrawing": should_draw
            }
        )
        return Response("{json:'data'}", status=200, mimetype='application/json')
    return Response("{json:'data'}", status=409, mimetype='application/json')


@app.route('/endpoints/adjust_score')
def adjust_score():
    key = request.args.get('x') + ',' + request.args.get('y')
    user = request.args.get('user')
    score = request.args.get('score')
    if key == "," or user == None or score == None:
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    db.collection(u'app').document(key).update(
        {
            'users.' + user + ".score": score
        }
    )
    return Response("{json:'data'}", status=200, mimetype='application/json')


@app.route('/endpoints/joining')
def player_joining():
    key = request.args.get('x') + ',' + request.args.get('y')
    user = request.args.get('user')
    identifier = str(uuid.uuid4()).replace(' ', '').replace('-', '')
    if key == "," or user == None:
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    room_ref = db.collection(u'app').document(key)
    room_dict = room_ref.get().to_dict()
    if bool(room_dict):
        data = {}
        data["users." + identifier] = {
            'user': user,
            'timestamp': datetime.datetime.utcnow(),
            "score": "0",
            "isDrawing": False
        }
        room_ref.update(data)
    else:
        room_ref.set({
            "pixels": '{"data":{}}',
            "users": {
                identifier: {
                    "user": user,
                    "timestamp": datetime.datetime.utcnow(),
                    "score": "0",
                    "isDrawing": False
                }
            }
        })
    responseData = json.dumps({'id': identifier})
    return Response(responseData, status=200, mimetype='application/json')


@app.route('/endpoints/leaving')
def player_leave():
    key = request.args.get('x') + ',' + request.args.get('y')
    user = request.args.get('user')
    if key == "," or user == None:
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    db.collection(u'app').document(key).update(
        {
            'users.' + user: firestore.DELETE_FIELD  # pylint: disable=no-member
        }
    )
    return Response("{json:'data'}", status=200, mimetype='application/json')


@app.route('/endpoints/submit_drawing', methods=['POST'])
def drawing_submitted():
    key = request.args.get('x') + ',' + request.args.get('y')
    data = request.data.decode("utf-8")
    # TODO Validate pixel data sent thru
    if key == ",":
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    db.collection(u'app').document(key).update({"pixels": data})
    return Response("{json:'data'}", status=200, mimetype='application/json')


@app.route('/endpoints/pokedex')
def get_pokemon():
    _id = request.args.get('id')
    if _id == None:
        return Response("{error:'malformed request'}", status=400, mimetype='application/json')
    pokedex = json.load(open('static/json/pokedex.json', encoding="utf8"))
    response_data = json.dumps(pokedex[_id])
    return Response(response_data, status=200, mimetype='application/json')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template("404.html")


if __name__ == "__main__":
    app.run()
