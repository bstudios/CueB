import json

def getConfigStructureAndDefaults():
    return {
        "name": {
            "default": "cueb",
            "name": "Device Name"
        },
        "osc-sendport": {
            "default": "27900",
            "name": "OSC Send Port"
        },
        "osc-recieveport": {
            "default": "27900",
            "name": "OSC Recieve Port"
        },
        
    }

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
    configStructureAndDefaults = getConfigStructureAndDefaults()
    if str(key) in configStructureAndDefaults:
        configDict = getConfigDict()
        configDict[str(key)] = str(value)
        f = open("config.json", "w")
        f.write(json.dumps(configDict))
        f.close()

def getConfig(key):
    key = str(key)

    configDict = getConfigDict()
    try:
        return str(configDict[key])
    except:
        pass
    
    defaultConfigDict = getConfigStructureAndDefaults()
    return str(defaultConfigDict[key])

def deleteConfig():
    f = open("config.json", "w")
    f.write("")
    f.close()