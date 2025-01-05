const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = "TOKEN";

function shuffleArray(array, times) {
  for (let t = 0; t < times; t++) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  return array;
}

const PREFIX = "!";

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("disconnect", async () => {
  console.log("Bot disconnected, attempting to reconnect in 3 seconds...");

  setTimeout(() => {
    client.login(TOKEN);
  }, 3000);
});

client.on("reconnecting", async () => {
  console.log("Bot is reconnecting...");
});

client.on("resume", async () => {
  console.log("Bot has reconnected!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  if (command === "maketeams") {
    try {
      const mentions = [];
      let index = 0;

      while (
        args[index] &&
        args[index].startsWith("<@") &&
        args[index].endsWith(">")
      ) {
        mentions.push(args[index].slice(2, -1));
        index++;
      }
      const playersPerTeam = parseInt(args[index]) || 5;
      const shuffleTimes = parseInt(args[index + 1]) || 3;
      const numberOfTeams = parseInt(args[index + 2]) || 2;

      if (mentions.length === 0) {
        return message.reply(
          "Please provide a list of users separated by space (e.g @z @str ...). Extra options: players per team (default to 5), amount of times to shuffle teams (default to 3), number of teams (default to 2)."
        );
      }
      if (numberOfTeams !== 1 && numberOfTeams < 2) {
        return message.reply("There must be at least 2 teams.");
      }
      if (numberOfTeams !== 1 && mentions.length < 2) {
        return message.reply(`There must be at least 2 players minimum.`);
      }
      if (numberOfTeams !== 1 && mentions.length < playersPerTeam) {
        return message.reply(
          `There must be at least ${playersPerTeam} players.`
        );
      }

      const shuffled = shuffleArray([...mentions], shuffleTimes);

      const teams = [];
      for (let i = 0; i < numberOfTeams; i++) {
        teams.push([]);
      }

      for (let i = 0; i < shuffled.length; i++) {
        const teamIndex = i % numberOfTeams;
        if (teams[teamIndex].length < playersPerTeam) {
          teams[teamIndex].push(`<@${shuffled[i]}>`);
        }
      }

      const teamOutput = teams
        .map((team, index) => {
          const teamName = `Team ${index + 1}`;
          return `**${teamName}**\n${team.join(", ")}`;
        })
        .join("\n\n");

      message.channel.send(`Teams created:\n\n${teamOutput}`);
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while creating the teams.");
    }
  }
});

client.login(TOKEN);
