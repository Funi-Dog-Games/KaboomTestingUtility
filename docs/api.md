# API
The API can be used to interface with sessions, but it is currently limited to just ending them.
### GET /lb
> Returns the leaderboard

Example response
```json
[
    {
        "uid": "1",
        "time": 100,
        "placement": 1
    }
]
```
### POST /time
> Returns the time of a certain person

Body params
- uid: Discord user ID

Example response
```json
{
    "success": true,
    "data": {
        "hours": 5,
        "minutes": 8,
        "seconds": 2
    }
}
```

### POST /end
> End the user's active session

Body paras
- uid: Discord user ID

Example response
```json
{
    "success": true,
    "message": "Ended"
}
```