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
❌ = In deveopment command, may be buggy\n`,
    'categories': '\`economy, admin, general\`',
    'economy': `**ECONOMY**
\`work\`: Work to earn some money
\`richest\` [optional number]: List the richest players. If a number is entered, then it will list that many players.
\`buy\` [item|"list"] [optional quantity]: Buys a specified item or list all items avaliable to purchase.
\`pay\` [mention|username] [amount]: Pays someone money
\`daily\`: claim your daily reward
\`learn\` [place|"list"]: Go somewhere to learn so you can earn XP.
\`piracy\`: Sick of earning money the legitimate way? pirate and distribute the latest film for a lot of money!
\`arson\`: Burn down a random player's house.
\`bribe\`: Bribe a politician for lower tax rates for one day.`,
    'admin': `**ADMINISTRATION**
These commands are only avaliable to the admin whose ID exists within the index.js file
\`clearall\`: USE WITH CAUTION, will delete EVERYONE's data
\`save\`: saves the database
\`allusers\`: Outputs everyone in the database
\`setMoney\` [userId, money]: sets the money of a specified user to the money count
\`toggleDevMode\`: ❌toggles the bot status between showing a messing stating that it is avaliable and showing that it is unavaliable
\`addallowedchannel\`: add a channel to the list of channels that CrapBot is allowed to operate on
\`removeallowedchannel\`: guess what this does
\`ban\` [user]: Bans a specific user. `,
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
                data = JSON.stringify({
                    messagesWatched: {},
                    adminData: {
                        devMode: false,
                        laptopsOwned: {},
                        housesOwned: {},
                        mostHated: {},
                        banned: {},
                        mansionOwned: {},
                        allowedChannels: []
                    }
                })
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
function save() {
    fs.writeFile('./basicDB.txt', JSON.stringify(db, null, 1), (error) => {
        if (error) console.log(error.message)
    })
}
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
    setInterval(save, 15000)
    db = results
    if (!db.adminData.hasOwnProperty('mansionOwned')) {
        db.adminData.mansionOwned = {}
    }
    if (!db.adminData.hasOwnProperty('allowedChannels')) {
        db.adminData.allowedChannels = []
    }
    setInterval(() => {
        for (let item in db.adminData.laptopsOwned) {
            db[item].money += db.adminData.laptopsOwned[item]
            db[item].netWorth += db.adminData.laptopsOwned[item]
        }
        for (let item in db.adminData.housesOwned) {
            db[item].money += db.adminData.housesOwned[item] * 10
            db[item].netWorth += db.adminData.housesOwned[item] * 10
        }
        for (let item in db.adminData.mansionOwned) {
            db[item].money += db.adminData.mansionOwned[item] * 1200
            db[item].netWorth += db.adminData.mansionOwned[item] * 1200
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
    function explicitFilter(e) { //returns false if a word is inapporiate
        const bannedWordsw = ['penis', 'dick', 'sex', 'filtertest', 'ass', 'bitch', 'fuck', 'nigger', 'nigga']
        for (let i = bannedWordsw.length - 1; i >= 0; i--) {
            if (e.toLowerCase().includes(bannedWordsw[i].toLowerCase())) {
                return false
            }
        }
        return true
    }
    const verifyPronoun = e => /^(?!.*(penis|vagina|fuck|bitch|ass|shit|regextest|nigg(a|er)))(?=[a-z]{2,10})(?![a-z]{11,})/mgi.test(e)
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

            /*         if (db.adminData.devMode === true) {
                        client.user.setActivity('Currently debugging! Please do not use')
                    } else {
                    } */

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
                            'bribed': false
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
                            message.channel.send(`${message.content} is not a valid pronoun. Pronouns must be between 2 and 10 characters and not contain any inapporporiate words (pronoun must match regex \`^(?!.*(penis|vagina|fuck|bitch|ass|shit|regextest|nigg(a|er)))(?=[a-z]{2,10})(?![a-z]{11,})\`).`)
                        }
                    }

                    if (!messageAuthor.pronoun && !usersWithoutPronouns.includes(message.author.username)) {
                        usersWithoutPronouns.push(message.author.username)
                        message.channel.send(`Hello, ${message.author.username}. Welcome! What are your pronouns? I'm doing this so I won't get sued by some obscure LGBTQ+ movement somewhere on earth.`)
                    }

                    let sorted = []

                    if (message.content.startsWith(prefix)) {
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
                                } else if (messageAuthor.money < 2000000) {
                                    messageAuthor.taxRate = .2
                                } else if (messageAuthor.money < 1000000) {
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

                                message.channel.send(`Welcome to a new day! You paid $${commentNo(amountToPay)} in taxes because the Government hates you. You now have $${commentNo(messageAuthor.money)} remaining. Your tax rate is ${Math.round(messageAuthor.taxRate * messageAuthor.taxMultiplier * 100)}%.`)
                                messageAuthor.bribed = false
                            }
                            let parsedMessage = []
                            let unparsedMessage = message.content.split('')

                            let currentSplitIndex = 0
                            let apstropheEncountered = false
                            while (unparsedMessage.length > 0) {
                                let nextSpliceIndex
                                if (unparsedMessage[0] == '"') {
                                    for (let i = 1; i < unparsedMessage.length; i++) {
                                        if (unparsedMessage[i] == '"' || i == unparsedMessage.length - 1) {
                                            nextSpliceIndex = i
                                            break
                                        }
                                    }
                                } else {
                                    for (let i = 1; i < unparsedMessage.length; i++) {
                                        if (unparsedMessage[i] == ' ' || i == unparsedMessage.length - 1) {
                                            nextSpliceIndex = i
                                            break
                                        }
                                    }
                                }

                                    parsedMessage.push(unparsedMessage.splice(0, nextSpliceIndex + 1).join(''))
                                    console.log(unparsedMessage.join(''))
                            }
                                message.channel.send(JSON.stringify(parsedMessage))

                                if (adminId.includes(message.author.id)) {
                                    //admin debug commands
                                    switch (parsedMessage[0].toLowerCase()) {
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
                                            let allChannels = message.guild.channels.cache.filter(e => e.type == 'GUILD_TEXT')
                                            let channelValid = false

                                            //I'm so sorry but it's the only way i can get it working
                                            allChannels = JSON.parse(JSON.stringify(allChannels))

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
                                            console.log(message.channel.id)
                                            break
                                        case 'removeallowedchannel':
                                            let allChannelsremove = message.guild.channels.cache.filter(e => e.type == 'GUILD_TEXT')
                                            let channelValidremove = false
                                            allChannelsremove = JSON.parse(JSON.stringify(allChannelsremove)) //I'm so sorry but it's the only way i can get it working
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
                                            try {
                                                let user = parsedMessage[1]
                                                if (user.match(/<@![0-9]+>/)[0]) {
                                                    user = user.match(/[0-9]+/)
                                                }
                                                let reason = parsedMessage[2]
                                                db.adminData.banned[user] = reason
                                                message.channel.send(`Banned user for ${reason}`)
                                            } catch (e) {
                                                message.channel.send(`Error banning user (${e.message})`)
                                            }
                                            break
                                        case 'unban':
                                            try {
                                                let user = parsedMessage[1]
                                                if (user.match(/<@![0-9]+>/)) {
                                                    user = user.match(/[0-9]+/)
                                                }
                                                delete db.adminData.banned[user]
                                            } catch (e) {
                                                message.channel.send(`Error unbanning user (${e.message}), probably because the user was never banned`)
                                            }
                                            break
                                        case 'clearall':
                                            db = {
                                                messagesWatched: {},
                                                adminData: {
                                                    devMode: false,
                                                    laptopsOwned: {

                                                    },
                                                    housesOwned: {},
                                                    mostHated: {},
                                                    banned: {},
                                                    mansionOwned: {},
                                                    allowedChannels: []
                                                },
                                            }
                                            save()
                                            process.exit()
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
-If you're NOT using a mention (@), then make sure that you use a USERNAME, a nickname`)
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
                                    case 'setmoney':
                                        if (adminId.includes(message.author.id)) {
                                            if (db.hasOwnProperty(parsedMessage[1])) {
                                                let netWorthGain = parseInt(parsedMessage[2].match(/[0-9]+/)[0]) - db[parsedMessage[1]].money
                                                db[parsedMessage[1]].money = parseInt(parsedMessage[2])
                                                db[parsedMessage[1]].netWorth += netWorthGain
                                                message.channel.send(`User ${parsedMessage[1]} now has $${commentNo(Math.round(db[parsedMessage[1]].money * 100) / 100)} (total net worth ${db[parsedMessage[1]].netWorth})`)
                                            } else {
                                                message.channel.send(`${parsedMessage[1]} not found!`)
                                            }
                                        } else {
                                            message.channel.send("Access Denied")
                                        }
                                        break
                                    case 'love':
                                        parsedMessage.shift()
                                        let thingHated = parsedMessage.join(' ').toLowerCase()
                                        if (explicitFilter(thingHated)) {
                                            if (!db.adminData.mostHated.hasOwnProperty(thingHated)) db.adminData.mostHated[thingHated] = 0

                                            if (thingHated.match(/\w/)) {
                                                db.adminData.mostHated[thingHated]++
                                                message.channel.send(`Loved ${thingHated}. ${thingHated} now has ${db.adminData.mostHated[thingHated]} loves`)
                                            } else {
                                                message.channel.send("Cannot love an empty string!")
                                            }
                                        } else {
                                            message.channel.send(`${thingHated} fails the explicit filter.`)
                                        }
                                        break
                                    case 'mostloved':
                                        let quantity = parseInt(parsedMessage[1])
                                        console.log(quantity)
                                        if (!quantity) { quantity = 5; console.log('no') }
                                        for (let item in db.adminData.mostHated) {
                                            let allowPush = true
                                            if (sorted.length === 0) {
                                                sorted.push({ 'name': item, 'hateCount': db.adminData.mostHated[item] })
                                                allowPush = false
                                            }
                                            for (let i = 0; i < sorted.length; i++) {
                                                if (allowPush) {
                                                    if (i == 0 && sorted[0].hateCount >= db.adminData.mostHated[item]) {
                                                        sorted.unshift({ 'name': item, 'hateCount': db.adminData.mostHated[item] })
                                                        break
                                                    } else if (i == sorted.length - 1 && sorted[sorted.length - 1].hateCount <= db.adminData.mostHated[item]) {
                                                        sorted.push({ 'name': item, 'hateCount': db.adminData.mostHated[item] })
                                                        break
                                                    } else if (i >= 1) {
                                                        if (sorted[i - 1].hateCount <= db.adminData.mostHated[item] && sorted[i].hateCount >= db.adminData.mostHated[item]) {
                                                            sorted.splice(i, 0, { 'name': item, 'hateCount': db.adminData.mostHated[item] });
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
                                                stringToSend += `${sorted.length - i}. ${sorted[i].name} ${sorted[i].hateCount} loves\n`
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
                                        if (db.adminData.laptopsOwned[message.author.id] > 0) {
                                            let date = new Date()
                                            let currentHour = `${date.getHours()} ${date.getDate()}`
                                            if (currentHour != messageAuthor.lastPiracy) {
                                                let moneyGained = Math.floor(Math.random() * 2500) + 5000
                                                messageAuthor.lastPiracy = currentHour
                                                messageAuthor.money += moneyGained
                                                messageAuthor.netWorth += moneyGained
                                                message.channel.send(`🏴‍☠️You pirated and distributed the newest film, and gained $${moneyGained}.`)
                                            } else {
                                                message.channel.send("There are no more movies for you to pirate and distribute!")
                                            }
                                        } else {
                                            message.channel.send("You need at least one computer to engage in this command!")
                                        }
                                        break
                                    case 'buy':
                                        const thingsToBuy = {
                                            'computer': {
                                                price: 15000,
                                                'description': ':computer:**computer ($15000)**: give you ONE dollar a second. Can be purchased multiple times',
                                                condition: function () {
                                                    return true
                                                },
                                                customCode: function () {
                                                    if (!db.adminData.laptopsOwned.hasOwnProperty(message.author.id)) {
                                                        db.adminData.laptopsOwned[message.author.id] = 0
                                                    }
                                                    db.adminData.laptopsOwned[message.author.id]++
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
                                                customCode: function () {
                                                    if (!db.adminData.housesOwned.hasOwnProperty(message.author.id)) {
                                                        db.adminData.housesOwned[message.author.id] = 0
                                                    }
                                                    db.adminData.housesOwned[message.author.id]++
                                                }
                                            },
                                            'mansion': {
                                                price: 10000000,
                                                condition: function () {
                                                    if (db.adminData.housesOwned[message.author.id] >= 10) {
                                                        return true
                                                    } else {
                                                        message.channel.send("The real estate agency said that you have to prove your worth before buying a mansion. Please purchase at least 10 houses")
                                                    }
                                                },
                                                'description': '**🏛Mansion($10,000,000)**: even more expensive than houses, giving you $1200 per second!',
                                                customCode: function () {
                                                    if (!db.adminData.mansionOwned.hasOwnProperty(message.author.id)) {
                                                        db.adminData.mansionOwned[message.author.id] = 0
                                                    }
                                                    db.adminData.mansionOwned[message.author.id]++
                                                }
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
                                                                if (item !== 'lottery') {
                                                                    let variablesToIncrement = {
                                                                        'computer': 'laptopsOwned',
                                                                        'mansion': 'mansionOwned',
                                                                        'house': 'housesOwned',
                                                                    }
                                                                    if (variablesToIncrement.hasOwnProperty(item)) {
                                                                        db.adminData[variablesToIncrement[item]] += quantity
                                                                    } else {
                                                                        for (let i = 0; i < quantity; i++) {
                                                                            thingsToBuy[item].customCode(quantity)
                                                                        }
                                                                    }
                                                                } else {
                                                                    thingsToBuy.lottery.customCode(quantity)
                                                                }
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
                                    case 'generatexpsettings':
                                        if (adminId.includes(message.author.id)) {
                                            let times = parseInt(parsedMessage[1])
                                            for (let i = 0; i < times; i++) {
                                                experiences[i] = Math.ceil((i ** 2) / 3 + 15)
                                            }
                                            fs.writeFile('./xpprefix.txt', JSON.stringify(experiences), (error) => {
                                                if (error) console.log(error)
                                            })
                                        }
                                        break
                                    case 'changepronoun':
                                        try {
                                            if (parsedMessage[1] == undefined) {
                                                message.channel.send('Please choose something for your pronoun.')
                                            } else {
                                                if (verifyPronoun(parsedMessage[1])) {
                                                    messageAuthor.pronoun = parsedMessage[1]
                                                    message.channel.send(`Changed pronoun for **${message.author.username}** to ${messageAuthor.pronoun}`)
                                                } else {
                                                    message.channel.send('Pronoun must be between 2 and 10 characters and not contain any inapporporiate words (pronoun must match regex \`^(?!.*(penis|vagina|fuck|bitch|ass|shit|regextest|nigg(a|er)))(?=[a-z]{2,10})(?![a-z]{11,})\`).')
                                                }
                                            }
                                        } catch (e) { message.channel.send(`Error while changing pronoun! (${e.message})`) }
                                        break
                                    case 'learn':
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
                                        break
                                    case 'work':
                                        //functionality for working
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
                                        break
                                    case 'ping':
                                        message.channel.send("Pinging...").then(m => {
                                            const ping = m.createdTimestamp - message.createdTimestamp;
                                            message.channel.send(`Completed in ${ping}ms`)
                                        });
                                        break
                                    case 'info':
                                        //if there is a mention, then use that find the user for taht mention. Else, use the user who sent the message
                                        let laptopsOwned
                                        let housesOwned
                                        let mansionOwned
                                        if (message.mentions.users.first()) {
                                            messageAuthor = db[message.mentions.users.first().id]
                                            laptopsOwned = db.adminData.laptopsOwned[message.mentions.users.first().id]
                                            housesOwned = db.adminData.housesOwned[message.mentions.users.first().id]
                                            mansionOwned = db.adminData.mansionOwned[message.mentions.users.first().id]
                                        } else {
                                            messageAuthor = db[message.author.id]
                                            laptopsOwned = db.adminData.laptopsOwned[message.author.id]
                                            housesOwned = db.adminData.housesOwned[message.author.id]
                                            mansionOwned = db.adminData.mansionOwned[message.author.id]
                                        }
                                        if (laptopsOwned == undefined) laptopsOwned = 0
                                        if (housesOwned == undefined) housesOwned = 0
                                        if (mansionOwned == undefined) mansionOwned = 0
                                        try {
                                            message.channel.send(`**===Information for ${messageAuthor.username}===**\nLevel: ${messageAuthor.level} (${Math.round(messageAuthor.expToNextLevel * 100) / 100} XP until level up)\nMoney: $${commentNo(Math.round(messageAuthor.money * 100) / 100)}\nComputer(s) owned: ${laptopsOwned}\nHouses owned: ${housesOwned}\nMansions owned: ${mansionOwned}\n**===Statistics===**\nMessages sent: ${messageAuthor.messageCount}\nTimes worked: ${messageAuthor.timesWorked}`)
                                        } catch (e) {
                                            message.channel.send(`Error retrieving user info! This is probably because the user has never used this bot. ${e.message}`)
                                        }
                                        break
                                    case 'bribe':
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
                                        let stringToSendhate = ''
                                        if (howMuchToShow > sorted.length) howMuchToShow = sorted.length
                                        for (let i = sorted.length - 1; i >= sorted.length - howMuchToShow; i--) {
                                            try {
                                                let money2 = commentNo(Math.round(sorted[i].money * 100) / 100)
                                                stringToSendhate += `${sorted.length - i}. ${sorted[i].username} with a net worth of $${money2}\n`
                                            } catch (e) { }
                                        }
                                        message.channel.send(stringToSendhate)
                                }

                                //level up, put at the end of the thing
                                let leveledUp = false
                                while (db[message.author.id].expToNextLevel <= 0) {
                                    leveledUp = true
                                    db[message.author.id].level++
                                    db[message.author.id].expToNextLevel = Math.ceil((messageAuthor.level ** 2) / 3 + 15) - (db[message.author.id].expToNextLevel)
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
                                message.channel.send(`You have been banned for ${userBannedReason}`)
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