const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES] });
const fs = require('fs');

const prefix = '!'
const adminId = '691864484079337543'
const helpMessage =
    `Crapbot (c) 2021 Weiyi Jiang.
**-I am a very crappy bot made by a 15 year old. I am very buggy. Please use me with caution-**
Commands:
**GENERAL**
❌ = In deveopment command, may be buggy
\`changePronoun\` [pronoun]: Change your pronoun.
\`info\`: Displays some basic information about you.
\`help\`: You've already stumbled upon this command I think you know what this does.
\`watchMessage\` [message]: ❌Watch when a user sends this message containing this phrase. When this happens. Ialert you with a DM. Message can include spaces
\`removeWatch\`: Stop watching this message
\`ping\`: Respondes with 'pong' and your latency.
**ECONOMY**
\`work\`: Work to earn some money
\`richest\`: List the richest players
\`buy\`: [item|"list"]: ❌Buys a specified item or list all items avaliable to purchase.
**ADMINISTRATION**
These commands are only avaliable to the admin whose ID exists within the index.js file
\`clearall\`: USE WITH CAUTION, will delete EVERYONE's data
\`save\`: saves the database
\`allusers\`: Outputs everyone in the database
\`setMoney\` [userId, money]: sets the money of a specified user to the money count
\`toggleDevMode\`: ❌toggles the bot status between showing a messing stating that it is avaliable and showing that it is unavaliable`
let db = {
    messagesWatched: {},
    adminData: {
        devMode: false,
        laptopsOwned: {

        }
    },
}

function readDB() {
    return new Promise((resolve, reject) => {
        fs.readFile('./basicDB.txt', 'utf-8', (error, data) => {
            if (error) {
                console.log(error.message)
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
    fs.writeFile('./basicDB.txt', JSON.stringify(db), (error) => {
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
    setInterval(() => {
        for (item in db.adminData.laptopsOwned) {
            db[item].money += db.adminData.laptopsOwned[item]
            db[item].netWorth += db.adminData.laptopsOwned[item]
        }
    }, 1000)
    setInterval(save, 15000)
    db = results
    function commentNo(a) {
        a = a.toString().split('')
        let output = []
        let tempSliced = []
        if (a.includes('.')) {
            let index = a.indexOf('.')
            let spliceCount = a.length  - index
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
    client.on('messageCreate', message => {
        if (db.adminData.devMode === false) {
            client.user.setActivity('Currently debugging! Please do not use')
        } else {
            client.user.setActivity('Avaliable for you to rage at because this bot has terrible programming!')
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
                    'timesWorked': 0
                }
            }
            let messageAuthor = db[message.author.id]
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
            if (message.content.startsWith(prefix)) {
                let parsedMessage = message.content.replace(/\s{2,}/g, ' ').replace('!', '').split(' ')
                if (message.author.id === adminId) {
                    //admin debug commands
                    switch (parsedMessage[0]) {
                        case 'clearall':
                            db = {
                                messagesWatched: {},
                                adminData: {
                                    devMode: false,
                                    laptopsOwned: {
                            
                                    }
                                },
                            }
                            save()
                            message.channel.send('Purged all user data!')
                        case 'toggleDevMode':
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
                switch (parsedMessage[0]) {
                    case 'watchMessage':
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
                    case 'removeWatch':
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
                                price: 100,
                                description: '**:tickets:Lottery($100)**: Gives you a small chance of winning big',
                                condition: function () {
                                    return true
                                },
                                customCode: function () {
                                    if (Math.random() < 0.5) {
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
                        message.channel.send(helpMessage)
                        break
                    case 'generateXPSettings':
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
                    case 'changePronoun':
                        messageAuthor.pronoun = parsedMessage[1].match(/\w+/)[0]
                        message.channel.send(`Changed pronoun for **${message.author.username}** to ${messageAuthor.pronoun}`)
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
                        console.log(message)
                        console.log(Date.now())
                        message.channel.send("Pinging...").then(m => {
                            const ping = m.createdTimestamp - message.createdTimestamp;
                            message.channel.send(`Completed in ${ping}ms`)
                        });
                        break
                    case 'info':
                        //if there is a mention, then use that find the user for taht mention. Else, use the user who sent the message
                        if (message.mentions.users.first()) {
                            messageAuthor = db[message.mentions.users.first().id]
                            laptopsOwned = db.adminData.laptopsOwned[message.mentions.users.first().id]
                        } else {
                            messageAuthor = db[message.author.id]
                            laptopsOwned = db.adminData.laptopsOwned[message.author.id]
                        }
                        if (laptopsOwned == undefined) laptopsOwned = 0
                        try {
                            message.channel.send(`**===Information for ${messageAuthor.username}===**\nLevel: ${messageAuthor.level} (${Math.round(messageAuthor.expToNextLevel * 100) / 100} XP until level up)\nMoney: $${commentNo(Math.round(messageAuthor.money * 100) / 100)}\nComputer(s) owned: ${laptopsOwned}\n **===Statistics===**\nMessages sent: ${messageAuthor.messageCount}\nTimes worked: ${messageAuthor.timesWorked}`)
                        } catch (e) {
                            message.channel.send(`Error retrieving user info! This is probably because the user has never used this bot. ${e.message}`)
                        }
                        break
                    case 'richest':
                        let sorted = []
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
                                        if (i == 0 && sorted[0].money >= db[specificUser].money) {
                                            sorted.unshift({ username: username1, money: db[specificUser].netWorth })
                                            break
                                            //check if the number can be put at the end of the sorted array
                                        } else if (i == sorted.length - 1 && sorted[sorted.length - 1].money <= db[specificUser].money) {
                                            sorted.push({ username: username1, money: db[specificUser].netWorth })
                                            break
                                        } else if (i >= 1) {
                                            if (sorted[i - 1].money <= db[specificUser].money && sorted[i].money >= db[specificUser].money) {
                                                sorted.splice(i, 0, { username: username1, money: db[specificUser].netWorth });
                                                break
                                            }
                                        }
                                    }
                                }

                            }

                        }
                        let stringToSend = ''
                        for (let i = sorted.length - 1; i >= sorted.length - 5; i--) {
                            let money = commentNo(Math.round(sorted[i].money * 100) / 100)
                            //try {
                                stringToSend += `${sorted.length - i}. ${sorted[i].username} with $${money}\n`
                            //} catch (e){console.log(e.message)}
                        }
                        message.channel.send(stringToSend)
                }

                //level up, put at the end of the thing
                let leveledUp = false
                while (db[message.author.id].expToNextLevel < 0) {
                    leveledUp = true
                    db[message.author.id].level++
                    db[message.author.id].expToNextLevel = experiences[db[message.author.id].level] - Math.abs(db[message.author.id].expToNextLevel)
                }
                if (leveledUp) message.channel.send(`Congratulations to ${message.author.username}! You have reached level ${db[message.author.id].level}! You need ${Math.round(messageAuthor.expToNextLevel * 100) / 100} XP to the next level`)
            }
            db[message.author.id].messageCount++
        }
    });
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
    client.on("presenceUpdate", function (oldMember, newMember) {
        //console.log(`a guild member's presence changes`, oldMember, newMember);
    });
})

client.login('ODgyMDc3ODIyNzIwNTU3MTI2.YS2I_Q.1L8GklsFb-w4bmeRnXOU3k907SU');