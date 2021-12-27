//get ready for code worse than yandere simulator
"use strict"
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES] });
const fs = require('fs');

//thigns to manually change 
const token = process.argv[2]
const prefix = '!'
const adminId = ['691864484079337543', '501587282395004929']
const helpMessages = {
    'prefix': `Crapbot (c) 2021 Weiyi Jiang.
**-I am a very crappy bot made by a 15 year old. I am very buggy. Please use me with caution-**
❌ = In development command, may be buggy\n`,
    'categories': '\`economy, admin, general\`',
    'economy': `**ECONOMY**
\`work\`: Work to earn some money (5 stamina)
\`richest\` [optional number]: List the richest players. If a number is entered, then it will list that many players.
\`buy\` [item|"list"] [optional quantity]: Buys a specified item or list all items avaliable to purchase.
\`pay\` [mention|username] [amount]: Pays someone money
\`daily\`: claim your daily reward
\`learn\` [place|"list"]: Go somewhere to learn so you can earn XP (5 stamina).
\`piracy\`: Sick of earning money the legitimate way? pirate and distribute the latest film for a lot of money (3 stamina)!
\`arson\`: Burn down a random player's house (15 stamina).
\`bribe\`: Bribe a politician for lower tax rates for one day (3 stamina).
\`trader\` ['buy'|'list'] [item] ❌: The wandering trader periodically restocks his trades.
\`inventory\` ['list'|'use'] [item]❌: Lists your inventory, or uses an item from your inventory`,

    'admin': `**ADMINISTRATION**
These commands are only avaliable to the admin whose ID exists within the index.js file
\`clearall\`: USE WITH CAUTION, will delete EVERYONE's data
\`save\`: saves the database
\`allusers\`: Outputs everyone in the database
\`setMoney\` [userId, money]: sets the money of a specified user to the money count
\`addallowedchannel\`: add a channel to the list of channels that CrapBot is allowed to operate on
\`removeallowedchannel\`: guess what this does
\`ban\` [user]: Bans a specific user.
\`unban\` [user]: Guess what this does`,

    'general': `**GENERAL**
\`changepronoun\` [pronoun]: Change your pronoun. Pronoun must be between 2 - 8 characters and only contain letters.
\`info\`: Displays some basic information about you.
\`help\`: You've already stumbled upon this command I think you know what this does.
\`watchMessage\` [message]: Watch when a user sends this message containing this phrase. When this happens. Ialert you with a DM. Message can include spaces
\`removeWatch\`: Stop watching this message
\`ping\`: Respondes with 'pong' and your latency.
\`love\` [thing]: Do you love something and want the world to know how much you love it? Use this command!
\`mostLoved\`: see the top 5 most loved thing by all users of CrapBot
\`echo\`: crapbot will say what you say!`
}
let db
const dbDefault = {
    messagesWatched: {},
    adminData: {
        devMode: false,
        stuffOwned: {
            computer: {
                value: 1
            },
            house: {
                value: 10
            },
            mansion: {
                value: 1200
            }
        },
        mostloved: {},
        banned: {},
        allowedChannels: []
    }
}
function cloneDB(input) {
    let output = {}
    for (let item in input) {
        if (typeof input[item] !== 'object') {
            output[item] = input[item]
        } else {
            if (Object.keys(input[item]).length > 0) {
                console.log(Object.keys(input[item]).length)
                output[item] = cloneDB(input[item])
            } else {
                output[item] = input[item]
            }
        }
    }
    return output
}
let mathInProgress = {}
function readDB() {
    console.log("Reading database...")
    return new Promise((resolve, reject) => {
        fs.readFile('./basicDB.txt', 'utf-8', (error, data) => {
            if (error) {
                console.log(error.message)
            }
            if (!data) {
                console.log("No data detected in DB!")
                console.log('Creating database...')
                data = JSON.stringify(cloneDB(dbDefault))
            }
            try {
                resolve(JSON.parse(data))
            } catch (e) {
                console.log(`WARNING: Unable to parse JSON (${e.message}). *THE BOT WILL MOST LIKELY CRASH!*`)
            }
        })
    })
}
let experiences = {

}
let usersWithoutPronouns = []
//why use many lines when you can use one?
const save = _ => fs.writeFile('./basicDB.txt', JSON.stringify(db, null, 1), (error) => error ? console.log(error.message) : console.log(`Saved Database at ${timeConverter(new Date().getTime() / 1000)}`))
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}
readDB().then(results => {
    console.log("Loaded database!")
    db = results
    setInterval(save, 90 /*change number on left for more readable seconds*/ * 1000)
    setInterval(() => {
        for (const item in db.adminData.stuffOwned) {
            for (const user in db.adminData.stuffOwned[item]) {
                if (user !== 'value') db[user].money += db.adminData.stuffOwned[item][user] * db.adminData.stuffOwned[item].value
            }
        }
    }, 1000)
    function commentNo(a) {
        a = a.toString().split('')
        let output = []
        let tempSliced = []
        if (a.includes('.')) {
            let index = a.indexOf('.')
            let spliceCount = a.length - index
            tempSliced = a.splice(index, spliceCount)
            a.splice(index, spliceCount)
        }
        for (let i = a.length - 1; i >= 0; i--) {
            if (Math.abs(a.length - 1 - i) % 3 == 0) {
                output.unshift(`,`)
                output.unshift(a[i])
            } else {
                output.unshift(a[i])
            }
        }
        output.pop()
        return output.join('').concat(tempSliced.join(''))
    }
    const traderItems = [
        {
            name: 'Potion of Instant Stamina',
            description: 'Instantly gives you 500 stamina, regardless of your stamina cap!',
            customCode:`
                messageAuthor.stamina.current += 500
                message.channel.send(\`You successfully consumed a potion and now have \${messageAuthor.stamina.current} stamina.\`)
            `,
            costDefault: 7500,
            costVariation: 0.2
        },
        {
            name: 'Potion of Instant Knowledge',
            description: 'Instantly gives you 50,000 EXP',
            customCode:`
                messageAuthor.expToNextLevel -= 50000
                message.channel.send(\`You successfully consumed the knowledge!\`)
            `,
            costDefault: 5000,
            costVariation: 0.5
        }
    ]
    let traderInStock = []
    function traderIncludesItem(name) {
        for (let i = 0; i < traderInStock.length; i++) {
            if (traderInStock[i].name == name) return true
        }
        return false
    }
    function restockTrader() {
        const traderItemCount = 2
        for (let i = 0; i < 2; i++) {
            let item
            do {
                item = traderItems[Math.floor(Math.random() * traderItems.length)]
            } while (traderIncludesItem(item.name))
            traderInStock.push(cloneDB(item))
            traderInStock[traderInStock.length - 1].cost = Math.floor(item.costDefault + Math.random() * item.costVariation)
            traderInStock[traderInStock.length - 1].quantity = Math.floor(Math.random() * 7) + 3
        }
    }
    restockTrader()
    setInterval(restockTrader, 120 * 1000)
    function explicitFilter(e) { //returns false if a word is inapporiate
        return !/penis|vagina|fuck|bitch|ass|shit|regextest|nigg(a|er)/.test(e)
    }
    const pronounRegex = /^(?!.*(penis|vagina|fuck|bitch|ass|shit|regextest|nigg(a|er)))(?=[a-z]{2,10})(?![a-z]{11,})(?!\s)/i
    const verifyPronoun = e => pronounRegex.test(e)
    function listItemsFromArray(e) {
        let message = ''
        for (let i = 0; i < e.length; i++) {
            message += `**${e[i].name}** ($${e[i].cost})
${e[i].description}
${e[i].quantity} remaining\n`
        }
        if (!message) message = "Empty!"
        return message
    }
    let quicktimeTypeInProgress = false
    let quicktimeTypePhrase
    let quicktimeTimeout
    let tooSlow
    client.on('messageCreate', message => {
        try {
            let userBanned
            let userBannedReason
            for (let user in db.adminData.banned) {
                if (message.author.id == user) {
                    userBanned = true
                    userBannedReason = db.adminData.banned[user]
                }
            }
            client.user.setActivity('Avaliable for you to rage at because this bot has terrible programming!')

            let channelAllowed = true
            if (db.adminData.allowedChannels.length >= 1) {
                if (!db.adminData.allowedChannels.includes(message.channel.id)) {
                    channelAllowed = false
                }
            }
            if (channelAllowed) {
                function askQuestion() {
                    for (let user in mathInProgress) {
                        let question = `${Math.floor(Math.random() * 10)} ${['+', '-', '*'][Math.floor(Math.random() * 3)]} ${Math.floor(Math.random() * 10)}`
                        mathInProgress[user].expectedResponse = eval(question)
                        message.channel.send(question)
                        tooSlow = setTimeout(() => {
                            let messageChannel = message.channel
                            messageChannel.send("TOO SLOW")
                            db[user].money += mathInProgress[user].moneyEarned
                            messageChannel.send(`You earned $${mathInProgress[user].moneyEarned}`)
                            delete mathInProgress[user]
                        }, 7500)
                    }
                }
                for (let user in mathInProgress) {
                    if (message.author.id == user) {
                        if (parseInt(message.content.match(/-*[0-9]+/)[0]) == mathInProgress[user].expectedResponse) {
                            message.channel.send("CORRECT")
                            mathInProgress[user].moneyEarned += mathInProgress[user].stage * 20
                            clearTimeout(tooSlow)
                            askQuestion()
                        } else {
                            message.channel.send("incorrect")
                            db[user].money += mathInProgress[user].moneyEarned
                            message.channel.send(`You earned $${mathInProgress[user].moneyEarned}`)
                            clearTimeout(tooSlow)
                            delete mathInProgress[user]
                        }
                    }
                }
                if (!message.author.bot) {
                    for (let thing in db.messagesWatched) {
                        db.messagesWatched[thing].messagesToWatch.forEach(e => {
                            try {
                                if (message.content.toLowerCase().includes(e.toLowerCase()) && !message.content.includes('removeWatch')) {
                                    client.users.cache.get(thing).send(`User **${message.author.username}** has sent the phrase **${e}** in the message **${message.content}** on **${timeConverter(message.createdTimestamp / 1000)}**`)
                                }
                            } catch { }
                        })
                    }
                    //if we DONT have information for a user, then create an object for that user
                    if (!db.hasOwnProperty(message.author.id)) {
                        let datetest1 = new Date()
                        db[message.author.id] = {
                            'pingCount': 0,
                            'messageCount': 0,
                            'money': 100,
                            'netWorth': 100,
                            'level': 1,
                            'expToNextLevel': Math.ceil((1 ** 2) / 2 + 15),
                            'pronoun': null,
                            'username': message.author.username,
                            'timesWorked': 0,
                            'lastLogon': null,
                            'lastPiracy': null,
                            'lastPaidTax': datetest1.getDate(),
                            'taxRate': 0.15,
                            'taxMultiplier': 1,
                            'lastArson': 0,
                            'bribed': false,
                            'stamina': {
                                'current': 100,
                                'max': 100,
                                'gainMultiplier': 1,
                                'useMultiplier': 1
                            },
                            'inventory': []
                        }
                    }
                    //backwards compadibility by adding in keys not from previous versions

                    //wow such empty


                    let messageAuthor = db[message.author.id]
                    if (usersWithoutPronouns.includes(message.author.username)) {
                        if (verifyPronoun(message.content)) {
                            usersWithoutPronouns.splice(usersWithoutPronouns.indexOf(message.author.username), 1)
                            messageAuthor.pronoun = message.content
                            message.channel.send(`Chaged ${message.author.username}'s pronoun to ${messageAuthor.pronoun}`)
                        } else {
                            message.channel.send(
                                `${message.content} is not a valid pronoun. Pronouns must be between 2 and 10 characters and not contain any inapporporiate words (pronoun must match regex \`${new String(pronounRegex)}\`).`)
                        }
                    }

                    if (!messageAuthor.pronoun && !usersWithoutPronouns.includes(message.author.username)) {
                        usersWithoutPronouns.push(message.author.username)
                        message.channel.send(`Hello, ${message.author.username}. Welcome! What are your pronouns? I'm doing this so I won't get sued by some obscure LGBTQ+ movement somewhere on earth.`)
                    }

                    let sorted = []

                    if (message.content.startsWith(prefix)) {
                        function drawStaminaBar() {
                            const barSize = 20
                            const eachBarWorth = messageAuthor.stamina.max / barSize
                            const barsFilled = messageAuthor.stamina.current / eachBarWorth
                            let output = ''
                            for (let i = 0; i < barSize; i++) {
                                if (i < Math.floor(barsFilled)) {
                                    output += '█'
                                } else if (i - barsFilled < 0) {
                                    output += '▓'
                                } else {
                                    output += '░'
                                }
                            }
                            return output
                        }
                        const sendStaminaStats = required => message.channel.send(`You do not have enough stamina! You have ${messageAuthor.stamina.currrent} when ${required} is needed
${drawStaminaBar()}`)
                        function checkStamina(amount) {
                            //check if the stamina is enough, and if it is, subtract that stamina from the player's
                            if (messageAuthor.stamina.current - amount * messageAuthor.stamina.useMultiplier) {
                                messageAuthor.stamina.current -= amount * messageAuthor.stamina.useMultiplier
                                return true
                            }
                            sendStaminaStats(5)
                            return false
                        }
                        if (!userBanned) {
                            //paying tax
                            let date = new Date()
                            if (messageAuthor.lastPaidTax != date.getDate()) {
                                //determine a person's tax bracket by their net worth
                                //yanderedev can you please hire me
                                if (messageAuthor.money < 10000) {
                                    messageAuthor.taxRate = .1
                                } else if (messageAuthor.money < 200000) {
                                    messageAuthor.taxRate = .15
                                } else if (messageAuthor.money < 1000000) {
                                    messageAuthor.taxRate = .2
                                } else if (messageAuthor.money < 2000000) {
                                    messageAuthor.taxRate = .25
                                } else if (messageAuthor.money < 10000000) {
                                    messageAuthor.taxRate = .3
                                } else {
                                    messageAuthor.taxRate = .35
                                }
                                messageAuthor.lastPaidTax = date.getDate()
                                let amountToPay = messageAuthor.money * messageAuthor.taxRate * messageAuthor.taxMultiplier
                                if (messageAuthor.bribed) amountToPay = amountToPay / 2
                                messageAuthor.money -= amountToPay
                                messageAuthor.netWorth -= amountToPay

                                message.channel.send(`Welcome to a new day! You paid $${commentNo(amountToPay)} in taxes because the Government loves you. You now have $${commentNo(messageAuthor.money)} remaining. Your tax rate is ${Math.round(messageAuthor.taxRate * messageAuthor.taxMultiplier * 100)}%.`)
                                messageAuthor.bribed = false
                            }
                            let parsedMessage = []
                            //regex to remove mroe than 1 space between letters
                            let unparsedMessage = message.content.replaceAll(/(?<=\s)\s/g, '').split('')
                            unparsedMessage.splice(0, 1) //remove exclamination mark at start of message
                            while (unparsedMessage.length > 0) {
                                let nextSpliceIndex
                                let str
                                //special characters ' " and `
                                //these characters will be what is used to separate arguments in a command
                                //these work exactly just as you would expect
                                //eg: !buy "test1 test2" 10 goes into 'buy', 'test1 test2', and '10'
                                const specialChars = ['"', '\'', '`']
                                specialChars.includes(unparsedMessage[0]) ? str = unparsedMessage[0] : str = ' '
                                for (let i = 1; i < unparsedMessage.length; i++) {
                                    if (unparsedMessage[i] == str) {
                                        nextSpliceIndex = i
                                        break
                                    }
                                }
                                //if we are unable to detect a space or quotation mark, then we must be at the end of the message
                                //so use the length of the message for splice()
                                if (!nextSpliceIndex) nextSpliceIndex = unparsedMessage.length - 1
                                parsedMessage.push(unparsedMessage.splice(0, nextSpliceIndex + 1).join('').replaceAll(/'|"|^\s|\s$/g, ''))
                            }
                            function listAllChannels() {
                                let allChannels = message.guild.channels.cache.filter(e => e.type == 'GUILD_TEXT')
                                //I'm so sorry but it's the only way i can get it working
                                return JSON.parse(JSON.stringify(allChannels))
                            }
                            if (adminId.includes(message.author.id)) {
                                //admin debug commands
                                switch (parsedMessage[0].toLowerCase()) {
                                    case 'setmoney':
                                        let userId = parsedMessage[1].match(/\d+/)[0]
                                        let moneyToSet = parseInt(parsedMessage[2].match(/[0-9]+/)[0])
                                        if (db.hasOwnProperty(userId)) {
                                            let netWorthGain = parseInt(moneyToSet) - db[userId].money
                                            db[userId].money = moneyToSet
                                            db[userId].netWorth += netWorthGain
                                            message.channel.send(`User with id ${userId} now has $${commentNo(Math.round(db[userId].money * 100) / 100)} (total net worth ${db[userId].netWorth})`)
                                        } else {
                                            message.channel.send(`${parsedMessage[1]} not found!`)
                                        }
                                        break
                                    case 'setpronoun':
                                        if (!parsedMessage[1] || !parsedMessage[2]) {
                                            message.channel.send("Please use the command in the following format:\n !setpronoun [user] [pronoun]. [user] should be a mention.")
                                        } else {
                                            let personToChange = parsedMessage[1].match(/[0-9]+/)[0]
                                            let pronoun = parsedMessage[2]
                                            db[personToChange].pronoun = pronoun
                                            message.channel.send(`Changed pronoun for user with id ${personToChange} to ${pronoun}`)
                                        }
                                        break
                                    case 'addallowedchannel':
                                        let channelValid = false
                                        let allChannels = listAllChannels()

                                        for (let i = 0; i < allChannels.length; i++) {
                                            if (allChannels[i].name.toLowerCase() == parsedMessage[1].toLowerCase()) {
                                                channelValid = true
                                                db.adminData.allowedChannels.push(allChannels[i].id)
                                                message.channel.send(`Added channel ${allChannels[i].name} with id ${allChannels[i].id} to allowed channels list.`)
                                                break
                                            }
                                        }
                                        if (!channelValid) {
                                            message.channel.send("Channel does not exist on server.")
                                        }
                                        break
                                    case 'removeallowedchannel':
                                        let channelValidremove = false
                                        let allChannelsremove = listAllChannels() //I'm so sorry but it's the only way i can get it working
                                        for (let i = 0; i < allChannelsremove.length; i++) {
                                            if (allChannelsremove[i].name.toLowerCase() == parsedMessage[1].toLowerCase()) {
                                                channelValidremove = true
                                                db.adminData.allowedChannels.splice(db.adminData.allowedChannels.indexOf(allChannelsremove[i].id), 1)
                                                message.channel.send(`Removed channel ${allChannelsremove[i].name} with id ${allChannelsremove[i].id} from allowed channels list.`)
                                                break
                                            }
                                        }
                                        if (!channelValidremove) {
                                            message.channel.send("Channel does not exist on server.")
                                        }
                                        break
                                    case 'ban':
                                        let user = parsedMessage[1]
                                        if (user.match(/<@![0-9]+>/)[0]) {
                                            user = user.match(/[0-9]+/)
                                        }
                                        let reason = parsedMessage[2]
                                        db.adminData.banned[user] = reason
                                        if (!reason) reason = `because ${message.author.username} doesn't like you (or, more likely, is testing out the !ban command code)`
                                        message.channel.send(`Banned user ${reason}`)
                                        break
                                    case 'unban':
                                        try {
                                            let user = parsedMessage[1]
                                            user = user.match(/\d+/)
                                            //if (user.match(/<@!\d+>/)) {
                                            //    user = user.match(/\d+/)
                                            //}
                                            message.channel.send(`Successfully unbanned user with id ${user}`)
                                            delete db.adminData.banned[user]
                                        } catch (e) {
                                            message.channel.send(`Error unbanning user (${e.message}), probably because the user was never banned.
Please ensure that you're using a mention to unban a user.`)
                                        }
                                        break
                                    case 'clearall':
                                        db = cloneDB(dbDefault)
                                        save()
                                        message.channel.send("Cleared DB! Exiting process...").then(_ => process.exit())
                                    case 'toggledevmode':
                                        try {
                                            if (!db.hasOwnProperty('devMode')) {
                                                db.adminData.devMode = false
                                            }
                                            if (db.adminData.devMode == false) {
                                                db.adminData.devMode = true
                                                client.user.setActivity('Currently debugging! Please do not use')
                                            } else {
                                                db.adminData.devMode = false
                                                client.user.setActivity('Avaliable for you to rage at because this bot has terrible programming!')
                                            }
                                            message.channel.send('Toggled dev mode')
                                        } catch { }
                                        break
                                    case 'save':
                                        save()
                                        message.channel.send('Saved database')
                                        break
                                    case 'shutdown':
                                        message.channel.send('Shutting down!')
                                        process.exit()
                                    case 'allusers':
                                        for (let item in db) {
                                            if (item !== 'messagesWatched') {
                                                message.channel.send(JSON.stringify(db[item]))
                                            }
                                        }
                                }
                            } else {
                                const adminCommands = ['allusers', 'shutdown', 'save', 'toggledevmode', 'unban', 'ban', 'removeallowedchannel', 'addallowedchannel',
                                    'setpronoun', 'setmoney']
                                if (adminCommands.includes(parsedMessage[0].toLowerCase())) message.channel.send("Hey, you're not an admin! What are you doing?")
                            }
                            switch (parsedMessage[0].toLowerCase()) {
                                case 'watchmessage':
                                    if (!db.messagesWatched.hasOwnProperty(message.author.id)) {
                                        db.messagesWatched[message.author.id] = {
                                            userObject: message.author,
                                            messagesToWatch: []
                                        }
                                    }
                                    parsedMessage.shift()
                                    let phrase = parsedMessage.join(' ')

                                    db.messagesWatched[message.author.id].messagesToWatch.push(phrase.toLowerCase())
                                    message.channel.send(`Watching phrase **${phrase}**`)
                                    break
                                case 'removewatch':
                                    if (!db.messagesWatched.hasOwnProperty(message.author.id)) {
                                        db.messagesWatched[message.author.id] = {
                                            userObject: message.author,
                                            messagesToWatch: []
                                        }
                                    }
                                    const previousLength = db.messagesWatched[message.author.id].messagesToWatch.length
                                    parsedMessage.shift()
                                    let stopWatchingPhrase = parsedMessage.join(' ').toLowerCase()

                                    if (db.messagesWatched[message.author.id].messagesToWatch.indexOf(stopWatchingPhrase) !== -1) {
                                        db.messagesWatched[message.author.id].messagesToWatch.splice(db.messagesWatched[message.author.id].messagesToWatch.indexOf(stopWatchingPhrase), 1)
                                        message.channel.send(`Removed message **${stopWatchingPhrase}** from watchlist!`)
                                    } else {
                                        message.channel.send('Watchlist does not include message')
                                    }
                                    break
                                case 'echo':
                                    parsedMessage.shift()
                                    if (parsedMessage.length > 0) message.channel.send(parsedMessage.join(' ').replaceAll(prefix, ''))
                                    break
                                case 'arson':
                                    if (checkStamina(15)) {
                                        let arsonDate = new Date()
                                        let now = arsonDate.getTime()
                                        if (now - parseInt(messageAuthor.lastArson) > 240000) {
                                            let allPlayers = Object.keys(db.adminData.housesOwned)
                                            allPlayers.splice(allPlayers.indexOf(message.author.id), 1)
                                            message.channel.send(JSON.stringify(allPlayers))
                                            allPlayers = allPlayers.filter(e => db.adminData.housesOwned[e] >= 100)
                                            if (allPlayers.length >= 1) {
                                                messageAuthor.lastArson = now
                                                let player = allPlayers[Math.floor(Math.random() * allPlayers.length)]
                                                db.adminData.housesOwned[player]--
                                                message.channel.send(`You burned down ${db[player].username}'s house. ${db[player].username} now has ${db.adminData.housesOwned[player]} houses.`)
                                            } else {
                                                message.channel.send("You have noone to arson apart from yourself.")
                                            }
                                        } else {
                                            message.channel.send("Please wait a while longer before arsoning or you'll get caught by the police!")
                                        }
                                    }
                                    break
                                case 'math':
                                    if (messageAuthor.money < 500) {
                                        message.channel.send("Not enough money to enter the competitation!")
                                    } else {
                                        messageAuthor.money -= 500
                                        mathInProgress[message.author.id] = {
                                            'level': 1,
                                            'moneyEarned': 1,
                                            'stage': 1,
                                            'expectedResponse': null,
                                        }
                                        askQuestion()
                                    }
                                    break
                                case 'pay':
                                    let userToPay
                                    let amount
                                    if (parsedMessage[1] != undefined) {
                                        if (parsedMessage[1].match(/<@![0-9]+>/)) {
                                            userToPay = db[parsedMessage[1].match(/[0-9]+/)]
                                        }
                                        for (let item in db) {
                                            if (db[item].hasOwnProperty('username')) {
                                                if (db[item].username.toLowerCase() == parsedMessage[1].toLowerCase()) {
                                                    userToPay = db[item]
                                                    break
                                                }
                                            }
                                        }
                                        if (!userToPay) {
                                            message.channel.send(`User ${parsedMessage[1]} not found!
-This may have happened because they never used CrapBot
-If you're NOT using a mention (@), then make sure that you use a USERNAME, not a nickname`)
                                        } else {
                                            if (!parsedMessage[2]) {
                                                message.channel.send("Please specifiy the amount of money that should be paid")
                                            } else {
                                                amount = parseInt(parsedMessage[2].match(/[0-9]+/)[0])
                                                if (messageAuthor.money >= amount) {
                                                    messageAuthor.money -= amount
                                                    messageAuthor.netWorth -= amount
                                                    try {
                                                        userToPay.money += amount
                                                        userToPay.netWorth += amount
                                                        message.channel.send(`Paid ${userToPay.username} $${amount}`)
                                                    } catch (e) { message.channel.send(`Error in paying user (${e.message})`) }
                                                } else {
                                                    message.channel.send(`You do not have that much money! (Currently have $${messageAuthor.money})`)
                                                }
                                            }

                                        }
                                    } else {
                                        message.channel.send("You need to select a user to pay!")
                                    }
                                    break
                                case 'love':
                                    parsedMessage.shift()
                                    let thingloved = parsedMessage.join(' ').toLowerCase()
                                    if (explicitFilter(thingloved)) {
                                        if (!db.adminData.mostloved.hasOwnProperty(thingloved)) db.adminData.mostloved[thingloved] = 0

                                        if (thingloved.match(/\w/)) {
                                            db.adminData.mostloved[thingloved]++
                                            message.channel.send(`Loved ${thingloved}. ${thingloved} now has ${db.adminData.mostloved[thingloved]} loves`)
                                        } else {
                                            message.channel.send("Cannot love an empty string!")
                                        }
                                    } else {
                                        message.channel.send(`${thingloved} fails the explicit filter.`)
                                    }
                                    break
                                case 'mostloved':
                                    let quantity = parseInt(parsedMessage[1])
                                    console.log(quantity)
                                    if (!quantity) { quantity = 5; console.log('no') }
                                    for (let item in db.adminData.mostloved) {
                                        let allowPush = true
                                        if (sorted.length === 0) {
                                            sorted.push({ 'name': item, 'loveCount': db.adminData.mostloved[item] })
                                            allowPush = false
                                        }
                                        for (let i = 0; i < sorted.length; i++) {
                                            if (allowPush) {
                                                if (i == 0 && sorted[0].loveCount >= db.adminData.mostloved[item]) {
                                                    sorted.unshift({ 'name': item, 'loveCount': db.adminData.mostloved[item] })
                                                    break
                                                } else if (i == sorted.length - 1 && sorted[sorted.length - 1].loveCount <= db.adminData.mostloved[item]) {
                                                    sorted.push({ 'name': item, 'loveCount': db.adminData.mostloved[item] })
                                                    break
                                                } else if (i >= 1) {
                                                    if (sorted[i - 1].loveCount <= db.adminData.mostloved[item] && sorted[i].loveCount >= db.adminData.mostloved[item]) {
                                                        sorted.splice(i, 0, { 'name': item, 'loveCount': db.adminData.mostloved[item] });
                                                        break
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    let stringToSend = ''
                                    if (quantity > sorted.length) quantity = sorted.length
                                    for (let i = sorted.length - 1; i >= sorted.length - quantity; i--) {
                                        try {
                                            stringToSend += `${sorted.length - i}. ${sorted[i].name} ${sorted[i].loveCount} loves\n`
                                        } catch (e) { }
                                    }
                                    if (stringToSend) {
                                        message.channel.send(stringToSend)
                                    } else {
                                        message.channel.send("Noone has used the `love` command!")
                                    }
                                    break
                                case 'daily':
                                    let date = new Date()
                                    let currentTime = `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`
                                    if (messageAuthor.lastLogon !== currentTime) {
                                        messageAuthor.lastLogon = currentTime
                                        messageAuthor.money += 10000
                                        message.channel.send(`${message.author.username} claimed their daily reward of $10000!`)
                                    } else {
                                        message.channel.send("You've already claimed this reward!")
                                    }
                                    break
                                case 'piracy':
                                    if (db.adminData.stuffOwned.computer[message.author.id] > 0) {
                                        if (checkStamina(3)) {
                                            let date = new Date()
                                            let currentHour = `${date.getHours()} ${date.getDate()}`
                                            if (currentHour != messageAuthor.lastPiracy) {
                                                let moneyGained = Math.floor(Math.random() * 2500) + 5000 + messageAuthor.netWorth * 0.01
                                                messageAuthor.lastPiracy = currentHour
                                                messageAuthor.money += moneyGained
                                                messageAuthor.netWorth += moneyGained
                                                message.channel.send(`🏴‍☠️You pirated and distributed the newest film, and gained $${moneyGained}.`)
                                            } else {
                                                message.channel.send("There are no more movies for you to pirate and distribute!")
                                            }
                                        }
                                    } else {
                                        message.channel.send("You need at least one computer to engage in internet piracy!")
                                    }
                                    break
                                case 'buy':
                                    const thingsToBuy = {
                                        'computer': {
                                            price: 15000,
                                            'description': ':computer:**computer ($15000)**: give you ONE dollar a second. Can be purchased multiple times',
                                            condition: function () {
                                                return true
                                            }
                                        },
                                        'lottery': {
                                            price: 300,
                                            description: '**:tickets:Lottery($300)**: Gives you a small chance of winning big',
                                            condition: function (amount) {
                                                if (amount < 10000) return true
                                                message.channel.send("Buy limit for lottery is 10,000 to prevent lag.")
                                                return false
                                            },
                                            customCode: function (amount) {
                                                if (amount < 5) {
                                                    if (Math.random() < 0.004) {
                                                        messageAuthor.money += 7500
                                                        messageAuthor.netWorth += 7500
                                                        message.channel.send(`You won big! $7500 has been added to your account for a total of $${commentNo(messageAuthor.money)}`)
                                                    } else {
                                                        message.channel.send('Tough luck. You lost the lotto.')
                                                    }
                                                } else {
                                                    let wonLotteryTimes = 0
                                                    for (let i = 0; i < amount; i++) {
                                                        if (Math.random() < 0.04) wonLotteryTimes++
                                                    }
                                                    messageAuthor.money += wonLotteryTimes * 7500
                                                    messageAuthor.netWorth += wonLotteryTimes * 7500
                                                    message.channel.send(`You brought ${amount} lottery tickets. You won the lottery ${wonLotteryTimes} times and lost it ${amount - wonLotteryTimes}. $${commentNo(wonLotteryTimes * 7500)} has been added to your account.`)
                                                }
                                            }
                                        },
                                        'car': {
                                            price: 75000,
                                            condition: function () {
                                                if (messageAuthor.hasOwnProperty('ownCar')) {
                                                    message.channel.send('You already have a car!')
                                                    return false
                                                }
                                                return true
                                            },
                                            'description': '**🚗Car($75000)**: can only be brought once. Gives you a chance to pick up hitchhikers while working to earn some extra cash',
                                            customCode: function () {
                                                messageAuthor.ownCar = true
                                            }
                                        },
                                        'house': {
                                            price: 100000,
                                            condition: function () {
                                                return true
                                            },
                                            'description': '**🏠House($100,000)**: an expensive investment, but nets you $10 per second!',
                                        },
                                        'mansion': {
                                            price: 10000000,
                                            condition: function () {
                                                if (db.adminData.stuffOwned.house[message.author.id] >= 10) {
                                                    return true
                                                } else {
                                                    message.channel.send("The real estate agency said that you have to prove your worth before buying a mansion. Please purchase at least 10 houses")
                                                }
                                            },
                                            'description': '**🏛Mansion($10,000,000)**: even more expensive than houses, giving you $1200 per second!',
                                        }
                                    }
                                    if (parsedMessage[1]) {
                                        let quantity = parsedMessage[2]
                                        if (quantity === undefined) {
                                            quantity = 1
                                        } else {
                                            quantity = parseInt(quantity.match(/[0-9]+/)[0])
                                        }
                                        let madePurchase = false
                                        for (let item in thingsToBuy) {
                                            if (parsedMessage[1] == 'list') {
                                                let messageToSend = ''
                                                for (let item in thingsToBuy) {
                                                    messageToSend += `${thingsToBuy[item].description}\n`
                                                }
                                                message.channel.send(messageToSend)
                                                madePurchase = true
                                                break
                                            }
                                            if (parsedMessage[1].toLowerCase() == item) {
                                                madePurchase = true
                                                if (messageAuthor.money >= thingsToBuy[item].price * quantity) {
                                                    if (thingsToBuy[item].condition(quantity)) {
                                                        messageAuthor.money -= parseInt(thingsToBuy[item].price * quantity)
                                                        message.channel.send(`Success! You brought ${quantity} ${item}(s). You now have $${commentNo(Math.round(messageAuthor.money * 100) / 100)}.`)
                                                        if (thingsToBuy[item].hasOwnProperty('customCode')) {
                                                            thingsToBuy[item].customCode(quantity)
                                                        } else {
                                                            if (!db.adminData.stuffOwned[item].hasOwnProperty(message.author.id)) db.adminData.stuffOwned[item][message.author.id] = 0
                                                            db.adminData.stuffOwned[item][message.author.id] += quantity
                                                        }
                                                    }
                                                } else {
                                                    message.channel.send(`You do not have enough money to buy this item! Need $${commentNo(thingsToBuy[item].price * quantity - messageAuthor.money)} more.`)
                                                }
                                                break
                                            }
                                        }
                                        if (!madePurchase) {
                                            message.channel.send(`Cannot find ${parsedMessage[1]}`)
                                        }
                                    } else {
                                        message.channel.send("Please select something to buy!")
                                    }
                                    break
                                case 'help':
                                    let messageToSendHelp = helpMessages.prefix
                                    if (parsedMessage[1] != undefined) {
                                        if (helpMessages.hasOwnProperty(parsedMessage[1].toLowerCase())) {
                                            messageToSendHelp += helpMessages[parsedMessage[1].toLowerCase()]
                                        } else {
                                            messageToSendHelp += `Help message ${parsedMessage[1]} not found!`
                                        }
                                    } else {
                                        messageToSendHelp += `Please choose a category out of ${helpMessages.categories}`
                                    }
                                    message.channel.send(messageToSendHelp)
                                    break
                                case 'changepronoun':
                                    if (parsedMessage[1] == undefined) {
                                        message.channel.send('Please choose something for your pronoun.')
                                    } else {
                                        if (verifyPronoun(parsedMessage[1])) {
                                            messageAuthor.pronoun = parsedMessage[1]
                                            message.channel.send(`Changed pronoun for **${message.author.username}** to ${messageAuthor.pronoun}`)
                                        } else {
                                            message.channel.send(`Pronoun must be between 2 and 10 characters and not contain any inapporporiate words (pronoun must match regex \`${new String(pronounRegex)}\`).`)
                                        }
                                    }
                                    break
                                case 'inventory':
                                    switch (parsedMessage[1]) {
                                        case 'list':
                                            message.channel.send(listItemsFromArray(messageAuthor.inventory))
                                            break
                                        case 'use':
                                            let itemFound = false
                                            for (let i = 0; i < messageAuthor.inventory.length;i++) {
                                                if (messageAuthor.inventory[i].name.toLowerCase() == parsedMessage[2].toLowerCase()) {
                                                    itemFound = true
                                                    messageAuthor.inventory[i].quantity--
                                                    eval(messageAuthor.inventory[i].customCode)
                                                    if (messageAuthor.inventory[i].quantity <= 0) {
                                                        messageAuthor.inventory.splice(i,1)
                                                    }
                                                }
                                            }
                                            if (!itemFound) message.channel.send(`Item ${parsedMessage[2]} not found in inventory!`)
                                    }
                                    if (!parsedMessage[1]) message.channel.send("Please choose a command! ('use'|'list')")
                                    break
                                case 'trader':
                                    switch (parsedMessage[1]) {
                                        case 'list':
                                            message.channel.send(listItemsFromArray(traderInStock))
                                            break
                                        case 'buy':
                                            let itemFound = false
                                            for (let i = 0; i < traderInStock.length; i++) {

                                                if (traderInStock[i].name.toLowerCase() == parsedMessage[2].toLowerCase()) {
                                                    itemFound = true
                                                    let quantity = parseInt(parsedMessage[3])
                                                    if (!quantity) quantity = 1
                                                    if (quantity > traderInStock[i].quantity) quantity = traderInStock[i].quantity
                                                    if (traderInStock[i].cost * quantity > messageAuthor.money) {
                                                        message.channel.send("Cannot afford!")
                                                    } else {
                                                        let inventoryIncludesItem = false
                                                        for (let ii = 0; ii < messageAuthor.inventory.length; i++) {
                                                            if (messageAuthor.inventory[ii].name == traderInStock[i].name) {
                                                                messageAuthor.inventory[ii].quantity += quantity
                                                                inventoryIncludesItem = true
                                                            }
                                                            break
                                                        }
                                                        if (!inventoryIncludesItem) {
                                                            messageAuthor.inventory.push(cloneDB(traderInStock[i]))
                                                            messageAuthor.inventory[messageAuthor.inventory.length - 1].quantity = quantity
                                                        }
                                                        message.channel.send(`Success! Brought ${quantity} **${traderInStock[i].name}(s)**`)
                                                    }

                                                    traderInStock[i].quantity -= quantity
                                                    if (traderInStock[i].quantity === 0) traderInStock.splice(i, 1)
                                                    break
                                                }
                                            }
                                            if (!itemFound) message.channel.send(`Item ${parsedMessage[2]} not found. If you are buying an item with multiple words in its name, please enclose its name in "quotation marks"`)
                                            break
                                        default:
                                            message.channel.send(`command ${parsedMessage[1]} not reconised`)
                                            break
                                    }
                                    break
                                case 'learn':
                                    if (checkStamina(5)) {
                                        const places = {
                                            'Communitycollege': {
                                                'emoji': '🏫',
                                                'cost': 0,
                                                'xp': 100,
                                            },
                                            'College': {
                                                'emoji': '🎓',
                                                'cost': 100,
                                                'xp': 500
                                            },
                                            'University': {
                                                'emoji': '🏢',
                                                'cost': 1000,
                                                'xp': 7500
                                            }
                                        }
                                        if (!parsedMessage[1]) {
                                            message.channel.send("Please specify a place to learn!")
                                        } else {
                                            let placeFound = false
                                            for (let item in places) {
                                                if (parsedMessage[1] == 'list') {
                                                    let outputMessage = ''
                                                    for (let item2 in places) {
                                                        outputMessage += `${places[item2].emoji}\`${item2}\`: costing $${places[item2].cost} and giving you ${places[item2].xp} XP.\n`
                                                    }
                                                    message.channel.send(outputMessage)
                                                    break
                                                }
                                                if (item.toLowerCase() == parsedMessage[1].toLowerCase()) {
                                                    placeFound = true
                                                    if (messageAuthor.money >= places[item].cost) {
                                                        messageAuthor.money -= places[item].cost
                                                        messageAuthor.expToNextLevel -= places[item].xp
                                                        message.channel.send(`Success! You now have $${messageAuthor.money}`)
                                                    } else {
                                                        message.channel.send(`Not enough money to go to ${item}!`)
                                                    }
                                                }
                                            }
                                            if (!placeFound) message.channel.send("Place not found!")
                                        }
                                    }
                                    break
                                case 'work':
                                    //functionality for working
                                    console.log(messageAuthor, messageAuthor.stamina)
                                    if (checkStamina(5)) {
                                        let moneyEarned = Math.round(Math.random() * 10 * messageAuthor.level + 3 / 10 + messageAuthor.level ** 2 / 3)
                                        let xpEarned = moneyEarned * 3 * Math.random()
                                        const possibleJobs = ['washed the car',
                                            'helped the neighbour commit arson',
                                            'helped a Javascript developer',
                                            'learned how to write a hello world program',
                                            'DDOSed a major website',
                                            'cut the prickly grass',
                                            'studied some calculus',
                                            'stacked some boxes in a supermarket',
                                            'made some fries at a fast food place',
                                            'fried some egg fried rice']
                                        if (messageAuthor.ownCar && Math.random() < .2) {
                                            let amountEarnedFromStranger = Math.round(Math.random() * 50 * (messageAuthor.level) + 3) / 10 + messageAuthor.level * 10
                                            messageAuthor.money += amountEarnedFromStranger
                                            messageAuthor.netWorth += amountEarnedFromStranger
                                            message.channel.send(`You earned $${commentNo(amountEarnedFromStranger)} from a stranger that hitchhiked in your car`)
                                        }
                                        message.channel.send(`${message.author.username} earned $${commentNo(moneyEarned)} and ${Math.round(xpEarned)} experience: ${messageAuthor.pronoun} ${possibleJobs[Math.floor(Math.random() * possibleJobs.length)]}`)
                                        db[message.author.id].money += moneyEarned
                                        db[message.author.id].netWorth += moneyEarned
                                        db[message.author.id].expToNextLevel -= xpEarned
                                        messageAuthor.timesWorked++
                                    }
                                    break
                                case 'ping':
                                    message.channel.send("Pinging...").then(m => {
                                        const ping = m.createdTimestamp - message.createdTimestamp;
                                        message.channel.send(`Completed in ${ping}ms`)
                                    });
                                    break
                                case 'info':
                                    //if there is a mention, then use that find the user for taht mention. Else, use the user who sent the message

                                    let userId
                                    message.mentions.users.first() ? userId = message.mentions.users.first().id : userId = message.author.id
                                    let userInfo = {
                                        moneyPerSec: 0,
                                        staminaCurrent: messageAuthor.stamina.current,
                                        staminaMax: messageAuthor.stamina.max
                                    }
                                    const stats = ['messageCount', 'timesWorked', 'username', 'level', 'expToNextLevel', 'money']
                                    stats.forEach(e => userInfo[e] = db[userId][e])
                                    for (const item in db.adminData.stuffOwned) {
                                        let thingOwned = 0
                                        if (db.adminData.stuffOwned[item][userId]) thingOwned = db.adminData.stuffOwned[item][userId]
                                        userInfo.moneyPerSec += thingOwned * db.adminData.stuffOwned[item].value
                                        userInfo[`${item}Owned`] = thingOwned
                                    }
                                    try {
                                        message.channel.send(
                                            `**===Information for ${userInfo.username}===**
Level: ${userInfo.level} (${Math.round(userInfo.expToNextLevel * 100) / 100} XP until level up)
Money: $${commentNo(Math.round(userInfo.money * 100) / 100)} (Per second: $${userInfo.moneyPerSec})
Computer(s) owned: ${userInfo.computerOwned}
House(s) owned: ${userInfo.houseOwned}
Mansion(s) owned: ${userInfo.mansionOwned}

Stamina: ${userInfo.staminaCurrent} / ${userInfo.staminaMax}
${drawStaminaBar()}
**===Statistics===**
Messages sent: ${userInfo.messageCount}
Times worked: ${userInfo.timesWorked}`)
                                    } catch (e) {
                                        message.channel.send(`Error retrieving user info! This is probably because the user has never used this bot. ${e.message}`)
                                    }
                                    break
                                case 'bribe':
                                    if (checkStamina(3)) {
                                        if (!messageAuthor.bribed) {
                                            if (messageAuthor.money >= 1000000) {
                                                messageAuthor.money -= 1000000
                                                messageAuthor.bribed = true
                                                message.channel.send("Bribed politician! You will enjoy lower tax rates tomorrow")
                                            } else {
                                                message.channel.send("Insufficent money to bribe politician!")
                                            }
                                        } else {
                                            message.channel.send("You've already bribed a politician!")
                                        }
                                    }
                                    break
                                case 'richest':
                                    let howMuchToShow = parsedMessage[1]
                                    if (!howMuchToShow) {
                                        howMuchToShow = 5
                                    } else {
                                        howMuchToShow = parseInt(howMuchToShow.match(/[0-9]+/)[0])
                                    }
                                    sorted = []
                                    for (let specificUser in db) {
                                        if (specificUser !== "messagesWatched" && specificUser !== 'adminData') {
                                            let username1
                                            try {
                                                username1 = db[specificUser].username;
                                            } catch { username1 = specificUser }
                                            let allowPush = true
                                            if (sorted.length === 0) {
                                                sorted.push({ username: username1, money: db[specificUser].netWorth }) //start off the sort by pushing the element in sorted so other values can compare to it
                                                allowPush = false
                                            }
                                            for (let i = 0; i < sorted.length; i++) {
                                                if (allowPush) {
                                                    //check if a number can be put at the start of the sorted array
                                                    if (sorted[0].money >= db[specificUser].netWorth) {
                                                        sorted.unshift({ username: username1, money: db[specificUser].netWorth })
                                                        break
                                                        //check if the number can be put at the end of the sorted array
                                                    } else if (sorted[sorted.length - 1].money <= db[specificUser].netWorth) {
                                                        sorted.push({ username: username1, money: db[specificUser].netWorth })
                                                        break
                                                    } else if (i >= 1) {
                                                        if (sorted[i - 1].money <= db[specificUser].netWorth && sorted[i].money >= db[specificUser].netWorth) {
                                                            sorted.splice(i, 0, { username: username1, money: db[specificUser].netWorth });
                                                            break
                                                        }
                                                    }
                                                }
                                            }

                                        }

                                    }
                                    let stringToSendlove = ''
                                    if (howMuchToShow > sorted.length) howMuchToShow = sorted.length
                                    for (let i = sorted.length - 1; i >= sorted.length - howMuchToShow; i--) {
                                        try {
                                            let money2 = commentNo(Math.round(sorted[i].money * 100) / 100)
                                            stringToSendlove += `${sorted.length - i}. ${sorted[i].username} with a net worth of $${money2}\n`
                                        } catch (e) { }
                                    }
                                    message.channel.send(stringToSendlove)
                            }

                            //level up, put at the end of the thing
                            let leveledUp = false
                            while (db[message.author.id].expToNextLevel <= 0) {
                                leveledUp = true
                                db[message.author.id].level++
                                db[message.author.id].expToNextLevel = Math.ceil((messageAuthor.level ** 2) / 3 + 15) - Math.abs(db[message.author.id].expToNextLevel)
                            }
                            if (leveledUp) message.channel.send(`Congratulations to ${message.author.username}! You have reached level ${db[message.author.id].level}! You need ${Math.round(messageAuthor.expToNextLevel * 100) / 100} XP to the next level`)

                            if (Math.random() < .1 && !quicktimeTypeInProgress) {
                                quicktimeTypePhrase = Math.round(Math.random() * 100).toString()
                                let channel = message.channel
                                quicktimeTypeInProgress = true
                                channel.send(`Quick! A special event happened! The next person to type **${quicktimeTypePhrase}** will recieve some money!`)
                                quicktimeTimeout = setTimeout(() => {
                                    quicktimeTypePhrase = ''
                                    quicktimeTypeInProgress = false
                                    channel.send("You were too slow! Better luck next time.")
                                }, 10000)
                            }
                        } else {
                            message.channel.send(`You have been banned ${userBannedReason}`)
                        }
                    }

                    db[message.author.id].messageCount++
                    if (quicktimeTypeInProgress && message.content == quicktimeTypePhrase) {
                        clearTimeout(quicktimeTimeout)
                        quicktimeTypeInProgress = false
                        let gainMoney = Math.round(Math.random() * 500) + 500 + messageAuthor.money * 0.01
                        messageAuthor.money += gainMoney
                        message.channel.send(`Congratulations to ${message.author.username}, who typed the phrase first! ${messageAuthor.pronoun} recieved $${gainMoney}`)
                    }
                }
            }
        } catch (e) {
            message.channel.send(`Crapbot has encountered an error! (${e.message})`)
        }
    })
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
    client.on("presenceUpdate", function (oldMember, newMember) {
        // console.log(`a guild member's presence changes`, oldMember, newMember);
    });
})

client.login(token);