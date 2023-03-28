require("dotenv").config();
const {
    Client,
    Events,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const datas = require("./datas.json");
const options = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
};
const client = new Client(options);
const sliceByNumber = (array, number) => {
    const length = Math.ceil(array.length / number);
    return new Array(length)
        .fill()
        .map((_, i) => array.slice(i * number, (i + 1) * number));
};
client.on(Events.ClientReady, () => {
    console.log("bot is ready!");
});
client.on(Events.MessageCreate, (message) => {
    if (
        message.author.id == "779945707997233162" &&
        message.content == "::sendSelectGame"
    ) {
        const embed = new EmbedBuilder();
        embed.setTitle("あなたが遊んでいるゲームを選択してください！");
        embed.setColor(0x059fa5);
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("valorant")
                .setLabel("Valorant")
                .setStyle(ButtonStyle.Success)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("apex")
                .setLabel("Apex")
                .setStyle(ButtonStyle.Danger)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("ow2")
                .setLabel("OW2")
                .setStyle(ButtonStyle.Primary)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("r6s")
                .setLabel("siege")
                .setStyle(ButtonStyle.Secondary)
        );
        message.channel.send({
            embeds: [embed],
            components: [row],
        });
    }
});
client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId in datas) {
        const data = datas[interaction.customId];
        if (interaction.member.roles.cache.has(data.id)) {
            interaction.member.roles.remove(data.id);
            for (const rank of data.ranks) {
                if (interaction.member.roles.cache.has(rank.id))
                    interaction.member.roles.remove(rank.id);
            }
            const embed = new EmbedBuilder();
            embed.setTitle(`\`${data.name}\` ロールを削除しました!`);
            embed.setColor(0xff0000);
            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        } else {
            interaction.member.roles.add(data.id);
            const embed = new EmbedBuilder();
            embed.setTitle(`\`${data.name}\` ロールを付与しました!`);
            embed.setDescription("下のボタンからランクを選んでください!");
            embed.setColor(0x059fa5);
            const components = [];
            for (const ranks of sliceByNumber(data.ranks, 5)) {
                const row = new ActionRowBuilder();
                for (const rank of ranks) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                "add:" + interaction.customId + ":" + rank.name
                            )
                            .setLabel(rank.name)
                            .setStyle(ButtonStyle.Primary)
                    );
                }
                components.push(row);
            }
            interaction.reply({
                embeds: [embed],
                components: components,
                ephemeral: true,
            });
        }
    } else {
        const [command, name, arg] = interaction.customId.split(":");
        if (command == "add") {
            if (!interaction.member.roles.cache.has(datas[name].id)) {
                const embed = new EmbedBuilder();
                embed.setTitle(`\`${name}\` ロールがついていません！`);
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
                return;
            }
            for (const rank of datas[name].ranks) {
                if (interaction.member.roles.cache.has(rank.id))
                    interaction.member.roles.remove(rank.id);
            }
            const data = datas[name].ranks.find((data) => data.name == arg);
            if (data == undefined) return interaction.reply("error");
            interaction.member.roles.add(data.id);
            const embed = new EmbedBuilder();
            embed.setTitle(`\`${data.name}\` ロールを付与しました!`);
            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    }
});
client.login(process.env.token);
