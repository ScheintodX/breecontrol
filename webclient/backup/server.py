#!/usr/bin/python3

import os, sys, time

import pwd
home = pwd.getpwuid(os.getuid()).pw_dir
version = sys.version_info

# Include pip installed packages
libs = "%s/.local/lib/python%d.%d/site-packages" % ( home, version.major, version.minor )
if not libs in sys.path:
    sys.path.append( libs )

#import sys
#import os
from cgi import parse_qs, escape

from datetime import datetime

import json

import paho.mqtt.client as paho

# mydir = os.path.dirname(__file__)
# 
# This does not reload correctly:
#
#if not mydir in sys.path:
#    sys.path.append( mydir )
#
#from boiler import Boiler

class Boiler:

    def __init__( self ):

        self._state = {

            'jackets': {
                'upper': {
                    'act': 298,
                    'set': 300,
                    'power': .5,
                    'on': True
                },
                'lower': {
                    'act': 198,
                    'set': 200,
                    'power': 1,
                    'on': False
                }
            },
                'temp': {
                    'act': 67.5,
                    'set': 74.0
                },
                'fill': 0.4,		#0..1
                'aggitator': 1		#0..1
        }

        self._script = {
            'name': u'Grießer Böckchen',
            'start': '2015-12-15T07:12:13.12345',
            'elapsed': 3323, #s
            'remaining': 8352, #s
            'mode': 'heating',
            'steps': [
                { 'action': 'heat', 'temp': 65.0 },
                { 'action': 'hold', 'time': 2700 },
                { 'action': 'heat', 'temp': 87.0 },
                { 'action': 'hold', 'time': 2700 },
                { 'action': 'heat', 'temp': 100 },
                { 'action': 'hold', 'time': 2700 }
            ],
            'current': {
                'index': 3,
                'elapsed': 900, #s
                'remaining': 1800 #s
            }
        }


    def state( self ):

        return self._state


    def script( self ):

        return self._script


def countCalls():

    global calls

    try:
        calls += 1
    except NameError:
        calls = 0

    return calls


def on_connect( client, userdata, flags, rc ):

    print("Connected with result code " + str(rc))

    client.subscribe("#")

def on_message(client, userdata, msg):

    print(str(time.time())+ " " +msg.topic + " " + str(msg.payload))

def mqttConnect():

    if not 'client' in globals():

        global client

        client = paho.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        client.username_pw_set("apache", password="dBPg09K6U34m")
        client.connect("127.0.0.1", 1883, 60)
        client.loop_start()


def application( environ, start_response ):

    start = datetime.now()

    parameters = parse_qs( environ.get( 'QUERY_STRING', '' ) )

    #if 'subject' in parameters:
    #    subject = escape( parameters['subject'][0] )
    #else:
    #    subject = 'World'

    b1 = Boiler()

    result = {

        'date': start.isoformat(),
        'calls': countCalls(),
        'boilers': [ {
            'state': b1.state(),
            'script': b1.script()
        } ],
        'took': (datetime.now()-start).total_seconds()
    }

    start_response( '200 OK', [ ('Content-Type', 'application/json;charset=utf-8') ] )

    return [ json.dumps( result, indent=4 ) ]

