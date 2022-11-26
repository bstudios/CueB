import json

def getConfigDict():
    try:
        returnDict = json.loads(getConfigJson())
    except:
        returnDict = {}
    return returnDict

def getConfigJson():
    try:
        f = open("config.json", "r")
        returnText = f.read()
        f.close()
    except:
        returnText = ""
    return returnText

def setConfig(key, value):
    configDict = getConfigDict()
    configDict[key] = value
    f = open("config.json", "w")
    f.write(json.dumps(configDict))
    f.close()

def getConfig(key):
    configDict = getConfigDict()
    try:
        return configDict[key]
    except:
        return None

def deleteConfig():
    f = open("config.json", "w")
    f.write("")
    f.close()