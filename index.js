const {Discord, Client, RichEmbed} = require('discord.js');
const bot = new Client();
const config = require("./config.json")
const ms = require('ms');
const weather = require('weather-js');
const superagent = require("superagent");

const token = 'NjU3ODcwNzgxNzkxMDc2MzYz.Xf_XKA.wEwQpONG7NfB2fXQTerWIy4WLI8';

const prefix = 'b!';

var version = '1.0.1';


const usedCommandRecently = new Set();


bot.on('ready', () =>{
    console.log('This bot is online')
    bot.user.setActivity(`${bot.guilds.size} SERVERS | For Commands , use : b!help`, { type: 'WATCHING'});
})

bot.on('guildMemberAdd', member =>{
    const channel = member.guild.channels.find(channel => channel.name === "👋welcome-leave");
    if(!channel) return;

    channel.send(`${member}, bine ai venit pe serverul comunitatii Blue Execution !`)

});

bot.on('guildMemberRemove', member =>{
    const channel = member.guild.channels.find(channel => channel.name === "👋welcome-leave");
    if(!channel) return;
    
    channel.send(`${member}, ne-a parasit, ne pare rau!`)
    
});


bot.on('message', async message =>{

    let msg = message.content.toUpperCase();
    let sender = message.author;
    let cont = message.content.slice(prefix.length).split(" ");
    let args = message.content.substring(prefix.length).split(" ");
    

    switch(args[0]){
        case 'help':
          const Embed = new RichEmbed()
          .setTitle("Help Information")
          .setColor(0xF0000)
          .setAuthor(`${message.guild.name} Info`, message.guild.iconURL)
          .setDescription('Acest bot este pentru welcome-leave si pentru moderare !')
          .addField("Moderation Commands", "b!mute [user] [durata] - pentru a oferi mute cuiva \n b!ban [numele] - pentru a da ban cuiva \n b!kick [numele] - pentru a da kick cuiva \n b!send [user] [mesaj] - pentru ai transmite prin bot un mesaj cuiva !")
          .addField("Info Commands", "b!help - pentru a afla toate comenzile disponibile \n b!discord - pentru a afla discord-ul nostru oficial \n b!cooldown - pentru a afla timpul de asteptare \n b!serverinfo - pentru a afla statisticile server-ului !")
          .addField("Fun Commands", "b!ping - si bot-ul iti trimite mesajul 'pong' \n b!cat - trimite o poza cu o pisica")
          .addField("Pentru a invita botul pe serverul tau", "[APASA AICI](https://discordapp.com/oauth2/authorize?client_id=657870781791076363&scope=bot&permissions=805314622)")
          .setFooter('Bot created by FaNnN#7247', 'https://imgur.com/a/C2QuBJq');

          message.channel.send(Embed)
        break;

        case 'discord':
          const Embed2 = new RichEmbed()
          .setTitle("Official Discord Server")
          .setColor(0xF0000)
          .setDescription('https://discord.gg/uxTekdS')

          message.author.send(Embed2);
          message.channel.send("Detaliile au fost trimise in privat!");
            
        break;
            
        case 'mute':
            if(!message.member.roles.find(r => r.name === "MOD")) return message.reply("Nu ai permisiunea de a folosi aceasta comanda !")
            let person = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]))
            if(!person) return message.reply("Specifica o persona mai intai!");

            let mainrole = message.guild.roles.find(role => role.name === "👨Membru");
            let muterole = message.guild.roles.find(role => role.name === "🔇MUTED");

            if(!muterole) return message.reply("Nu am gasit acel rol de mute");
            
            let time = args[2];
            
            if(!time){
                return message.reply("Nu ai specificat pentru cat sa ii dau mute.");
            }

            person.removeRole(mainrole.id);
            person.addRole(muterole.id);

            message.channel.send(`@${person.user.tag} a primit mute pentru ${ms(ms(time))}`);

            setTimeout(function(){
                person.addRole(mainrole.id);
                person.removeRole(muterole.id);
                message.channel.send(`@${person.user.tag} a primit unmute!`)
            }, ms(time));
        break;
        
        case 'cooldown':
            if(usedCommandRecently.has(message.author.id)){
                message.reply("Poti folosi o comanda odata la 30 de secunde!");
            } else{
                message.reply('Timpul de asteptare este de 30 secunde dupa folosirea unei comenzi !');

                usedCommandRecently.add(message.author.id);
                setTimeout(() => {
                    usedCommandRecently.delete(message.author.id)
                }, 30000);

            }
        break;
            
        case 'ban':
            if(!message.member.roles.find(r => r.name === "MOD")) return message.reply("Nu ai permisiunea de a folosi aceasta comanda !")
            const user = message.mentions.users.first();

            if(user) {
                const member = message.guild.member(user);

                if (member) {
                    member.ban({ression: 'you were bad!'}).then(() =>{
                        message.reply(`${user.tag} a fost banat cu succes!`)
                    })
                } else {
                    message.reply("Acel user nu este pe acest server!")
                }
            } else {
                message.reply('Specifica o persoana mai intai!')
            }

            break;
            
        case 'kick':
            if(!message.member.roles.find(r => r.name === "MOD")) return message.reply("Nu ai permisiunea de a folosi aceasta comanda !")
            if(!args[1]) message.channel.send('Specifica o persoana mai intai!')

            const smecher = message.mentions.users.first();

            if(smecher) {
                const member = message.guild.member(smecher);

                if (member) {
                    member.kick('Nu profita de aceasta comanda !!').then(() => {
                        message.reply(`${smecher.tag} a primit kick cu succes !`);
                    }).catch(err => {
                        message.reply('Nu am permisiunea de ai da kick acelui membru!')
                        console.log(err);
                    });
                } else {
                    message.reply('Acel user nu este pe acest server !')
                }
            } else {
                message.reply('Trebuie sa specifici o persoana mai intai !')
            }
            break;
            
        case 'send':
            if(!message.member.roles.find(r => r.name === "MOD")) return message.reply("Nu ai permisiunea de a folosi aceasta comanda !")
            msg = message.content.toLowerCase();
    
            if(message.author.bot) return;
    
            mention = message.mentions.users.first();
    
    
            if (msg.startsWith (PREFIX + "send")) {
                if(mention == null) { return }
                message.delete();
                mentionMessage = message.content.slice (8);
                message.channel.send ("Done!");
            }
            break;
            
        case 'serverinfo':
            let serverEmbed = new RichEmbed()
            .setColor(0x2A1E33)
            .setTitle("Server INFO")
            .setThumbnail(message.guild.iconURL)
            .setAuthor(`${message.guild.name} INFO`, message.guild.iconURL)
            .addField("Guild Name", `${message.guild.name}`, true)
            .addField("Guild Owner:", `${message.guild.owner}`, true)
            .addField("Member Count:", `${message.guild.memberCount}`, true)
            .addField("Role Count:", `${message.guild.roles.size}`, true)
            .setFooter('Blux-BOT - created by FaNnN#7247', bot.user.displayAvatarURL);
            
            message.channel.send({embed: serverEmbed});
        break;
            
        case 'ping':
            message.reply("Pong!")
        break;

        case 'cat':
            
            let msg = await message.channel.send("Se cauta...");

            let {body} = await superagent
            .get(`http://aws.random.cat/meow`)
            //console.log(body.file)
            if(!{body}) return message.channel.send("Ceva nu a mers bine ! Incearca din nou.")

            let cEmbed2 = new RichEmbed()
            .setAuthor('Blux-BOT', message.guild.iconURL)
            .setImage(body.file)
            .setTimestamp()
            .setFooter('Blux-BOT - created by FaNnN#7247', bot.user.displayAvatarURL)

            message.channel.send(cEmbed2);

            msg.delete();
        break;
    }
});

bot.login(token);
