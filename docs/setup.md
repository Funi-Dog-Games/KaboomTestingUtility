# Setup
If you wish to set this up youself, you will need a few things
- Mongo db instance with 3 collections
    - One for sessions (Threads Collection)
    - One for reviewers (Reviewers Collection)
    - One for users (Users Collection)
- Discord bot token
    - Obtainable [here](https://discord.com/developers)
- A discord server
> If you wish to have commands enabled globally, you will need to change some stuff in [deploy-commands.js](../modules/deploy-commands.js)

Rename `.env.dist` to `.env` and fill in every field with the information collected above.
> A great tutorial for node-js mongodb setup can be found [here](https://www.youtube.com/watch?v=DjlXcwUQTMY), a free instance can be used, or a payed one if you're willing to spend some money

## Configuration
The bot is quite configurable, all aspects are basically handled by the `.env` though.
### Quota
If you wish you set an hours quota, you may do so by going into [configuration/quota.json](../configuration/quota.json) and setting the `hours` variable to a positive integer