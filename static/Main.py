# an object of WSGI application 
from flask import Flask, send_from_directory


app = Flask(__name__)   # Flask constructor 
  
# A decorator used to tell the application 
# which URL is associated function 

@app.route("/")
def mainpage():
     return send_from_directory("static", "index.html")
  
if __name__=='__main__': 
   app.run(host="0.0.0.0", port=80)