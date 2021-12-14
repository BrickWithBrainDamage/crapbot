const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES] });
const fs = require('fs');

const prefix = '!'
const adminId = '691864484079337543'
const helpMessages = {
    'prefix': `Crapbot (c) 2021 Weiyi Jiang.
**-I am a very crappy bot made by a 15 year old. I am very buggy. Please use me with caution-**
❌ = In deveopment command, may be buggy\n`,
    'categories': '\`economy, admin, general\`',
    'economy': `**ECONOMY**
\`work\`: Work to earn some money
\`richest\`: List the richest players
\`buy\` [item|"list"]: ❌Buys a specified item or list all items avaliable to purchase.
\`pay\` [mention|username] [amount]: Pays someone money
\`learn\` [place|"list"]: Go somewhere to learn so you can earn XP.`,
    'admin': `**ADMINISTRATION**
These commands are only avaliable to the admin whose ID exists within the index.js file
\`clearall\`: USE WITH CAUTION, will delete EVERYONE's data
\`save\`: saves the database
\`allusers\`: Outputs everyone in the database
\`setMoney\` [userId, money]: sets the money of a specified user to the money count
\`toggleDevMode\`: ❌toggles the bot status between showing a messing stating that it is avaliable and showing that it is unavaliable`,
    'general': `**GENERAL**
\`changepronoun\` [pronoun]: Change your pronoun. Pronoun must be between 2 - 8 characters and only contain letters.
\`info\`: Displays some basic information about you.
\`help\`: You've already stumbled upon this command I think you know what this does.
\`watchMessage\` [message]: Watch when a user sends this message containing this phrase. When this happens. Ialert you with a DM. Message can include spaces
\`removeWatch\`: Stop watching this message
\`ping\`: Respondes with 'pong' and your latency.
\`love\` [thing]: Do you love something and want the world to know how much you love it? Use this command!
\`mostLoved\`: see the top 5 most loved thing by all users of CrapBot`
}
let db
let mathInProgress = {}
function readDB() {
    return new Promise((resolve, reject) => {
        fs.readFile('./basicDB.txt', 'utf-8', (error, data) => {
            if (error) {
                console.log(error.message)
                console.log('Creating database...')
                db = {
                    messagesWatched: {},
                    adminData: {
                        devMode: false,
                        laptopsOwned: {

                        },
                        housesOwned: {},
                        mostHated: {},
                        banned: {}
                    },
                }
            }
            try {
                if (data) db = JSON.parse(data)
            } catch (e) {
                console.log(`unable to parse JSON: ${e.message}`)
            }
            resolve(db)
        })
    })
}
function readXP() {
    return new Promise((resolve) => {
        fs.readFile('./xpprefix.txt', 'utf-8', (error, contents) => {
            if (error) console.log(error)
            resolve(contents)
        })
    })
}
let experiences = {

}
readXP().then((content) => {
    experiences = JSON.parse(content)
})
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
    setInterval(save, 15000)
    db = results
    setInterval(() => {
        for (item in db.adminData.laptopsOwned) {
            db[item].money += db.adminData.laptopsOwned[item]
            db[item].netWorth += db.adminData.laptopsOwned[item]
        }
        for (item in db.adminData.housesOwned) {
            db[item].money += db.adminData.housesOwned[item] * 10
            db[item].netWorth += db.adminData.housesOwned[item] * 10
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
        for (i = a.length - 1; i >= 0; i--) {
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
    let quicktimeTypeInProgress = false
    let quicktimeTypePhrase
    let quicktimeTimeout
    let tooSlow
    client.on('messageCreate', message => {
        let userBanned
        let userBannedReason
        for (user in db.adminData.banned) {
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
                    console.log(tooSlow)
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
        if (message.author.username.toLowerCase() !== 'crapbot') {
            for (thing in db.messagesWatched) {
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
                    'lastLogon': null
                }
            }
            //backwards compadibility by adding in keys not from previous versions
            if (!db[message.author.id].hasOwnProperty('lastLogon')) {
                db[message.author.id].lastLogon = null
            }

            let messageAuthor = db[message.author.id]
            console.log(messageAuthor, message.author.id, db)
            if (!messageAuthor.hasOwnProperty('username')) {
                messageAuthor.username = message.author.username
            }
            if (!messageAuthor.hasOwnProperty('timesWorked')) messageAuthor.timesWorked = 0

            if (usersWithoutPronouns.includes(message.author.username)) {
                usersWithoutPronouns.splice(usersWithoutPronouns.indexOf(message.author.username), 1)
                messageAuthor.pronoun = message.content
                message.channel.send(`Chaged ${message.author.username}'s pronoun to ${messageAuthor.pronoun}`)
            }
            if (!messageAuthor.pronoun) {
                usersWithoutPronouns.push(message.author.username)
                message.channel.send(`Hello, ${message.author.username}. Welcome! What are your pronouns? I'm doing this so I won't get sued by some obscure LGBTQ+ movement somewhere on earth.`)
            }

            let sorted = []

            if (message.content.startsWith(prefix)) {
                if (!userBanned) {
                    let parsedMessage = message.content.replace(/\s{2,}/g, ' ').replace('!', '').split(' ')
                    if (message.author.id === adminId) {
                        //admin debug commands
                        switch (parsedMessage[0].toLowerCase()) {
                            case 'ban':
                                try {
                                    let user = parsedMessage[1]
                                    if (user.match(/<@![0-9]+>/)) {
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
                                        banned: {}
                                    },
                                }
                                save()
                                message.channel.send('Purged all user data!')
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
                                for (item in db) {
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
                                for (item in db) {
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
                            if (message.author.id === adminId) {
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
                            if (!db.adminData.mostHated.hasOwnProperty(thingHated)) db.adminData.mostHated[thingHated] = 0

                            if (thingHated.match(/\w/)) {
                                db.adminData.mostHated[thingHated]++
                                message.channel.send(`Loved ${thingHated}. ${thingHated} now has ${db.adminData.mostHated[thingHated]} loves`)
                            } else {
                                message.channel.send("Cannot love an empty string!")
                            }
                            break
                        case 'mostloved':
                            for (item in db.adminData.mostHated) {
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
                            for (let i = sorted.length - 1; i >= sorted.length - 5; i--) {
                                try {
                                    stringToSend += `${sorted.length - i}. ${sorted[i].name} ${sorted[i].hateCount} loves\n`
                                } catch (e) { }
                            }
                            message.channel.send(stringToSend)
                            break
                        case 'daily':
                            let date = new Date()
                            let currentTime = `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`
                            console.log(currentTime)
                            if (messageAuthor.lastLogon !== currentTime) {
                                messageAuthor.lastLogon = currentTime
                                messageAuthor.money += 10000
                                message.channel.send(`${message.author.username} claimed their daily reward of $10000!`)
                            } else {
                                message.channel.send("You've already claimed this reward!")
                            }
                            console.log(messageAuthor)
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
                                    condition: function () {
                                        return true
                                    },
                                    customCode: function () {
                                        if (Math.random() < 0.04) {
                                            messageAuthor.money += 10000
                                            messageAuthor.netWorth += 10000
                                            message.channel.send(`You won big! $10000 has been added to your account for a total of $${commentNo(messageAuthor.money)}`)
                                        } else {
                                            message.channel.send('Tough luck. You lost the lotto.')
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
                                }
                            }
                            if (parsedMessage[1]) {
                                let madePurchase = false
                                for (item in thingsToBuy) {
                                    if (parsedMessage[1] == 'list') {
                                        let messageToSend = ''
                                        for (item in thingsToBuy) {
                                            messageToSend += `${thingsToBuy[item].description}\n`
                                        }
                                        message.channel.send(messageToSend)
                                        madePurchase = true
                                        break
                                    }
                                    if (parsedMessage[1].toLowerCase() == item) {
                                        madePurchase = true
                                        if (messageAuthor.money >= thingsToBuy[item].price) {
                                            if (thingsToBuy[item].condition()) {
                                                messageAuthor.money -= parseInt(thingsToBuy[item].price)
                                                message.channel.send(`Success! You brought one ${item}. You now have $${commentNo(Math.round(messageAuthor.money * 100) / 100)}.`)
                                                if (thingsToBuy[item].hasOwnProperty('customCode')) thingsToBuy[item].customCode()
                                            }
                                        } else {
                                            message.channel.send(`You do not have enough money to buy this item! Need $${commentNo(thingsToBuy[item].price - messageAuthor.money)} more.`)
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
                                if (helpMessages.hasOwnProperty(parsedMessage[1])) {
                                    messageToSendHelp += helpMessages[parsedMessage[1]]
                                } else {
                                    messageToSendHelp += `Help message ${parsedMessage[1]} not found!`
                                }
                            } else {
                                messageToSendHelp += `Please choose a category out of ${helpMessages.categories}`
                            }
                            message.channel.send(messageToSendHelp)
                            break
                        case 'generatexpsettings':
                            if (message.author.id === adminId) {
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
                                    if (parsedMessage[1].match(/(?!=PENIS)[a-z]{2,8}/i)[0].length == parsedMessage[1].length) {
                                        messageAuthor.pronoun = parsedMessage[1].match(/(?!=PENIS)[a-z]{2,8}/i)[0]
                                        message.channel.send(`Changed pronoun for **${message.author.username}** to ${messageAuthor.pronoun}`)
                                    } else {
                                        message.channel.send('Pronoun must match regex (?!=PENIS)[a-z]{2,8}')
                                    }
                                }
                            } catch (e) { message.channel.send(`Error while changing pronoun! Make sure your pronoun matches the regex \`(?!=PENIS)[a-z]{2,8}\`. (${e.message})`) }
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
                                        if (messageAuthor.money >= places[item].cost) {
                                            messageAuthor.money -= places[item].cost
                                            messageAuthor.expToNextLevel -= places[item].xp
                                            message.channel.send(`Success! You now have $${messageAuthor.money}`)
                                        } else {
                                            message.channel.send(`Not enough money to go to ${item}!`)
                                        }
                                    }
                                }
                            }
                            break
                        case 'work':
                            //functionality for working
                            let moneyEarned = Math.round(Math.random() * 10 * (messageAuthor.level) + 3) / 10 + messageAuthor.level * 2
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
                                messageAuthor.worth += amountEarnedFromStranger
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
                            let housesOwned
                            if (message.mentions.users.first()) {
                                messageAuthor = db[message.mentions.users.first().id]
                                laptopsOwned = db.adminData.laptopsOwned[message.mentions.users.first().id]
                                housesOwned = db.adminData.housesOwned[message.mentions.users.first().id]
                            } else {
                                messageAuthor = db[message.author.id]
                                laptopsOwned = db.adminData.laptopsOwned[message.author.id]
                                housesOwned = db.adminData.housesOwned[message.author.id]
                            }
                            if (laptopsOwned == undefined) laptopsOwned = 0
                            if (housesOwned == undefined) housesOwned = 0
                            try {
                                message.channel.send(`**===Information for ${messageAuthor.username}===**\nLevel: ${messageAuthor.level} (${Math.round(messageAuthor.expToNextLevel * 100) / 100} XP until level up)\nMoney: $${commentNo(Math.round(messageAuthor.money * 100) / 100)}\nComputer(s) owned: ${laptopsOwned}\nHouses owned: ${housesOwned}\n **===Statistics===**\nMessages sent: ${messageAuthor.messageCount}\nTimes worked: ${messageAuthor.timesWorked}`)
                            } catch (e) {
                                message.channel.send(`Error retrieving user info! This is probably because the user has never used this bot. ${e.message}`)
                            }
                            break
                        case 'richest':
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
                                    console.log({ username: username1, money: db[specificUser].netWorth })
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
                            for (let i = sorted.length - 1; i >= sorted.length - 5; i--) {
                                let money2 = commentNo(Math.round(sorted[i].money * 100) / 100)
                                //try {
                                stringToSendhate += `${sorted.length - i}. ${sorted[i].username} with a net worth of $${money2}\n`
                                //} catch (e){console.log(e.message)}
                            }
                            message.channel.send(stringToSendhate)
                    }

                    //level up, put at the end of the thing
                    let leveledUp = false
                    while (db[message.author.id].expToNextLevel < 0) {
                        leveledUp = true
                        db[message.author.id].level++
                        db[message.author.id].expToNextLevel = experiences[db[message.author.id].level] - Math.abs(db[message.author.id].expToNextLevel)
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
                let gainMoney = Math.round(Math.random() * 500) + 500
                messageAuthor.money += gainMoney
                message.channel.send(`Congratulations to ${message.author.username}, who typed the phrase first! ${messageAuthor.pronoun} recieved $${gainMoney}`)
            }
        }




    });
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
    client.on("presenceUpdate", function (oldMember, newMember) {
        console.log(`a guild member's presence changes`, oldMember, newMember);
    });
})

client.login('NzkwNDY2MDEyOTc2Nzc1MTY4.X-BA1w.vZEDnCr2ArQL2XhRn8m3Z4AACus');
