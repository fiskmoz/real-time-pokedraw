# real-time-pokedraw

You have 45 seconds to draw a random pokemon.  
What you draw will be sent to the other players in the room in real-time.

### Backlog:

Minifying  
https (Heroku personal)  
Refactoring js files  
Webpack  
Mobile support  
Multiple bowsers (Check IE, edge, safari etc)  
Display error messages on failed calls

### The Stack:

Flask + Vanilla JS + Firebase

### Getting started localhost:

Install python 3  
`pip install flask`  
Navigate to project root  
`python app.py`

### Scheduled cleanup:

For webbrowsers such as firefox, it is not possible hijack the exit page event so sometimes users will be stuck in lobbys.
Use `_scheduled_remove_inactive_users.py` in a scheudled manner to remove inactive users.

### Setting up firebase:

For localhost download your credentials json from firebase, place in root folder and rename to `firebase_cred.json`.  
In production, make sure credentials are placed inside os enviroment variables for whatever OS running.


## Gettings started python specific

### vscode extensions
Python   
Pylint

Start venv in terminal (bash)
```
py -m venv venv
source venv/Scripts/activate
```
Installing requirements and deactivating
```
pip install -r requirements.txt
deactivate
```

If vscode fails to lint etc, select the virtual environment as the interpreter
```
ctrl+shift+p
python select interpreter
venv/Scripts/python  
```
To enable vscode formatting add this to user settings JSON
```
"python.formatting.autopep8Args": ["--max-line-length", "120", "--experimental"],
```

Update requirements

```
pip install pip-upgrader
```

```
pip-upgrade
```