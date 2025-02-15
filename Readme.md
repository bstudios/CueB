# CueB Gen 2 - version 8 onwards

This is the code for the CueB Gen 2. It is a different architecture to [Gen 1](https://github.com/bstudios/CueB/tree/Gen1), and is based on networked outstations which are W5500 EVB Raspberry Pi Pico boards from Wiznet.

The code is split into three parts:

- `device` - the code that runs on the Pico outstation, in Micropython
- `server` - an electron app, which serves a web interface and communicates with the outstations
- `client` - a React web interface, which is served by the server

## Communication with Outstations

Communication between the server and the outstations is over OSC. Only one server can exist within a given subnet, as the outstations rely on keeping track of what they think the server's state is.

### Outstation States

Each individual outstation is responsible for managing its own state, and the server communicates with each outstations to confirm its state.

There are two ways of changing the state of a outstation. Outstations always boot with a state of 1.

| State Number | State Name             | Red Button LED 🔴 | Green Button LED 🟢 | Remarks                                       |
| ------------ | ---------------------- | ----------------- | ------------------- | --------------------------------------------- |
| 0            | Error                  |                   |                     | Outstation boots in this state                |
| 1            | Ready                  |                   |                     | Outstation is idle                            |
| 2            | Unacknowledged Standby | ⚡                |                     | DSM is waiting for acknowledgement of standby |
| 3            | Acknowledged Standby   | 🔴                |                     | Outstation has acknowledged                   |
| 4            | Unacknowledged Go      |                   | ⚡                  | (not used)                                    |
| 5            | Acknowledged Go        |                   | 🟢                  | Will auto-reset after configured time         |
| 6            | Panic/Vegas            | 🔴                | 🟢                  | User trying to get attention of DSM           |
| 7            | Identify/Flash         | ⚡                | ⚡                  | To identify an outstation                     |

### Outstation changes own state

If a user presses a button on a outstation, this will change its state. The outstation will then broadcast its new state to the server, which will confirm it.

```mermaid
sequenceDiagram
  participant Outstation
  participant Server
  Note right of Outstation: User presses button
  Outstation->>Server: /cueb/outstationState
  Note left of Server: Two arguments: state and outstation unique ID
  loop Until acknowledged
    Outstation->>Server: /cueb/outstationState/confirmInSync
    Note left of Server: Two arguments: state and outstation unique ID
  end
  Server->>Outstation: /cueb/outstationState/confirmInSync
  Note right of Outstation: One argument: state.
```

### Server changes outstation state

The server can send a message to change a outstation's state. The outstation will confirm that it has received the new state.

```mermaid
sequenceDiagram
  participant Client
  participant Server
  participant Outstation
  Client->>Server: User presses button
  Server->>Outstation: /cueb/outstationState
  Note right of Outstation: On argument: state
  Outstation->>Server: /cueb/outstationState
  Note left of Server: Two arguments: state and outstation unique ID
```

### Ping/Pong messages

The server can send a ping message to the outstation, which will reply with a pong message. This is used to check if the outstation is still connected to the network.

```mermaid
sequenceDiagram
  participant Server
  participant Outstation
  Server->>Outstation: /cueb/ping
  Note right of Outstation: No arguments
  Outstation->>Server: /cueb/pong
  Note left of Server: One argument: outstation unique ID
```

### Determining the state of a outstation

The server can, at any time, ask a outstation to transmit its state.

```mermaid
sequenceDiagram
  participant Server
  participant Outstation
  Server->>Outstation: /cueb/outstationState
  Note right of Outstation: No arguments
  loop Until acknowledged
    Outstation->>Server: /cueb/outstationState/confirmInSync
    Note left of Server: Two arguments: state and outstation unique ID
  end
  Server->>Outstation: /cueb/outstationState/confirmInSync
  Note right of Outstation: One argument: state.
```

## Client / Server code

## Updating

- Bump package.json version for client & server
- Commit to gen2 branch and push
- Create and publish a new release
- (Github action will add files to release)

## Outstation status lights

| LED State | Color | Status                                              |
| --------- | ----- | --------------------------------------------------- |
| On        | 🔴    | Connected to network, and has IP                    |
| On        | 🟡    | Received message from server in last 5 seconds      |
| Flashing  | 🔴    | Disconnected from network                           |
| Flashing  | 🟡    | No messages received from server in last 10 seconds |
| Off       | 🔴    | No network                                          |
| Off       | 🟡    | No messages received from server in last 10 minutes |

## Tracking deployed outstations

List of outstations produced is in the wiki: https://github.com/bstudios/CueB/wiki
